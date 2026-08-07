'use server'

/**
 * Person kimlik eşleşme kuyruğu (çift kayıt birleştirme).
 *
 * Klinik `patient.edit` ile pending match listeler / accept|reject.
 * Accept: Person merge; soft-delete yalnızca başka klinik Patient
 * üyeliği kalmadığında — ecosystem Person passport’u bozmamak için.
 */

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { ok, err, type ActionResult } from '@/lib/actions/result'
import { requirePermission } from '@/lib/session'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'
import { writeAuditLog } from '@/lib/audit'

const decideSchema = z.object({
  matchId: z.string().uuid(),
  decision: z.enum(['accept', 'reject']),
})

export type PendingIdentityMatch = {
  id: string
  score: number
  method: string
  createdAt: string
  left: { id: string; gpiDisplay: string; fullNameCanon: string; phoneE164: string | null; emailNorm: string | null }
  right: { id: string; gpiDisplay: string; fullNameCanon: string; phoneE164: string | null; emailNorm: string | null }
  clinicPatientCount: number
}

/** Bu kliniğin Patient satırlarına dokunan bekleyen PersonIdentityMatch listesi. */
export async function listPendingIdentityMatches(): Promise<PendingIdentityMatch[]> {
  const session = await requirePermission('patient.edit')

  const clinicPersonIds = await prisma.patient.findMany({
    where: { businessId: session.businessId, personId: { not: null }, deletedAt: null },
    select: { personId: true },
    take: 5000,
  })
  const personIds = [...new Set(clinicPersonIds.map((p) => p.personId).filter(Boolean))] as string[]
  if (personIds.length === 0) return []

  const rows = await runWithTenantBypassAsync('identity:match-queue', () =>
    prisma.personIdentityMatch.findMany({
      where: {
        decidedAt: null,
        OR: [{ leftPersonId: { in: personIds } }, { rightPersonId: { in: personIds } }],
      },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
      take: 50,
      include: {
        leftPerson: {
          select: {
            id: true,
            gpiDisplay: true,
            fullNameCanon: true,
            phoneE164: true,
            emailNorm: true,
          },
        },
        rightPerson: {
          select: {
            id: true,
            gpiDisplay: true,
            fullNameCanon: true,
            phoneE164: true,
            emailNorm: true,
          },
        },
      },
    }),
  )

  return rows.map((row) => ({
    id: row.id,
    score: Number(row.score),
    method: row.method,
    createdAt: row.createdAt.toISOString(),
    left: row.leftPerson,
    right: row.rightPerson,
    clinicPatientCount: personIds.filter(
      (id) => id === row.leftPersonId || id === row.rightPersonId,
    ).length,
  }))
}

/**
 * Accept: re-point clinic patients from right → left Person, soft-delete right, mark decided.
 * Reject: mark decided without merge.
 */
export async function decideIdentityMatch(raw: unknown): Promise<ActionResult> {
  const parsed = decideSchema.safeParse(raw)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requirePermission('patient.edit')

  const match = await runWithTenantBypassAsync('identity:match-decide', () =>
    prisma.personIdentityMatch.findFirst({
      where: { id: parsed.data.matchId, decidedAt: null },
    }),
  )
  if (!match) return err('Eşleşme bulunamadı veya karar verilmiş')

  // Clinic must own at least one patient on either side.
  const owned = await prisma.patient.count({
    where: {
      businessId: session.businessId,
      personId: { in: [match.leftPersonId, match.rightPersonId] },
      deletedAt: null,
    },
  })
  if (owned === 0) return err('Bu eşleşme bu klinik için değil')

  if (parsed.data.decision === 'reject') {
    await runWithTenantBypassAsync('identity:match-decide', () =>
      prisma.personIdentityMatch.update({
        where: { id: match.id },
        data: {
          decidedAt: new Date(),
          decidedBy: session.userId,
          method: `${match.method}|reject`,
        },
      }),
    )
    await writeAuditLog({
      businessId: session.businessId,
      actorUserId: session.userId,
      action: 'identity.match.reject',
      entityType: 'PersonIdentityMatch',
      entityId: match.id,
      summary: 'Kimlik eşleşmesi reddedildi',
    })
    revalidatePath('/dashboard/kimlik-eslesmeleri')
    return ok(undefined)
  }

  // Accept merge: keep left, fold right into left for this clinic's patients only.
  // Soft-delete right Person only when no other clinic still references it.
  await runWithTenantBypassAsync('identity:match-decide', async () => {
    await prisma.$transaction(async (tx) => {
      await tx.patient.updateMany({
        where: {
          businessId: session.businessId,
          personId: match.rightPersonId,
        },
        data: { personId: match.leftPersonId },
      })

      const remainingElsewhere = await tx.patient.count({
        where: {
          personId: match.rightPersonId,
          businessId: { not: session.businessId },
          deletedAt: null,
        },
      })

      if (remainingElsewhere === 0) {
        await tx.person.update({
          where: { id: match.rightPersonId },
          data: { deletedAt: new Date() },
        })
      }

      await tx.personIdentityMatch.update({
        where: { id: match.id },
        data: {
          decidedAt: new Date(),
          decidedBy: session.userId,
          method: `${match.method}|accept`,
        },
      })
    })
  })

  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'identity.match.accept',
    entityType: 'PersonIdentityMatch',
    entityId: match.id,
    summary: 'Kimlik eşleşmesi kabul edildi (klinik Person birleştirildi)',
    metadata: { leftPersonId: match.leftPersonId, rightPersonId: match.rightPersonId },
  })

  revalidatePath('/dashboard/kimlik-eslesmeleri')
  revalidatePath('/dashboard/hastalar')
  return ok(undefined)
}
