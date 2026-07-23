import { describe, expect, it, vi } from 'vitest'
import { Prisma } from '@prisma/client'

// Prevent the real prisma module (and its env validation) from loading; the
// transactional claim receives its tx explicitly and never touches global prisma.
vi.mock('@/lib/prisma', () => ({ prisma: {} }))

import { hashIdempotencyKey, isValidIdempotencyKey } from '@/lib/public-booking/idempotency-key'
import {
  claimIdempotentBookingResponseTx,
  IdempotencyConflictError,
} from '@/lib/public-booking/idempotency'

describe('booking idempotency helpers', () => {
  it('validates key length', () => {
    expect(isValidIdempotencyKey('short')).toBe(false)
    expect(isValidIdempotencyKey('a'.repeat(8))).toBe(true)
    expect(isValidIdempotencyKey('a'.repeat(129))).toBe(false)
  })

  it('hashes stably', () => {
    expect(hashIdempotencyKey('abc-12345')).toBe(hashIdempotencyKey('abc-12345'))
    expect(hashIdempotencyKey('abc-12345')).not.toBe(hashIdempotencyKey('abc-99999'))
  })
})

describe('transactional idempotency claim (TOCTOU guard)', () => {
  it('inserts the claim row with a hashed key', async () => {
    const create = vi.fn().mockResolvedValue({})
    const tx = { bookingIdempotency: { create } } as never

    await claimIdempotentBookingResponseTx(tx, 'idem-key-123456', { appointmentId: 'a1' })

    expect(create).toHaveBeenCalledTimes(1)
    const arg = create.mock.calls[0][0]
    expect(arg.data.keyHash).toBe(hashIdempotencyKey('idem-key-123456'))
    // raw key is never persisted
    expect(arg.data.keyHash).not.toBe('idem-key-123456')
    expect(arg.data.expiresAt).toBeInstanceOf(Date)
  })

  it('maps a unique-constraint violation to IdempotencyConflictError', async () => {
    const p2002 = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
    })
    const create = vi.fn().mockRejectedValue(p2002)
    const tx = { bookingIdempotency: { create } } as never

    await expect(
      claimIdempotentBookingResponseTx(tx, 'idem-key-123456', { appointmentId: 'a1' })
    ).rejects.toBeInstanceOf(IdempotencyConflictError)
  })

  it('rethrows non-P2002 errors unchanged', async () => {
    const boom = new Error('db down')
    const create = vi.fn().mockRejectedValue(boom)
    const tx = { bookingIdempotency: { create } } as never

    await expect(
      claimIdempotentBookingResponseTx(tx, 'idem-key-123456', { appointmentId: 'a1' })
    ).rejects.toBe(boom)
  })
})
