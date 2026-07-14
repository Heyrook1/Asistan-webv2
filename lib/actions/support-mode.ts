'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/prisma'
import { requireSuperAdminSession } from '@/lib/session'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { SUPPORT_BUSINESS_COOKIE } from '@/lib/support-mode'
import { writeAuditLog } from '@/lib/audit'
import { err, ok, type ActionResult } from '@/lib/actions/result'

export async function startSupportMode(businessId: string): Promise<ActionResult> {
  if (!isFeatureEnabled('supportMode')) return err('Support mode kapalı')
  const session = await requireSuperAdminSession()
  if (!/^[0-9a-f-]{36}$/i.test(businessId)) {
    return err('Geçersiz klinik kimliği')
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true },
  })
  if (!business) return err('Klinik bulunamadı')

  const jar = await cookies()
  jar.set(SUPPORT_BUSINESS_COOKIE, business.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  await writeAuditLog({
    businessId: business.id,
    actorUserId: session.userId,
    action: 'support.mode.start',
    entityType: 'Business',
    entityId: business.id,
    severity: 'WARN',
    summary: `Support mode: ${business.name}`,
  })

  revalidatePath('/dashboard')
  return ok({ businessId: business.id, businessName: business.name })
}

export async function stopSupportMode(): Promise<ActionResult> {
  const session = await requireSuperAdminSession()
  const jar = await cookies()
  const current = jar.get(SUPPORT_BUSINESS_COOKIE)?.value
  jar.delete(SUPPORT_BUSINESS_COOKIE)

  if (current) {
    await writeAuditLog({
      businessId: current,
      actorUserId: session.userId,
      action: 'support.mode.stop',
      entityType: 'Business',
      entityId: current,
      severity: 'INFO',
      summary: 'Support mode sonlandırıldı',
    })
  }

  revalidatePath('/dashboard')
  return ok(undefined)
}
