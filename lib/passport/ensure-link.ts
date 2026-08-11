import 'server-only'

import { prisma } from '@/lib/prisma'
import { clientIdentityPrisma } from '@/lib/prisma-owner'
import { resolveOrCreatePerson } from '@/lib/identity/resolve'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'

async function safeResetRole(tx: { $executeRawUnsafe: (sql: string) => Promise<unknown> }) {
  try {
    await tx.$executeRawUnsafe(`RESET ROLE`)
  } catch {
    // Transaction already aborted.
  }
}

async function readPersonGpi(personId: string): Promise<{ personId: string; gpiDisplay: string } | null> {
  return runWithTenantBypassAsync('passport:read-gpi', async () => {
    return prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE asistan_identity`)
      try {
        const person = await tx.person.findFirst({
          where: { id: personId, deletedAt: null },
          select: { id: true, gpiDisplay: true },
        })
        return person ? { personId: person.id, gpiDisplay: person.gpiDisplay } : null
      } finally {
        await safeResetRole(tx)
      }
    })
  })
}

/**
 * Ensure ClientUser has Person (GPI). Soft-fail when no contact signal.
 *
 * Sadece doğrulanmış client oturumu (requireClientAuth) sonrası çağrılmalı —
 * e-posta/telefon metniyle sessiz Person birleştirme hasta yüzünde kapı değildir;
 * skor kapısı `resolveOrCreatePerson` içinde kalır, staff kuyruğu zayıf eşleşmeler içindir.
 */
export async function ensureClientUserPersonLink(input: {
  clientUserId: string
  fullName: string
  phone?: string | null
  email?: string | null
}): Promise<{ personId: string; gpiDisplay: string } | null> {
  try {
    // ClientUser identity reads/writes — owner/migrate when asistan_app lacks RLS policy.
    const identityDb = clientIdentityPrisma()
    const existing = await identityDb.clientUser.findFirst({
      where: { id: input.clientUserId, deletedAt: null },
      select: {
        id: true,
        personId: true,
        phone: true,
        email: true,
        fullName: true,
      },
    })
    if (!existing) return null

    if (existing.personId) {
      return readPersonGpi(existing.personId)
    }

    const phone = (input.phone || existing.phone || '').trim()
    const email = (input.email ?? existing.email)?.trim() || null
    if (!phone && !email) return null

    return await runWithTenantBypassAsync('passport:link-client-user', async () => {
      const resolved = await prisma.$transaction(async (tx) => {
        return resolveOrCreatePerson(tx, {
          fullName: input.fullName || existing.fullName,
          phone, // may be ''; normalize → null; email-only still works
          email,
        })
      })
      await identityDb.clientUser.update({
        where: { id: existing.id },
        data: { personId: resolved.personId },
      })
      return { personId: resolved.personId, gpiDisplay: resolved.gpiDisplay }
    })
  } catch (error) {
    console.error('[ensureClientUserPersonLink] soft-fail', error)
    return null
  }
}
