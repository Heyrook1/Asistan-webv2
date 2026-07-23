import 'server-only'

import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { hashIdempotencyKey } from '@/lib/public-booking/idempotency-key'

export { hashIdempotencyKey, isValidIdempotencyKey } from '@/lib/public-booking/idempotency-key'

const TTL_MS = 24 * 60 * 60 * 1000

/** Thrown when an idempotency key was already claimed by a concurrent/previous request. */
export class IdempotencyConflictError extends Error {
  constructor() {
    super('idempotency-conflict')
    this.name = 'IdempotencyConflictError'
  }
}

/**
 * Claim an idempotency key *inside* the booking transaction. Because the unique
 * `keyHash` insert commits atomically with the appointment, two concurrent requests
 * carrying the same key can never both create an appointment: the loser hits the
 * unique constraint (P2002), the whole transaction rolls back, and we surface a
 * conflict so the caller can replay the winner's stored response.
 */
export async function claimIdempotentBookingResponseTx(
  tx: Prisma.TransactionClient,
  key: string,
  response: Record<string, unknown>,
) {
  const keyHash = hashIdempotencyKey(key)
  const expiresAt = new Date(Date.now() + TTL_MS)
  try {
    await tx.bookingIdempotency.create({
      data: {
        keyHash,
        response: response as Prisma.InputJsonValue,
        expiresAt,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new IdempotencyConflictError()
    }
    throw error
  }
}

export async function getIdempotentBookingResponse(key: string) {
  const keyHash = hashIdempotencyKey(key)
  const row = await prisma.bookingIdempotency.findUnique({ where: { keyHash } })
  if (!row) return null
  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.bookingIdempotency.delete({ where: { id: row.id } }).catch(() => null)
    return null
  }
  return row.response as Record<string, unknown>
}

export async function saveIdempotentBookingResponse(key: string, response: Record<string, unknown>) {
  const keyHash = hashIdempotencyKey(key)
  const expiresAt = new Date(Date.now() + TTL_MS)
  try {
    await prisma.bookingIdempotency.create({
      data: {
        keyHash,
        response: response as Prisma.InputJsonValue,
        expiresAt,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const existing = await getIdempotentBookingResponse(key)
      if (existing) return existing
    }
    throw error
  }
  return response
}
