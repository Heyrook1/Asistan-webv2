'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { Prisma, TimelineEventType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requirePermission, requireSession } from '@/lib/session'
import { ok, err, type ActionResult } from './result'

const optionalString = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().trim().min(1).max(2000).optional()
)
const optionalLongString = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().trim().min(1).max(10_000).optional()
)
const optionalDate = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih yyyy-mm-dd formatında olmalı')
    .optional()
)

const allergyInput = z.object({
  name: z.string().trim().min(1).max(120),
  severity: z.enum(['HAFIF', 'ORTA', 'SIDDETLI']).default('ORTA'),
  reaction: optionalString,
  notes: optionalString,
})

const medicationInput = z.object({
  name: z.string().trim().min(1).max(200),
  dosage: optionalString,
  frequency: optionalString,
  startDate: optionalDate,
  endDate: optionalDate,
  notes: optionalString,
})

const treatmentInput = z.object({
  title: z.string().trim().min(1).max(200),
  description: optionalString,
  doctorName: optionalString,
  startDate: optionalDate,
  endDate: optionalDate,
  status: z.enum(['PLANLANDI', 'DEVAM_EDIYOR', 'TAMAMLANDI', 'IPTAL']).default('PLANLANDI'),
  cost: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().min(0).max(10_000_000).optional()
  ),
  notes: optionalString,
})

const labResultInput = z.object({
  title: z.string().trim().min(1).max(200),
  description: optionalString,
  resultDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih yyyy-mm-dd formatında olmalı'),
  labName: optionalString,
  fileUrl: optionalString,
  notes: optionalString,
})

const noteInput = z.object({
  title: z.string().trim().min(1).max(200),
  note: z.string().trim().min(1).max(10_000),
  isPinned: z.boolean().optional().default(false),
})

const fileInput = z.object({
  fileName: z.string().trim().min(1).max(300),
  fileType: z.string().trim().min(1).max(120),
  fileSize: z.number().int().min(0).optional(),
  category: z.enum(['TAHLIL', 'GORUNTU', 'RECETE', 'RAPOR', 'KIMLIK', 'DIGER']).default('DIGER'),
  storageKey: z.string().min(1).max(1000),
  fileUrl: z.string().regex(/^storage:\/\/patient-files\/.+$/, 'Geçersiz dosya referansı'),
  description: optionalString,
})

const createPatientSchema = z.object({
  fullName: z.string().trim().min(2, 'Ad soyad en az 2 karakter olmalı').max(120),
  identityNumber: optionalString,
  birthDate: optionalDate,
  gender: optionalString,
  bloodType: optionalString,
  phone: z.string().trim().min(7, 'Telefon zorunlu').max(40),
  email: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().email('Geçersiz e-posta').optional()
  ),
  address: optionalString,
  city: optionalString,
  emergencyContactName: optionalString,
  emergencyContactPhone: optionalString,
  occupation: optionalString,
  insuranceProvider: optionalString,
  chronicDiseases: optionalLongString,
  familyHistory: optionalLongString,
  patientStory: optionalLongString,
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  // Optional initial collections (registration wizard)
  allergies: z.array(allergyInput).optional().default([]),
  medications: z.array(medicationInput).optional().default([]),
  treatments: z.array(treatmentInput).optional().default([]),
  labResults: z.array(labResultInput).optional().default([]),
  notes: z.array(noteInput).optional().default([]),
  files: z.array(fileInput).optional().default([]),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>

function toDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : null
}

async function nextPatientNumber(businessId: string) {
  // Format: HST-1024. Starts from 1000 so the number reads like a real chart id.
  // For hot multi-tenant inserts, switch to a Postgres sequence per-business.
  const count = await prisma.patient.count({ where: { businessId } })
  return `HST-${1000 + count + 1}`
}

async function isPatientOwned(patientId: string, businessId: string) {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, businessId },
    select: { id: true },
  })
  return Boolean(patient)
}

export async function createPatient(rawInput: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createPatientSchema.safeParse(rawInput)
  if (!parsed.success) return err('Form bilgileri eksik veya hatalı', parsed.error.issues)
  const input = parsed.data

  const session = await requirePermission('patient.edit')
  const businessId = session.businessId
  const patientNumber = await nextPatientNumber(businessId)

  try {
    const patient = await prisma.$transaction(async (tx) => {
      const created = await tx.patient.create({
        data: {
          businessId,
          patientNumber,
          fullName: input.fullName,
          identityNumber: input.identityNumber ?? null,
          birthDate: toDate(input.birthDate),
          gender: input.gender ?? null,
          bloodType: input.bloodType ?? null,
          phone: input.phone,
          email: input.email ?? null,
          address: input.address ?? null,
          city: input.city ?? null,
          emergencyContactName: input.emergencyContactName ?? null,
          emergencyContactPhone: input.emergencyContactPhone ?? null,
          occupation: input.occupation ?? null,
          insuranceProvider: input.insuranceProvider ?? null,
          chronicDiseases: input.chronicDiseases ?? null,
          familyHistory: input.familyHistory ?? null,
          patientStory: input.patientStory ?? null,
          tags: input.tags ?? [],
        },
      })

      if (input.allergies.length) {
        await tx.allergy.createMany({
          data: input.allergies.map((a) => ({
            businessId,
            patientId: created.id,
            name: a.name,
            severity: a.severity,
            reaction: a.reaction ?? null,
            notes: a.notes ?? null,
          })),
        })
      }
      if (input.medications.length) {
        await tx.medication.createMany({
          data: input.medications.map((m) => ({
            businessId,
            patientId: created.id,
            name: m.name,
            dosage: m.dosage ?? null,
            frequency: m.frequency ?? null,
            startDate: toDate(m.startDate),
            endDate: toDate(m.endDate),
            notes: m.notes ?? null,
          })),
        })
      }
      if (input.treatments.length) {
        await tx.treatment.createMany({
          data: input.treatments.map((t) => ({
            businessId,
            patientId: created.id,
            title: t.title,
            description: t.description ?? null,
            doctorName: t.doctorName ?? null,
            startDate: toDate(t.startDate),
            endDate: toDate(t.endDate),
            status: t.status,
            cost: t.cost == null ? null : new Prisma.Decimal(t.cost),
            notes: t.notes ?? null,
          })),
        })
      }
      if (input.labResults.length) {
        await tx.labResult.createMany({
          data: input.labResults.map((l) => ({
            businessId,
            patientId: created.id,
            title: l.title,
            description: l.description ?? null,
            resultDate: new Date(`${l.resultDate}T00:00:00`),
            labName: l.labName ?? null,
            fileUrl: l.fileUrl ?? null,
            notes: l.notes ?? null,
          })),
        })
      }
      if (input.notes.length) {
        await tx.patientNote.createMany({
          data: input.notes.map((n) => ({
            businessId,
            patientId: created.id,
            title: n.title,
            note: n.note,
            isPinned: n.isPinned ?? false,
            createdBy: session.fullName,
          })),
        })
      }
      if (input.files.length) {
        await tx.patientFile.createMany({
          data: input.files.map((f) => ({
            businessId,
            patientId: created.id,
            fileName: f.fileName,
            fileType: f.fileType,
            fileSize: f.fileSize ?? null,
            category: f.category,
            storageKey: f.storageKey,
            fileUrl: f.fileUrl,
            description: f.description ?? null,
            uploadedBy: session.fullName,
          })),
        })
      }

      await tx.timelineEvent.create({
        data: {
          businessId,
          patientId: created.id,
          type: TimelineEventType.PATIENT_CREATED,
          title: 'Hasta oluşturuldu',
          description: `${created.fullName} kaydedildi (#${created.patientNumber}).`,
          actorName: session.fullName,
          actorId: session.userId,
        },
      })

      return created
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/hastalar')
    return ok({ id: patient.id })
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Hasta oluşturulamadı')
  }
}

const updatePatientSchema = createPatientSchema
  .omit({ allergies: true, medications: true, treatments: true, labResults: true, notes: true, files: true })
  .partial()
  .extend({ id: z.string().uuid() })

export async function updatePatient(rawInput: unknown): Promise<ActionResult> {
  const parsed = updatePatientSchema.safeParse(rawInput)
  if (!parsed.success) return err('Form bilgileri hatalı', parsed.error.issues)
  const { id, ...patch } = parsed.data
  const session = await requirePermission('patient.edit')

  const existing = await prisma.patient.findFirst({ where: { id, businessId: session.businessId } })
  if (!existing) return err('Hasta bulunamadı')

  await prisma.patient.update({
    where: { id },
    data: {
      ...patch,
      birthDate: patch.birthDate !== undefined ? toDate(patch.birthDate) : undefined,
      tags: patch.tags ?? undefined,
    },
  })

  await prisma.timelineEvent.create({
    data: {
      businessId: session.businessId,
      patientId: id,
      type: TimelineEventType.PATIENT_UPDATED,
      title: 'Hasta bilgileri güncellendi',
      actorName: session.fullName,
      actorId: session.userId,
    },
  })

  revalidatePath(`/dashboard/hastalar/${id}`)
  revalidatePath('/dashboard/hastalar')
  return ok(undefined)
}

const archiveSchema = z.object({ id: z.string().uuid(), archived: z.boolean() })

export async function archivePatient(rawInput: unknown): Promise<ActionResult> {
  const parsed = archiveSchema.safeParse(rawInput)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requirePermission('patient.edit')
  await prisma.patient.updateMany({
    where: { id: parsed.data.id, businessId: session.businessId },
    data: { isArchived: parsed.data.archived },
  })
  revalidatePath('/dashboard/hastalar')
  return ok(undefined)
}

// ── Sub-collections ────────────────────────────────────────────────────────

export async function addPatientNote(input: unknown): Promise<ActionResult<{ id: string }>> {
  const schema = noteInput.extend({ patientId: z.string().uuid() })
  const parsed = schema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('patient.edit')
  const data = parsed.data
  const ownership = await prisma.patient.findFirst({
    where: { id: data.patientId, businessId: session.businessId },
    select: { id: true },
  })
  if (!ownership) return err('Hasta bulunamadı')
  const note = await prisma.patientNote.create({
    data: {
      businessId: session.businessId,
      patientId: data.patientId,
      title: data.title,
      note: data.note,
      isPinned: data.isPinned ?? false,
      createdBy: session.fullName,
    },
  })
  await prisma.timelineEvent.create({
    data: {
      businessId: session.businessId,
      patientId: data.patientId,
      type: TimelineEventType.NOTE_ADDED,
      title: 'Not eklendi',
      description: data.title,
      actorName: session.fullName,
      actorId: session.userId,
    },
  })
  revalidatePath(`/dashboard/hastalar/${data.patientId}`)
  return ok({ id: note.id })
}

export async function addMedication(input: unknown): Promise<ActionResult<{ id: string }>> {
  const schema = medicationInput.extend({ patientId: z.string().uuid() })
  const parsed = schema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('patient.edit')
  const data = parsed.data
  if (!(await isPatientOwned(data.patientId, session.businessId))) return err('Hasta bulunamadÄ±')
  const med = await prisma.medication.create({
    data: {
      businessId: session.businessId,
      patientId: data.patientId,
      name: data.name,
      dosage: data.dosage ?? null,
      frequency: data.frequency ?? null,
      startDate: toDate(data.startDate),
      endDate: toDate(data.endDate),
      notes: data.notes ?? null,
    },
  })
  await prisma.timelineEvent.create({
    data: {
      businessId: session.businessId,
      patientId: data.patientId,
      type: TimelineEventType.MEDICATION_ADDED,
      title: 'İlaç eklendi',
      description: data.name,
      actorName: session.fullName,
      actorId: session.userId,
    },
  })
  revalidatePath(`/dashboard/hastalar/${data.patientId}`)
  return ok({ id: med.id })
}

export async function addAllergy(input: unknown): Promise<ActionResult<{ id: string }>> {
  const schema = allergyInput.extend({ patientId: z.string().uuid() })
  const parsed = schema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('patient.edit')
  const data = parsed.data
  if (!(await isPatientOwned(data.patientId, session.businessId))) return err('Hasta bulunamadÄ±')
  const created = await prisma.allergy.create({
    data: {
      businessId: session.businessId,
      patientId: data.patientId,
      name: data.name,
      severity: data.severity,
      reaction: data.reaction ?? null,
      notes: data.notes ?? null,
    },
  })
  await prisma.timelineEvent.create({
    data: {
      businessId: session.businessId,
      patientId: data.patientId,
      type: TimelineEventType.ALLERGY_ADDED,
      title: 'Alerji eklendi',
      description: `${data.name} (${data.severity})`,
      actorName: session.fullName,
      actorId: session.userId,
    },
  })
  revalidatePath(`/dashboard/hastalar/${data.patientId}`)
  return ok({ id: created.id })
}

export async function addTreatment(input: unknown): Promise<ActionResult<{ id: string }>> {
  const schema = treatmentInput.extend({ patientId: z.string().uuid() })
  const parsed = schema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('patient.edit')
  const data = parsed.data
  if (!(await isPatientOwned(data.patientId, session.businessId))) return err('Hasta bulunamadÄ±')
  const created = await prisma.treatment.create({
    data: {
      businessId: session.businessId,
      patientId: data.patientId,
      title: data.title,
      description: data.description ?? null,
      doctorName: data.doctorName ?? null,
      startDate: toDate(data.startDate),
      endDate: toDate(data.endDate),
      status: data.status,
      cost: data.cost == null ? null : new Prisma.Decimal(data.cost),
      notes: data.notes ?? null,
    },
  })
  await prisma.timelineEvent.create({
    data: {
      businessId: session.businessId,
      patientId: data.patientId,
      type: TimelineEventType.TREATMENT_ADDED,
      title: 'Tedavi eklendi',
      description: data.title,
      actorName: session.fullName,
      actorId: session.userId,
    },
  })
  revalidatePath(`/dashboard/hastalar/${data.patientId}`)
  return ok({ id: created.id })
}

export async function addLabResult(input: unknown): Promise<ActionResult<{ id: string }>> {
  const schema = labResultInput.extend({ patientId: z.string().uuid() })
  const parsed = schema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('patient.edit')
  const data = parsed.data
  if (!(await isPatientOwned(data.patientId, session.businessId))) return err('Hasta bulunamadÄ±')
  const created = await prisma.labResult.create({
    data: {
      businessId: session.businessId,
      patientId: data.patientId,
      title: data.title,
      description: data.description ?? null,
      resultDate: new Date(`${data.resultDate}T00:00:00`),
      labName: data.labName ?? null,
      fileUrl: data.fileUrl ?? null,
      notes: data.notes ?? null,
    },
  })
  await prisma.timelineEvent.create({
    data: {
      businessId: session.businessId,
      patientId: data.patientId,
      type: TimelineEventType.LAB_RESULT_ADDED,
      title: 'Tahlil eklendi',
      description: data.title,
      actorName: session.fullName,
      actorId: session.userId,
    },
  })
  revalidatePath(`/dashboard/hastalar/${data.patientId}`)
  return ok({ id: created.id })
}

export async function addPatientFile(input: unknown): Promise<ActionResult<{ id: string }>> {
  const schema = fileInput.extend({ patientId: z.string().uuid() })
  const parsed = schema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('patient.edit')
  const data = parsed.data
  const patient = await prisma.patient.findFirst({
    where: { id: data.patientId, businessId: session.businessId },
    select: { id: true },
  })
  if (!patient) return err('Hasta bulunamadı')
  if (!data.storageKey.startsWith(`${session.businessId}/${data.patientId}/`)) {
    return err('Dosya yolu bu işletmeye veya hastaya ait değil')
  }
  if (data.fileUrl !== `storage://patient-files/${data.storageKey}`) {
    return err('Dosya referansı geçersiz')
  }

  const created = await prisma.patientFile.create({
    data: {
      businessId: session.businessId,
      patientId: data.patientId,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize ?? null,
      category: data.category,
      storageKey: data.storageKey,
      fileUrl: data.fileUrl,
      description: data.description ?? null,
      uploadedBy: session.fullName,
    },
  })
  await prisma.timelineEvent.create({
    data: {
      businessId: session.businessId,
      patientId: data.patientId,
      type: TimelineEventType.FILE_UPLOADED,
      title: 'Dosya yüklendi',
      description: data.fileName,
      actorName: session.fullName,
      actorId: session.userId,
    },
  })
  revalidatePath(`/dashboard/hastalar/${data.patientId}`)
  return ok({ id: created.id })
}

// ── Hasta meta (Hasta Kartı hızlı düzenleme) ───────────────────────────────

const metaSchema = z.object({
  patientId: z.string().uuid(),
  lastDiagnosis: optionalString,
  currentTreatment: optionalString,
  riskNote: optionalLongString,
  summary: optionalLongString,
  assignedDoctorId: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().uuid().nullable().optional()
  ),
})

export async function updatePatientMeta(input: unknown): Promise<ActionResult> {
  const parsed = metaSchema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('patient.edit')
  const owned = await prisma.patient.findFirst({
    where: { id: parsed.data.patientId, businessId: session.businessId },
    select: { id: true },
  })
  if (!owned) return err('Hasta bulunamadı')

  await prisma.patient.update({
    where: { id: parsed.data.patientId },
    data: {
      lastDiagnosis: parsed.data.lastDiagnosis ?? null,
      currentTreatment: parsed.data.currentTreatment ?? null,
      riskNote: parsed.data.riskNote ?? null,
      summary: parsed.data.summary ?? null,
      assignedDoctorId: parsed.data.assignedDoctorId ?? null,
    },
  })
  revalidatePath(`/dashboard/hastalar/${parsed.data.patientId}`)
  return ok(undefined)
}

// ── Tedavi planı (checklist) ───────────────────────────────────────────────

const planItemInput = z.object({
  title: z.string().trim().min(1).max(200),
  frequency: optionalString,
  status: z.enum(['AKTIF', 'PLANLANDI', 'BEKLIYOR', 'TAMAMLANDI']).default('PLANLANDI'),
  notes: optionalString,
})

export async function addTreatmentPlanItem(input: unknown): Promise<ActionResult<{ id: string }>> {
  const schema = planItemInput.extend({ patientId: z.string().uuid() })
  const parsed = schema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('patient.edit')
  const data = parsed.data

  if (!(await isPatientOwned(data.patientId, session.businessId))) return err('Hasta bulunamadÄ±')
  const count = await prisma.treatmentPlanItem.count({
    where: { businessId: session.businessId, patientId: data.patientId },
  })
  const created = await prisma.treatmentPlanItem.create({
    data: {
      businessId: session.businessId,
      patientId: data.patientId,
      title: data.title,
      frequency: data.frequency ?? null,
      status: data.status,
      notes: data.notes ?? null,
      order: count,
    },
  })
  revalidatePath(`/dashboard/hastalar/${data.patientId}`)
  return ok({ id: created.id })
}

export async function updateTreatmentPlanItem(input: unknown): Promise<ActionResult> {
  const schema = planItemInput.partial().extend({ id: z.string().uuid() })
  const parsed = schema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('patient.edit')
  const owned = await prisma.treatmentPlanItem.findFirst({
    where: { id: parsed.data.id, businessId: session.businessId },
    select: { patientId: true },
  })
  if (!owned) return err('Tedavi planı kalemi bulunamadı')
  const { id, ...patch } = parsed.data
  await prisma.treatmentPlanItem.update({ where: { id }, data: patch })
  revalidatePath(`/dashboard/hastalar/${owned.patientId}`)
  return ok(undefined)
}

export async function deleteTreatmentPlanItem(input: unknown): Promise<ActionResult> {
  const schema = z.object({ id: z.string().uuid() })
  const parsed = schema.safeParse(input)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requirePermission('patient.edit')
  const owned = await prisma.treatmentPlanItem.findFirst({
    where: { id: parsed.data.id, businessId: session.businessId },
    select: { patientId: true },
  })
  if (!owned) return err('Kayıt bulunamadı')
  await prisma.treatmentPlanItem.delete({ where: { id: parsed.data.id } })
  revalidatePath(`/dashboard/hastalar/${owned.patientId}`)
  return ok(undefined)
}

// ── Search ─────────────────────────────────────────────────────────────────

export async function searchPatients(query: string) {
  const session = await requireSession()
  const q = query.trim()
  if (!q) return []
  return prisma.patient.findMany({
    where: {
      businessId: session.businessId,
      isArchived: false,
      OR: [
        { fullName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { patientNumber: { contains: q, mode: 'insensitive' } },
        { identityNumber: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ],
    },
    take: 15,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      patientNumber: true,
      phone: true,
      email: true,
      tags: true,
    },
  })
}
