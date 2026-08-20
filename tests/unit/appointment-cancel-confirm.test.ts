import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { canTransitionAppointmentStatus } from '@/lib/appointment-transitions'

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  cancelReason: z
    .preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().trim().max(500).optional()),
  undoCancel: z.boolean().optional(),
})

describe('P1-02 cancel confirm contract', () => {
  it('accepts optional cancelReason up to 500 chars', () => {
    const parsed = statusSchema.safeParse({
      id: '11111111-1111-4111-8111-111111111111',
      status: 'CANCELLED',
      cancelReason: 'Hasta erteledi',
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.cancelReason).toBe('Hasta erteledi')
  })

  it('treats blank cancelReason as omitted', () => {
    const parsed = statusSchema.safeParse({
      id: '11111111-1111-4111-8111-111111111111',
      status: 'CANCELLED',
      cancelReason: '   ',
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.cancelReason).toBeUndefined()
  })

  it('normal transitions still block CANCELLED → SCHEDULED without undo flag', () => {
    expect(canTransitionAppointmentStatus('CANCELLED', 'SCHEDULED')).toBe(false)
    expect(canTransitionAppointmentStatus('SCHEDULED', 'CANCELLED')).toBe(true)
  })

  it('undoCancel payload is accepted by schema', () => {
    const parsed = statusSchema.safeParse({
      id: '11111111-1111-4111-8111-111111111111',
      status: 'CONFIRMED',
      undoCancel: true,
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.undoCancel).toBe(true)
  })
})
