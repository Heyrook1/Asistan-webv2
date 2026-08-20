import 'server-only'

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'

/** High-entropy, non-enumerable share token handed to patient / pharmacy. */
export function createPrescriptionShareToken() {
  return randomBytes(24).toString('base64url')
}

function sharePepper() {
  return process.env.PRESCRIPTION_SHARE_PEPPER?.trim() || 'asistan-rx-share-v1'
}

export function hashPrescriptionShareToken(token: string) {
  return createHash('sha256').update(`${sharePepper()}:${token}`).digest('hex')
}

/** last-4 visible; the full identity number stays on the clinic/printed copy. */
export function maskIdentityNumber(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (trimmed.length <= 4) return trimmed
  return `${'•'.repeat(Math.max(2, trimmed.length - 4))}${trimmed.slice(-4)}`
}

/**
 * Stable clinic-printable verify token (HMAC).
 * Does not require DB shareTokenHash — works even when that migration is pending.
 */
export function createPrescriptionVerifyToken(input: {
  businessId: string
  prescriptionId: string
  /** Expiry unix seconds; default ~180 days */
  expSec?: number
}) {
  const exp = input.expSec ?? Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 180
  const body = `${input.businessId}.${input.prescriptionId}.${exp}`
  const sig = createHmac('sha256', sharePepper()).update(`rx-verify:v1:${body}`).digest('base64url')
  return `${Buffer.from(body, 'utf8').toString('base64url')}.${sig}`
}

export function parsePrescriptionVerifyToken(
  token: string,
): { ok: true; businessId: string; prescriptionId: string; expSec: number } | { ok: false } {
  const cleaned = token?.trim()
  if (!cleaned) return { ok: false }
  const [bodyB64, sig] = cleaned.split('.')
  if (!bodyB64 || !sig) return { ok: false }

  let body: string
  try {
    body = Buffer.from(bodyB64, 'base64url').toString('utf8')
  } catch {
    return { ok: false }
  }

  const expected = createHmac('sha256', sharePepper()).update(`rx-verify:v1:${body}`).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false }

  const [businessId, prescriptionId, expRaw] = body.split('.')
  const expSec = Number(expRaw)
  if (!businessId || !prescriptionId || !Number.isFinite(expSec)) return { ok: false }
  if (expSec * 1000 < Date.now()) return { ok: false }

  return { ok: true, businessId, prescriptionId, expSec }
}

export function prescriptionVerifyAbsoluteUrl(token: string) {
  const origin = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    'https://kktc.asistan.online'
  ).replace(/\/$/, '')
  return `${origin}/rx/${encodeURIComponent(token)}`
}
