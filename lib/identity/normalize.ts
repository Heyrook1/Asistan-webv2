import { createHmac, randomBytes } from 'node:crypto'

import {
  isValidIdentityDocument,
  normalizeIdentityDocument,
} from '@/lib/identity/identity-document'

export { isValidIdentityDocument, normalizeIdentityDocument }

/** Digits-only; TR mobile 05XXXXXXXXX → +905XXXXXXXXX; already +E.164 kept. */
export function normalizePhoneE164(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '')
    return digits.length >= 8 ? `+${digits}` : null
  }
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('5')) return `+90${digits}`
  if (digits.length === 11 && digits.startsWith('05')) return `+9${digits}` // 05… → +905…
  if (digits.length === 12 && digits.startsWith('905')) return `+${digits}`
  if (digits.length >= 8) return `+${digits}`
  return null
}

/**
 * Phone strings that may already exist on Patient.phone for the same person.
 * Person resolve uses E.164; Patient historically stored raw form — match both.
 */
export function phoneLookupVariants(raw: string): string[] {
  const trimmed = raw.trim()
  const e164 = normalizePhoneE164(trimmed)
  const variants = new Set<string>()
  if (trimmed) variants.add(trimmed)
  if (e164) {
    variants.add(e164)
    if (e164.startsWith('+90') && e164.length === 13) {
      variants.add(`0${e164.slice(3)}`)
      variants.add(e164.slice(3))
    }
  }
  return [...variants]
}

export function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw) return null
  const v = raw.trim().toLowerCase()
  return v.includes('@') ? v : null
}

export function canonicalizeFullName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('tr-TR')
}

export function hashIdentityDocument(raw: string | null | undefined, pepper: string): string | null {
  if (!raw) return null
  const cleaned = normalizeIdentityDocument(raw)
  if (!cleaned) return null
  return createHmac('sha256', pepper).update(`id:${cleaned}`).digest('hex')
}

/** Opaque GPI-XXXXXXXXXX — not sequential. */
export function generateGpiDisplay(): string {
  const token = randomBytes(5).toString('hex').toUpperCase()
  return `GPI-${token}`
}

export type IdentitySignals = {
  phoneE164: string | null
  emailNorm: string | null
  identityHash: string | null
  fullNameCanon: string
  birthDateIso: string | null
}

export type ScoreBreakdown = {
  total: number
  identityHash: number
  phone: number
  email: number
  nameDob: number
}

export function scoreIdentityMatch(a: IdentitySignals, b: IdentitySignals): ScoreBreakdown {
  const identityHash = a.identityHash && b.identityHash && a.identityHash === b.identityHash ? 0.55 : 0
  const phone = a.phoneE164 && b.phoneE164 && a.phoneE164 === b.phoneE164 ? 0.25 : 0
  const email = a.emailNorm && b.emailNorm && a.emailNorm === b.emailNorm ? 0.15 : 0

  let nameDob = 0
  if (a.fullNameCanon && b.fullNameCanon && a.fullNameCanon === b.fullNameCanon) {
    nameDob += 0.1
    if (a.birthDateIso && b.birthDateIso && a.birthDateIso === b.birthDateIso) {
      nameDob += 0.1
    }
  }

  const total = Math.min(1, identityHash + phone + email + nameDob)
  return { total, identityHash, phone, email, nameDob }
}

/** Dual strong signal for silent auto-merge (≥0.95 path). */
export function hasDualStrongSignal(score: ScoreBreakdown): boolean {
  const strong =
    (score.identityHash > 0 ? 1 : 0) + (score.phone > 0 ? 1 : 0) + (score.email > 0 ? 1 : 0)
  return strong >= 2 && score.total >= 0.95
}

/** Count of distinct strong signals (identityHash / phone / email) that matched. */
function strongSignalCount(score: ScoreBreakdown): number {
  return (
    (score.identityHash > 0 ? 1 : 0) +
    (score.phone > 0 ? 1 : 0) +
    (score.email > 0 ? 1 : 0)
  )
}

/**
 * Marketplace resolve auto-link gate.
 *
 * A single weak signal (phone-only OR email-only) is NOT enough to silently link
 * into an existing Person that may belong to a different clinic/context — that would
 * merge cross-clinic PHI. We only auto-link when:
 *   - the identity document hash matches (strong, near-unique legal identifier), OR
 *   - at least two independent strong signals match (dual strong signal).
 *
 * Otherwise resolve creates a **new** Person. Because `phoneE164` / `emailNorm` /
 * `identityHash` are UNIQUE, colliding signals are omitted on create and a
 * PersonIdentityMatch suggestion is queued instead of failing with P2002.
 */
export function shouldAutoLinkPerson(score: ScoreBreakdown): boolean {
  if (score.identityHash > 0) return true
  return strongSignalCount(score) >= 2
}

/**
 * Queue for human review: partial match that is not safe to auto-link.
 * Threshold: at least one strong signal or name+DOB bump (total ≥ 0.25).
 */
export function shouldSuggestPersonMatch(score: ScoreBreakdown): boolean {
  if (shouldAutoLinkPerson(score)) return false
  return score.total >= 0.25
}
