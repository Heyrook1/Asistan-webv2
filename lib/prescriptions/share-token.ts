import 'server-only'

import { createHash, randomBytes } from 'crypto'

/** High-entropy, non-enumerable share token handed to patient / pharmacy. */
export function createPrescriptionShareToken() {
  return randomBytes(24).toString('base64url')
}

export function hashPrescriptionShareToken(token: string) {
  const pepper = process.env.PRESCRIPTION_SHARE_PEPPER?.trim() || 'asistan-rx-share-v1'
  return createHash('sha256').update(`${pepper}:${token}`).digest('hex')
}

/** last-4 visible; the full identity number stays on the clinic/printed copy. */
export function maskIdentityNumber(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (trimmed.length <= 4) return trimmed
  return `${'•'.repeat(Math.max(2, trimmed.length - 4))}${trimmed.slice(-4)}`
}
