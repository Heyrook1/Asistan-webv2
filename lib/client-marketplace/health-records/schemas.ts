/**
 * Zod schemas + shared enums for patient-owned Passport health records.
 *
 * Decoupled from the generated Prisma client so these can be unit-tested without
 * a DB. Enum string values MUST match the Prisma enums in schema.prisma.
 */
import { z } from 'zod'

export const MEDICATION_STATUSES = ['ACTIVE', 'ENDED', 'ARCHIVED'] as const
export const ALLERGY_SEVERITIES = ['MILD', 'MODERATE', 'SEVERE', 'UNKNOWN'] as const
export const DOCUMENT_CATEGORIES = [
  'LAB_RESULT',
  'MEDICAL_REPORT',
  'IMAGING',
  'PRESCRIPTION',
  'VISIT_DOCUMENT',
  'REFERRAL',
  'OTHER',
] as const
export const HEALTH_RECORD_SOURCES = [
  'PATIENT_ENTERED',
  'CLINIC_ENTERED',
  'PROVIDER_ENTERED',
  'SYSTEM_IMPORTED',
] as const

export type MedicationStatus = (typeof MEDICATION_STATUSES)[number]
export type AllergySeverity = (typeof ALLERGY_SEVERITIES)[number]
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]
export type HealthRecordSourceValue = (typeof HEALTH_RECORD_SOURCES)[number]

/** Accepts `YYYY-MM-DD` or full ISO; empty/null → null. Stored as a Date. */
const optionalDate = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value == null) return null
    const trimmed = value.trim()
    if (!trimmed) return null
    const parsed = new Date(trimmed.length === 10 ? `${trimmed}T00:00:00.000Z` : trimmed)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  })

const optionalText = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (value == null) return null
      const trimmed = value.trim()
      return trimmed ? trimmed.slice(0, max) : null
    })

const requiredName = z
  .string({ required_error: 'Zorunlu alan' })
  .trim()
  .min(1, 'Zorunlu alan')
  .max(200, 'En fazla 200 karakter')

// ── Medications ─────────────────────────────────────────────────────────────
export const MedicationCreateSchema = z.object({
  name: requiredName,
  strength: optionalText(120),
  form: optionalText(120),
  frequency: optionalText(120),
  startDate: optionalDate,
  endDate: optionalDate,
  instructions: optionalText(2000),
  notes: optionalText(2000),
})

export const MedicationUpdateSchema = MedicationCreateSchema.partial().extend({
  status: z.enum(MEDICATION_STATUSES).optional(),
})

export const MedicationStopSchema = z.object({
  stoppedAt: optionalDate,
})

export type MedicationCreateInput = z.infer<typeof MedicationCreateSchema>
export type MedicationUpdateInput = z.infer<typeof MedicationUpdateSchema>

// ── Allergies ───────────────────────────────────────────────────────────────
export const AllergyCreateSchema = z.object({
  name: requiredName,
  reaction: optionalText(300),
  severity: z.enum(ALLERGY_SEVERITIES).optional().default('UNKNOWN'),
  firstObservedAt: optionalDate,
  notes: optionalText(2000),
})

export const AllergyUpdateSchema = AllergyCreateSchema.partial()

export type AllergyCreateInput = z.infer<typeof AllergyCreateSchema>
export type AllergyUpdateInput = z.infer<typeof AllergyUpdateSchema>

// ── Documents (metadata only; the file goes through multipart) ───────────────
export const DocumentMetadataSchema = z.object({
  title: requiredName,
  category: z.enum(DOCUMENT_CATEGORIES).optional().default('OTHER'),
  documentDate: optionalDate,
  notes: optionalText(2000),
})

export const DocumentUpdateSchema = z.object({
  title: requiredName.optional(),
  category: z.enum(DOCUMENT_CATEGORIES).optional(),
  documentDate: optionalDate,
  notes: optionalText(2000),
})

export type DocumentMetadataInput = z.infer<typeof DocumentMetadataSchema>
export type DocumentUpdateInput = z.infer<typeof DocumentUpdateSchema>

export const MedicationListQuerySchema = z.object({
  status: z.enum(['active', 'previous', 'all']).optional().default('all'),
})

export const DocumentListQuerySchema = z.object({
  category: z.enum([...DOCUMENT_CATEGORIES, 'ALL'] as const).optional().default('ALL'),
})
