import { createHash } from 'node:crypto'

export function hashIdempotencyKey(raw: string) {
  return createHash('sha256').update(raw.trim()).digest('hex')
}

export function isValidIdempotencyKey(raw: string | null | undefined): raw is string {
  if (!raw) return false
  const v = raw.trim()
  return v.length >= 8 && v.length <= 128
}
