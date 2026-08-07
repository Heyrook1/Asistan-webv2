'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { ConsentType, DataDeletionStatus } from '@prisma/client'

import { writeAuditLog } from '@/lib/audit'
import { prisma } from '@/lib/prisma'
import { requireSuperAdminSession } from '@/lib/session'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'
import { ok, err, type ActionResult } from '@/lib/actions/result'

const deletionCreateSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
  patientId: z.string().uuid().optional(),
})

const deletionProcessSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['IN_REVIEW', 'COMPLETED', 'REJECTED']),
  notes: z.string().trim().max(2000).optional(),
})

const consentSchema = z.object({
  consentType: z.nativeEnum(ConsentType),
  version: z.string().trim().min(1).max(40),
  granted: z.boolean(),
})

const complianceDocSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(200),
  category: z.string().trim().min(2).max(80),
  version: z.string().trim().min(1).max(40),
  status: z.enum(['ACTIVE', 'DRAFT', 'EXPIRED', 'ARCHIVED']).default('ACTIVE'),
  fileUrl: z.string().url().max(2000).optional(),
  notes: z.string().trim().max(2000).optional(),
  expiresAt: z.string().datetime().optional(),
})

export async function createDataDeletionRequest(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = deletionCreateSchema.safeParse(input)
  if (!parsed.success) return err('Silme talebi geçersiz', parsed.error.issues)

  const session = await requireSuperAdminSession()

  if (parsed.data.patientId) {
    const patient = await runWithTenantBypassAsync('governance:patient-lookup', () =>
      prisma.patient.findFirst({
        where: { id: parsed.data.patientId },
        select: { id: true, businessId: true },
      })
    )
    if (!patient) return err('Hasta bulunamadı')

    const request = await prisma.dataDeletionRequest.create({
      data: {
        businessId: patient.businessId,
        userId: session.userId,
        patientId: parsed.data.patientId,
        reason: parsed.data.reason ?? null,
        status: DataDeletionStatus.PENDING,
      },
    })

    await writeAuditLog({
      businessId: patient.businessId,
      actorUserId: session.userId,
      action: 'deletion.request.create',
      entityType: 'DataDeletionRequest',
      entityId: request.id,
      severity: 'WARN',
      summary: 'KVKK veri silme talebi oluşturuldu',
      metadata: {
        patientId: parsed.data.patientId,
        reason: parsed.data.reason ?? null,
      },
    })

    revalidatePath('/dashboard/yonetisim')
    return ok({ id: request.id })
  }

  const request = await prisma.dataDeletionRequest.create({
    data: {
      businessId: session.businessId,
      userId: session.userId,
      reason: parsed.data.reason ?? null,
      status: DataDeletionStatus.PENDING,
    },
  })

  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'deletion.request.create',
    entityType: 'DataDeletionRequest',
    entityId: request.id,
    severity: 'WARN',
    summary: 'KVKK veri silme talebi oluşturuldu',
    metadata: {
      patientId: null,
      reason: parsed.data.reason ?? null,
    },
  })

  revalidatePath('/dashboard/yonetisim')
  return ok({ id: request.id })
}

export async function processDataDeletionRequest(input: unknown): Promise<ActionResult> {
  const parsed = deletionProcessSchema.safeParse(input)
  if (!parsed.success) return err('İşlem geçersiz', parsed.error.issues)

  const session = await requireSuperAdminSession()
  const existing = await runWithTenantBypassAsync('governance:deletion-process', () =>
    prisma.dataDeletionRequest.findFirst({
      where: { id: parsed.data.id },
    })
  )
  if (!existing) return err('Silme talebi bulunamadı')

  await runWithTenantBypassAsync('governance:deletion-process', () =>
    prisma.dataDeletionRequest.updateMany({
      where: {
        id: existing.id,
        ...(existing.businessId ? { businessId: existing.businessId } : {}),
      },
      data: {
        status: parsed.data.status as DataDeletionStatus,
        notes: parsed.data.notes ?? existing.notes,
        processedAt: new Date(),
        processedById: session.userId,
      },
    })
  )

  if (parsed.data.status === 'COMPLETED' && existing.patientId) {
    await runWithTenantBypassAsync('governance:deletion-process', () =>
      prisma.patient.updateMany({
        where: {
          id: existing.patientId!,
          ...(existing.businessId ? { businessId: existing.businessId } : {}),
        },
        data: {
          isArchived: true,
          deletedAt: new Date(),
          phone: 'SILINDI',
          email: null,
          identityNumber: null,
          address: null,
          emergencyContactName: null,
          emergencyContactPhone: null,
          patientStory: null,
          summary: null,
          riskNote: null,
        },
      })
    )
  }

  await writeAuditLog({
    businessId: existing.businessId,
    actorUserId: session.userId,
    action: 'deletion.request.process',
    entityType: 'DataDeletionRequest',
    entityId: existing.id,
    severity: parsed.data.status === 'COMPLETED' ? 'CRITICAL' : 'WARN',
    summary: `Silme talebi ${parsed.data.status} olarak işlendi`,
    metadata: {
      previousStatus: existing.status,
      nextStatus: parsed.data.status,
      patientId: existing.patientId,
      notes: parsed.data.notes ?? null,
    },
  })

  revalidatePath('/dashboard/yonetisim')
  revalidatePath('/dashboard/hastalar')
  return ok(undefined)
}

export async function recordUserConsent(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = consentSchema.safeParse(input)
  if (!parsed.success) return err('Rıza kaydı geçersiz', parsed.error.issues)

  const session = await requireSuperAdminSession()
  const consent = await prisma.userConsent.create({
    data: {
      userId: session.userId,
      consentType: parsed.data.consentType,
      version: parsed.data.version,
      granted: parsed.data.granted,
      revokedAt: parsed.data.granted ? null : new Date(),
    },
  })

  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'consent.record',
    entityType: 'UserConsent',
    entityId: consent.id,
    summary: `${parsed.data.consentType} rızası ${parsed.data.granted ? 'verildi' : 'geri alındı'}`,
    metadata: {
      consentType: parsed.data.consentType,
      version: parsed.data.version,
      granted: parsed.data.granted,
    },
  })

  revalidatePath('/dashboard/yonetisim')
  return ok({ id: consent.id })
}

export async function upsertComplianceDocument(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = complianceDocSchema.safeParse(input)
  if (!parsed.success) return err('Belge bilgileri geçersiz', parsed.error.issues)

  const session = await requireSuperAdminSession()
  const data = {
    businessId: session.businessId,
    title: parsed.data.title,
    category: parsed.data.category,
    version: parsed.data.version,
    status: parsed.data.status,
    fileUrl: parsed.data.fileUrl ?? null,
    notes: parsed.data.notes ?? null,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
  }

  try {
    const doc = parsed.data.id
      ? await prisma.complianceDocument
          .updateMany({
            where: { id: parsed.data.id, businessId: session.businessId },
            data: {
              title: data.title,
              category: data.category,
              version: data.version,
              status: data.status,
              fileUrl: data.fileUrl,
              notes: data.notes,
              expiresAt: data.expiresAt,
            },
          })
          .then(async (result) => {
            if (result.count === 0) return null
            return prisma.complianceDocument.findFirst({
              where: { id: parsed.data.id!, businessId: session.businessId },
            })
          })
      : await prisma.complianceDocument.create({ data })

    if (!doc) return err('Belge bulunamadı')

    await writeAuditLog({
      businessId: session.businessId,
      actorUserId: session.userId,
      action: 'compliance.document.upsert',
      entityType: 'ComplianceDocument',
      entityId: doc.id,
      summary: `Uyumluluk belgesi kaydedildi: ${doc.title}`,
      metadata: {
        category: doc.category,
        version: doc.version,
        status: doc.status,
      },
    })

    revalidatePath('/dashboard/yonetisim')
    return ok({ id: doc.id })
  } catch {
    return err('Belge kaydedilemedi')
  }
}
