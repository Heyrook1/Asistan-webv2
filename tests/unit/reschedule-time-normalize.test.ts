import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { normalizeWallTime } from '@/lib/datetime/clinic-zone'

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

const timeInputSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed) return value
  if (!/^\d{1,2}:\d{2}/.test(trimmed)) return trimmed
  return normalizeWallTime(trimmed)
}, z.string().regex(timeRegex, 'Saat ss:dd formatında olmalı (örn. 15:30)'))

const rescheduleSchema = z.object({
  id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: timeInputSchema,
})

describe('P1-01 reschedule time input normalization', () => {
  it('accepts HTML time values with seconds (15:30:00 → 15:30)', () => {
    const parsed = rescheduleSchema.safeParse({
      id: '11111111-1111-4111-8111-111111111111',
      date: '2026-08-10',
      startTime: '15:30:00',
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.startTime).toBe('15:30')
    }
  })

  it('accepts plain HH:mm', () => {
    const parsed = rescheduleSchema.safeParse({
      id: '11111111-1111-4111-8111-111111111111',
      date: '2026-08-10',
      startTime: '15:00',
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.startTime).toBe('15:00')
    }
  })

  it('rejects garbage times with a clear message', () => {
    const parsed = rescheduleSchema.safeParse({
      id: '11111111-1111-4111-8111-111111111111',
      date: '2026-08-10',
      startTime: 'not-a-time',
    })
    expect(parsed.success).toBe(false)
  })
})
