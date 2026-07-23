import { z } from 'zod'

export const INTAKE_FIELD_TYPES = ['TEXT', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'PHONE', 'DATE'] as const
export type IntakeFieldTypeValue = (typeof INTAKE_FIELD_TYPES)[number]

export const intakeFieldSchema = z.object({
  id: z.string().min(1).max(64),
  type: z.enum(INTAKE_FIELD_TYPES),
  label: z.string().trim().min(1).max(160),
  required: z.boolean().default(false),
  placeholder: z.string().trim().max(200).optional().nullable(),
  options: z.array(z.string().trim().min(1).max(120)).max(40).optional().nullable(),
})

export type IntakeFieldDef = z.infer<typeof intakeFieldSchema>

export const intakeFieldsSchema = z.array(intakeFieldSchema).min(1).max(40)

export function parseIntakeFields(raw: unknown): IntakeFieldDef[] {
  const parsed = intakeFieldsSchema.safeParse(raw)
  if (!parsed.success) return []
  return parsed.data
}

export function validateIntakeAnswers(fields: IntakeFieldDef[], answers: Record<string, unknown>) {
  const errors: Record<string, string> = {}
  const normalized: Record<string, string | boolean | null> = {}

  for (const field of fields) {
    const raw = answers[field.id]
    if (field.type === 'CHECKBOX') {
      const value = Boolean(raw)
      if (field.required && !value) errors[field.id] = 'Bu alan zorunlu'
      normalized[field.id] = value
      continue
    }

    const text = raw == null ? '' : String(raw).trim()
    if (field.required && !text) {
      errors[field.id] = 'Bu alan zorunlu'
      normalized[field.id] = null
      continue
    }

    if (!text) {
      normalized[field.id] = null
      continue
    }

    if (field.type === 'SELECT' && field.options?.length && !field.options.includes(text)) {
      errors[field.id] = 'Geçersiz seçenek'
    }
    if (field.type === 'PHONE' && text.length < 7) {
      errors[field.id] = 'Geçerli telefon girin'
    }
    if (field.type === 'DATE' && !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      errors[field.id] = 'Tarih yyyy-mm-dd olmalı'
    }

    normalized[field.id] = text
  }

  return { ok: Object.keys(errors).length === 0, errors, answers: normalized }
}

export function getIntakePath(token: string) {
  return `/intake/${token}`
}
