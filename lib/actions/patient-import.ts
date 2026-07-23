'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { TimelineEventType, type Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { tenantTransaction } from '@/lib/security/tenant-db-context'
import { writeAuditLog } from '@/lib/audit'
import { requirePermission } from '@/lib/session'
import { resolveOrCreatePerson } from '@/lib/identity/resolve'
import { ok, err, type ActionResult } from '@/lib/actions/result'
import {
  flagDuplicatePhonesInCsv,
  parsePatientCsv,
  phoneMatchCandidates,
  PATIENT_IMPORT_MAX_ROWS,
  type PatientImportDraft,
} from '@/lib/patients/csv-import'

const importInputSchema = z.object({
  csvText: z.string().min(1).max(2_000_000),
  skipDuplicatePhones: z.boolean().optional().default(true),
})

export type PatientImportSummary = {
  created: number
  skippedDuplicates: number
  failed: number
  totalRows: number
  createdIds: string[]
  errors: Array<{ row: number; error: string }>
}

async function nextPatientNumber(tx: Prisma.TransactionClient, businessId: string) {
  const rows = await tx.$queryRaw<Array<{ next_patient_number: string }>>`
    select public.next_patient_number(${businessId}) as next_patient_number
  `
  const patientNumber = rows[0]?.next_patient_number
  if (!patientNumber) throw new Error('Hasta numarası üretilemedi')
  return patientNumber
}

function toDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : null
}

async function findClinicPatientByPhone(businessId: string, phone: string) {
  const candidates = phoneMatchCandidates(phone)
  if (candidates.length === 0) return null
  return prisma.patient.findFirst({
    where: {
      businessId,
      isArchived: false,
      phone: { in: candidates },
    },
    select: { id: true },
  })
}

/**
 * Bulk-create clinic patients from CSV text.
 * Reuses Person identity resolution; skips existing clinic phones when requested.
 */
export async function importPatientsFromCsv(
  rawInput: unknown
): Promise<ActionResult<PatientImportSummary>> {
  const parsedInput = importInputSchema.safeParse(rawInput)
  if (!parsedInput.success) return err('CSV metni geçersiz veya çok büyük')

  const session = await requirePermission('patient.create')
  const businessId = session.businessId
  const { csvText, skipDuplicatePhones } = parsedInput.data

  const parsed = parsePatientCsv(csvText)
  if ('error' in parsed) return err(parsed.error)

  const rows = flagDuplicatePhonesInCsv(parsed.rows)
  const summary: PatientImportSummary = {
    created: 0,
    skippedDuplicates: 0,
    failed: 0,
    totalRows: rows.length,
    createdIds: [],
    errors: [],
  }

  for (const row of rows) {
    if (!row.ok) {
      summary.failed++
      summary.errors.push({ row: row.row, error: row.error })
      continue
    }

    try {
      const outcome = await createImportedPatient({
        businessId,
        actorUserId: session.userId,
        actorName: session.fullName,
        draft: row.draft,
        skipDuplicatePhones,
      })
      if (outcome === 'duplicate') {
        summary.skippedDuplicates++
        summary.errors.push({
          row: row.row,
          error: 'Bu telefona sahip hasta zaten klinik kaydında — atlandı',
        })
        continue
      }
      summary.created++
      summary.createdIds.push(outcome.id)
    } catch (e) {
      summary.failed++
      summary.errors.push({
        row: row.row,
        error: e instanceof Error ? e.message : 'Satır kaydedilemedi',
      })
    }
  }

  if (summary.created > 0) {
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/hastalar')
    await writeAuditLog({
      businessId,
      actorUserId: session.userId,
      action: 'patient.import',
      entityType: 'Patient',
      entityId: businessId,
      summary: `CSV ile ${summary.created} hasta içe aktarıldı (${summary.skippedDuplicates} mükerrer, ${summary.failed} hata)`,
      metadata: {
        created: summary.created,
        skippedDuplicates: summary.skippedDuplicates,
        failed: summary.failed,
        totalRows: summary.totalRows,
        maxRows: PATIENT_IMPORT_MAX_ROWS,
      },
    })
  }

  return ok(summary)
}

async function createImportedPatient(args: {
  businessId: string
  actorUserId: string
  actorName: string
  draft: PatientImportDraft
  skipDuplicatePhones: boolean
}): Promise<{ id: string } | 'duplicate'> {
  const { businessId, actorUserId, actorName, draft, skipDuplicatePhones } = args

  if (skipDuplicatePhones) {
    const existing = await findClinicPatientByPhone(businessId, draft.phone)
    if (existing) return 'duplicate'
  }

  return tenantTransaction(businessId, async (tx) => {
    if (skipDuplicatePhones) {
      const candidates = phoneMatchCandidates(draft.phone)
      const again = await tx.patient.findFirst({
        where: {
          businessId,
          isArchived: false,
          phone: { in: candidates },
        },
        select: { id: true },
      })
      if (again) return 'duplicate' as const
    }

    const { personId } = await resolveOrCreatePerson(tx, {
      fullName: draft.fullName,
      phone: draft.phone,
      email: draft.email ?? null,
      identityNumber: draft.identityNumber ?? null,
      birthDate: toDate(draft.birthDate),
    })
    const patientNumber = await nextPatientNumber(tx, businessId)
    const created = await tx.patient.create({
      data: {
        businessId,
        personId,
        patientNumber,
        fullName: draft.fullName,
        identityNumber: draft.identityNumber ?? null,
        birthDate: toDate(draft.birthDate),
        gender: draft.gender ?? null,
        bloodType: draft.bloodType ?? null,
        phone: draft.phone,
        email: draft.email ?? null,
        address: draft.address ?? null,
        city: draft.city ?? null,
        emergencyContactName: draft.emergencyContactName ?? null,
        emergencyContactPhone: draft.emergencyContactPhone ?? null,
        occupation: draft.occupation ?? null,
        insuranceProvider: draft.insuranceProvider ?? null,
        tags: draft.tags ?? [],
      },
    })

    await tx.timelineEvent.create({
      data: {
        businessId,
        patientId: created.id,
        type: TimelineEventType.PATIENT_CREATED,
        title: 'Hasta CSV ile içe aktarıldı',
        description: `${created.fullName} kaydedildi (#${created.patientNumber}).`,
        actorName,
        actorId: actorUserId,
      },
    })

    return { id: created.id }
  })
}
