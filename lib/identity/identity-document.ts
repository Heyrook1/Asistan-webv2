/**
 * Client-safe identity document validation (no Node crypto).
 * Person hashing stays in normalize.ts / resolve.ts server-side.
 *
 * KKTC kimlik = 10 hane (sayısal)
 * TR TC kimlik = 11 hane + checksum
 * Pasaport = harf+rakam (saf sayı değil)
 */

function isValidTrTcKimlik(digits: string): boolean {
  if (!/^\d{11}$/.test(digits) || digits[0] === '0') return false
  const d = digits.split('').map(Number)
  const odd = d[0]! + d[2]! + d[4]! + d[6]! + d[8]!
  const even = d[1]! + d[3]! + d[5]! + d[7]!
  const dig10 = ((odd * 7 - even) % 10 + 10) % 10
  const dig11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10
  return dig10 === d[9] && dig11 === d[10]
}

/**
 * KKTC kimlik / TC kimlik / pasaport — rezervasyon güvenliği için zorunlu belge no.
 */
export function normalizeIdentityDocument(raw: string | null | undefined): string | null {
  if (!raw) return null
  const cleaned = raw.replace(/\s+/g, '').toUpperCase()
  if (cleaned.length < 5 || cleaned.length > 20) return null
  if (!/^[A-Z0-9]+$/.test(cleaned)) return null

  // Saf sayısal: yalnızca KKTC (10) veya TR TC (11)
  if (/^\d+$/.test(cleaned)) {
    if (cleaned.length === 10) return cleaned // KKTC kimlik
    if (cleaned.length === 11) return isValidTrTcKimlik(cleaned) ? cleaned : null
    return null
  }

  // Pasaport / yabancı belge (en az bir harf)
  if (!/[A-Z]/.test(cleaned)) return null
  return cleaned
}

export function isValidIdentityDocument(raw: string | null | undefined): boolean {
  return normalizeIdentityDocument(raw) != null
}

/** UI / API copy helpers */
export const IDENTITY_DOCUMENT_HINT_TR =
  'KKTC kimlik 10 hane, TC kimlik 11 hane veya pasaport no'
export const IDENTITY_DOCUMENT_HINT_EN =
  'KKTC ID 10 digits, TR national ID 11 digits, or passport'
