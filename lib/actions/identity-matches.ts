'use server'

/**
 * Person kimlik eşleşme kuyruğu (çift kayıt birleştirme).
 *
 * P1-03: düşük skor / isim uyuşmazlığında birleştirme kapalı;
 * kabul için alan diff özeti + onay ifadesi + (orta güvende) sahip onayı;
 * merge ledger + geri alma.
 */

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { ok, err, type ActionResult } from '@/lib/actions/result'
import { requirePermission } from '@/lib/session'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'
import { writeAuditLog } from '@/lib/audit'
import {
  IDENTITY_MERGE_CONFIRM_PHRASE,
  IDENTITY_MERGE_HIGH_CONFIDENCE,
  buildIdentityFieldDiff,
  buildMergeResultSummary,
  evaluateMergeEligibility,
  type IdentityFieldDiffRow,
  type IdentityPersonSnapshot,
  type MergeEligibility,
} from '@/lib/identity/match-policy'

const decideSchema = z.object({
  matchId: z.string().uuid(),
  decision: z.enum(['accept', 'reject']),
  /** Must equal IDENTITY_MERGE_CONFIRM_PHRASE for accept. */
  confirmPhrase: z.string().trim().optional(),
})

const undoSchema = z.object({
  ledgerId: z.string().uuid(),
})

export type PendingIdentityMatch = {
  id: string
  score: number
  method: string
  createdAt: string
  left: IdentityPersonSnapshot
  right: IdentityPersonSnapshot
  /** Distinct Person ids from this clinic involved in the pair (1–2). */
  clinicPersonLinks: number
  /** Clinic Patient rows that would re-point from right → left on accept. */
  clinicPatientMoves: number
  eligibility: MergeEligibility
  fieldDiff: IdentityFieldDiffRow[]
  mergeSummary: string
  requiresOwner: boolean
}

function isPrivilegedMerger(session: { isOwner: boolean; role: string }): boolean {
  return session.isOwner || session.role === 'ISLETME_SAHIBI' || session.role === 'SUPER_ADMIN'
}

/** Bu kliniğin Patient satırlarına dokunan bekleyen PersonIdentityMatch listesi. */
export async function listPendingIdentityMatches(): Promise<PendingIdentityMatch[]> {
  const session = await requirePermission('patient.edit')

  const clinicPatients = await prisma.patient.findMany({
    where: { businessId: session.businessId, personId: { not: null }, deletedAt: null },
    select: { id: true, personId: true },
    take: 5000,
  })
  const personIds = [...new Set(clinicPatients.map((p) => p.personId).filter(Boolean))] as string[]
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

  return rows.map((row) => {
    const score = Number(row.score)
    const left = row.leftPerson
    const right = row.rightPerson
    const eligibility = evaluateMergeEligibility({
      score,
      leftNameCanon: left.fullNameCanon,
      rightNameCanon: right.fullNameCanon,
    })
    const clinicPatientMoves = clinicPatients.filter(
      (p) => p.personId === row.rightPersonId,
    ).length
    return {
      id: row.id,
      score,
      method: row.method,
      createdAt: row.createdAt.toISOString(),
      left,
      right,
      clinicPersonLinks: personIds.filter(
        (id) => id === row.leftPersonId || id === row.rightPersonId,
      ).length,
      clinicPatientMoves,
      eligibility,
      fieldDiff: buildIdentityFieldDiff(left, right),
      mergeSummary: buildMergeResultSummary({
        left,
        right,
        score,
        clinicPatientMoves,
      }),
      requiresOwner: score < IDENTITY_MERGE_HIGH_CONFIDENCE,
    }
  })
}

/**
 * Accept: re-point clinic patients from right → left Person, soft-delete right if unused,
 * write merge ledger. Reject: mark decided without merge.
 */
export async function decideIdentityMatch(raw: unknown): Promise<ActionResult<{ ledgerId?: string }>> {
  const parsed = decideSchema.safeParse(raw)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requirePermission('patient.edit')

  const match = await runWithTenantBypassAsync('identity:match-decide', () =>
    prisma.personIdentityMatch.findFirst({
      where: { id: parsed.data.matchId, decidedAt: null },
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
  if (!match) return err('Eşleşme bulunamadı veya karar verilmiş')

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
      metadata: { score: Number(match.score) },
    })
    revalidatePath('/dashboard/kimlik-eslesmeleri')
    return ok({})
  }

  const score = Number(match.score)
  const eligibility = evaluateMergeEligibility({
    score,
    leftNameCanon: match.leftPerson.fullNameCanon,
    rightNameCanon: match.rightPerson.fullNameCanon,
  })
  if (!eligibility.canMerge) {
    return err(eligibility.blockers[0] ?? 'Bu eşleşme birleştirilemez')
  }

  if (score < IDENTITY_MERGE_HIGH_CONFIDENCE && !isPrivilegedMerger(session)) {
    return err('Orta güven skorunda birleştirme için işletme sahibi onayı gerekir (dört göz).')
  }

  if (parsed.data.confirmPhrase !== IDENTITY_MERGE_CONFIRM_PHRASE) {
    return err(`Birleştirmek için onay ifadesini yazın: ${IDENTITY_MERGE_CONFIRM_PHRASE}`)
  }

  const patientsToMove = await prisma.patient.findMany({
    where: {
      businessId: session.businessId,
      personId: match.rightPersonId,
      deletedAt: null,
    },
    select: { id: true },
    take: 500,
  })
  const patientIdsMoved = patientsToMove.map((p) => p.id)
  const summaryText = buildMergeResultSummary({
    left: match.leftPerson,
    right: match.rightPerson,
    score,
    clinicPatientMoves: patientIdsMoved.length,
  })

  const ledgerId = await runWithTenantBypassAsync('identity:match-decide', async () => {
    return prisma.$transaction(async (tx) => {
      if (patientIdsMoved.length > 0) {
        await tx.patient.updateMany({
          where: {
            businessId: session.businessId,
            personId: match.rightPersonId,
            id: { in: patientIdsMoved },
          },
          data: { personId: match.leftPersonId },
        })
      }

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

      const ledger = await tx.personIdentityMergeLedger.create({
        data: {
          businessId: session.businessId,
          matchId: match.id,
          leftPersonId: match.leftPersonId,
          rightPersonId: match.rightPersonId,
          score,
          patientIdsMoved,
          summary: {
            text: summaryText,
            fieldDiff: buildIdentityFieldDiff(match.leftPerson, match.rightPerson),
            acceptedByRole: session.role,
            fourEyes: isPrivilegedMerger(session),
          },
          acceptedBy: session.userId,
        },
        select: { id: true },
      })

      return ledger.id
    })
  })

  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'identity.match.accept',
    entityType: 'PersonIdentityMergeLedger',
    entityId: ledgerId,
    severity: 'WARN',
    summary: 'Kimlik eşleşmesi kabul edildi (klinik Person birleştirildi)',
    metadata: {
      matchId: match.id,
      leftPersonId: match.leftPersonId,
      rightPersonId: match.rightPersonId,
      score,
      patientIdsMovedCount: patientIdsMoved.length,
      fourEyes: isPrivilegedMerger(session),
    },
  })

  revalidatePath('/dashboard/kimlik-eslesmeleri')
  revalidatePath('/dashboard/hastalar')
  return ok({ ledgerId })
}

export type RecentIdentityMerge = {
  id: string
  matchId: string
  score: number
  acceptedAt: string
  patientIdsMovedCount: number
  summaryText: string
  canUndo: boolean
}

/** Recent clinic merges available for undo (owner / işletme sahibi). */
export async function listRecentIdentityMerges(): Promise<RecentIdentityMerge[]> {
  const session = await requirePermission('patient.edit')
  const canUndo = isPrivilegedMerger(session)
  const rows = await prisma.personIdentityMergeLedger.findMany({
    where: { businessId: session.businessId, undoneAt: null },
    orderBy: { acceptedAt: 'desc' },
    take: 20,
    select: {
      id: true,
      matchId: true,
      score: true,
      acceptedAt: true,
      patientIdsMoved: true,
      summary: true,
    },
  })
  return rows.map((row) => {
    const summary = row.summary as { text?: string } | null
    return {
      id: row.id,
      matchId: row.matchId,
      score: Number(row.score),
      acceptedAt: row.acceptedAt.toISOString(),
      patientIdsMovedCount: row.patientIdsMoved.length,
      summaryText: summary?.text ?? 'Birleştirme kaydı',
      canUndo,
    }
  })
}

/** Undo clinic-local patient re-point from a merge ledger (four-eyes / owner). */
export async function undoIdentityMerge(raw: unknown): Promise<ActionResult> {
  const parsed = undoSchema.safeParse(raw)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requirePermission('patient.edit')
  if (!isPrivilegedMerger(session)) {
    return err('Birleştirmeyi geri almak için işletme sahibi yetkisi gerekir')
  }

  const ledger = await prisma.personIdentityMergeLedger.findFirst({
    where: {
      id: parsed.data.ledgerId,
      businessId: session.businessId,
      undoneAt: null,
    },
  })
  if (!ledger) return err('Birleştirme kaydı bulunamadı veya zaten geri alınmış')

  await runWithTenantBypassAsync('identity:match-undo', async () => {
    await prisma.$transaction(async (tx) => {
      if (ledger.patientIdsMoved.length > 0) {
        await tx.patient.updateMany({
          where: {
            businessId: session.businessId,
            id: { in: ledger.patientIdsMoved },
            personId: ledger.leftPersonId,
          },
          data: { personId: ledger.rightPersonId },
        })
      }

      // Restore soft-deleted right Person if we deleted it and it is still soft-deleted.
      await tx.person.updateMany({
        where: { id: ledger.rightPersonId, deletedAt: { not: null } },
        data: { deletedAt: null },
      })

      await tx.personIdentityMergeLedger.update({
        where: { id: ledger.id },
        data: { undoneAt: new Date(), undoneBy: session.userId },
      })
    })
  })

  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'identity.match.undo',
    entityType: 'PersonIdentityMergeLedger',
    entityId: ledger.id,
    severity: 'WARN',
    summary: 'Kimlik birleştirmesi geri alındı',
    metadata: {
      matchId: ledger.matchId,
      leftPersonId: ledger.leftPersonId,
      rightPersonId: ledger.rightPersonId,
      patientIdsMovedCount: ledger.patientIdsMoved.length,
    },
  })

  revalidatePath('/dashboard/kimlik-eslesmeleri')
  revalidatePath('/dashboard/hastalar')
  return ok(undefined)
}
