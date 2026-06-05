import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { err } from '@/lib/actions/result'

describe('lib/actions/result err()', () => {
  it('maps zod issues into fieldErrors by path', () => {
    const schema = z.object({
      patientId: z.string().uuid('Hasta secilmedi'),
      startTime: z.string().datetime('Saat formati hatali'),
    })

    const parsed = schema.safeParse({ patientId: 'x', startTime: 'y' })
    expect(parsed.success).toBe(false)
    if (parsed.success) return

    const result = err('Form hatali', parsed.error.issues)
    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.fieldErrors).toEqual({
      patientId: 'Hasta secilmedi',
      startTime: 'Saat formati hatali',
    })
  })

  it('uses form key for root-level issues', () => {
    const schema = z
      .object({
        startTime: z.string(),
        endTime: z.string(),
      })
      .refine((data) => data.startTime < data.endTime, {
        message: 'Saat araligi gecersiz',
      })

    const parsed = schema.safeParse({ startTime: '20:00', endTime: '09:00' })
    expect(parsed.success).toBe(false)
    if (parsed.success) return

    const result = err('Form hatali', parsed.error.issues)
    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.fieldErrors).toEqual({
      form: 'Saat araligi gecersiz',
    })
  })

  it('keeps first issue when same field has multiple zod errors', () => {
    const schema = z.object({
      note: z.string().min(5, 'En az 5 karakter').regex(/^\d+$/, 'Sadece rakam'),
    })

    const parsed = schema.safeParse({ note: 'ab' })
    expect(parsed.success).toBe(false)
    if (parsed.success) return

    const result = err('Form hatali', parsed.error.issues)
    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.fieldErrors).toEqual({
      note: 'En az 5 karakter',
    })
  })
})
