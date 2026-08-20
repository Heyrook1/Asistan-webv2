import { describe, expect, it } from 'vitest'

import {
  AllergyCreateSchema,
  DocumentMetadataSchema,
  MedicationCreateSchema,
  MedicationUpdateSchema,
} from '@/lib/client-marketplace/health-records/schemas'

describe('MedicationCreateSchema', () => {
  it('requires a non-empty name', () => {
    expect(MedicationCreateSchema.safeParse({ name: '' }).success).toBe(false)
    expect(MedicationCreateSchema.safeParse({ name: '   ' }).success).toBe(false)
  })

  it('trims name and coerces empty optionals to null', () => {
    const parsed = MedicationCreateSchema.parse({ name: '  Metformin ', strength: '', notes: '  ' })
    expect(parsed.name).toBe('Metformin')
    expect(parsed.strength).toBeNull()
    expect(parsed.notes).toBeNull()
  })

  it('parses YYYY-MM-DD dates into Date instances', () => {
    const parsed = MedicationCreateSchema.parse({ name: 'X', startDate: '2026-08-20' })
    expect(parsed.startDate).toBeInstanceOf(Date)
    expect(parsed.startDate?.toISOString().slice(0, 10)).toBe('2026-08-20')
  })

  it('drops invalid dates to null instead of throwing', () => {
    const parsed = MedicationCreateSchema.parse({ name: 'X', startDate: 'not-a-date' })
    expect(parsed.startDate).toBeNull()
  })
})

describe('MedicationUpdateSchema', () => {
  it('only accepts known statuses', () => {
    expect(MedicationUpdateSchema.safeParse({ status: 'ENDED' }).success).toBe(true)
    expect(MedicationUpdateSchema.safeParse({ status: 'DELETED' }).success).toBe(false)
  })
})

describe('AllergyCreateSchema', () => {
  it('defaults severity to UNKNOWN, never SEVERE', () => {
    const parsed = AllergyCreateSchema.parse({ name: 'Penisilin' })
    expect(parsed.severity).toBe('UNKNOWN')
  })

  it('accepts explicit severity values', () => {
    expect(AllergyCreateSchema.parse({ name: 'X', severity: 'MILD' }).severity).toBe('MILD')
    expect(AllergyCreateSchema.safeParse({ name: 'X', severity: 'CRITICAL' }).success).toBe(false)
  })
})

describe('DocumentMetadataSchema', () => {
  it('requires a title and defaults category to OTHER', () => {
    expect(DocumentMetadataSchema.safeParse({ title: '' }).success).toBe(false)
    expect(DocumentMetadataSchema.parse({ title: 'Kan tahlili' }).category).toBe('OTHER')
  })

  it('rejects unknown categories', () => {
    expect(DocumentMetadataSchema.safeParse({ title: 'x', category: 'XRAY' }).success).toBe(false)
  })
})
