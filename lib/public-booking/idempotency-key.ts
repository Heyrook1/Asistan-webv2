import { createHash } from 'node:crypto'

export function hashIdempotencyKey(raw: string) {
  return createHash('sha256').update(raw.trim()).digest('hex')
}

/** Stable fingerprint of booking payload for same-key / different-body → 409. */
export function hashBookingPayload(payload: unknown) {
  const stable =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? JSON.stringify(
          Object.keys(payload as Record<string, unknown>)
            .sort()
            .reduce<Record<string, unknown>>((acc, key) => {
              acc[key] = (payload as Record<string, unknown>)[key]
              return acc
            }, {}),
        )
      : JSON.stringify(payload ?? null)
  return createHash('sha256').update(stable).digest('hex')
}

export function isValidIdempotencyKey(raw: string | null | undefined): raw is string {
  if (!raw) return false
  const v = raw.trim()
  return v.length >= 8 && v.length <= 128
}

export const IDEMPOTENCY_PAYLOAD_HASH_FIELD = '__payloadHash' as const

export function stripIdempotencyMeta(response: Record<string, unknown>) {
  const { [IDEMPOTENCY_PAYLOAD_HASH_FIELD]: _hash, ...rest } = response
  return rest
}
