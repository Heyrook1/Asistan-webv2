import { describe, expect, it } from 'vitest'

import { validateIntakeAnswers, type IntakeFieldDef } from '@/lib/intake/schema'

const fields: IntakeFieldDef[] = [
  { id: 'a', type: 'TEXT', label: 'Ad', required: true },
  { id: 'b', type: 'CHECKBOX', label: 'Onay', required: true },
  { id: 'c', type: 'SELECT', label: 'Tercih', required: false, options: ['X', 'Y'] },
]

describe('validateIntakeAnswers', () => {
  it('requires text and checkbox', () => {
    const result = validateIntakeAnswers(fields, { a: '', b: false, c: 'X' })
    expect(result.ok).toBe(false)
    expect(result.errors.a).toBeTruthy()
    expect(result.errors.b).toBeTruthy()
  })

  it('accepts valid payload', () => {
    const result = validateIntakeAnswers(fields, { a: 'Ali', b: true, c: 'Y' })
    expect(result.ok).toBe(true)
    expect(result.answers.a).toBe('Ali')
    expect(result.answers.b).toBe(true)
  })
})
