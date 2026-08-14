/**
 * Client-safe identity document validation (no Node crypto).
 * Person hashing stays in normalize.ts / resolve.ts server-side.
 *
 * KKTC kimlik = 10 hane (sayısal)
 * TR TC kimlik = 11 hane + checksum
 * Pasaport (turist) = 6–20 hane, harf ve/veya rakam (saf sayı da olur)
 */

export type IdentityDocumentType = 'KKTC' | 'TC' | 'PASSPORT'

function isValidTrTcKimlik(digits: string): boolean {
  if (!/^\d{11}$/.test(digits) || digits[0] === '0') return false
  const d = digits.split('').map(Number)
  const odd = d[0]! + d[2]! + d[4]! + d[6]! + d[8]!
  const even = d[1]! + d[3]! + d[5]! + d[7]!
  const dig10 = ((odd * 7 - even) % 10 + 10) % 10
  const dig11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10
  return dig10 === d[9] && dig11 === d[10]
}

export function normalizeIdentityDocument(
  raw: string | null | undefined,
  documentType?: IdentityDocumentType | null,
): string | null {
  if (!raw) return null
  const cleaned = raw.replace(/[\s-]/g, '').toUpperCase()
  if (cleaned.length < 5 || cleaned.length > 20) return null
  if (!/^[A-Z0-9]+$/.test(cleaned)) return null

  const type = documentType ?? inferIdentityDocumentType(cleaned)

  if (type === 'KKTC') {
    return /^\d{10}$/.test(cleaned) ? cleaned : null
  }

  if (type === 'TC') {
    return isValidTrTcKimlik(cleaned) ? cleaned : null
  }

  // PASSPORT — tourists: numeric or alphanumeric (ICAO-style)
  if (cleaned.length < 6 || cleaned.length > 20) return null
  return cleaned
}

/** When type omitted, infer from shape (legacy / API callers). */
export function inferIdentityDocumentType(cleaned: string): IdentityDocumentType {
  if (/^\d{10}$/.test(cleaned)) return 'KKTC'
  if (/^\d{11}$/.test(cleaned)) return 'TC'
  return 'PASSPORT'
}

export function isValidIdentityDocument(
  raw: string | null | undefined,
  documentType?: IdentityDocumentType | null,
): boolean {
  return normalizeIdentityDocument(raw, documentType) != null
}

export const IDENTITY_DOCUMENT_TYPE_LABELS = {
  tr: {
    KKTC: 'KKTC kimlik (10 hane)',
    TC: 'TC kimlik (11 hane)',
    PASSPORT: 'Pasaport (turist / yabancı)',
  },
  en: {
    KKTC: 'KKTC ID (10 digits)',
    TC: 'TR national ID (11 digits)',
    PASSPORT: 'Passport (visitor / tourist)',
  },
} as const

export const IDENTITY_DOCUMENT_HINT_TR =
  'Ada yerlisi: KKTC 10 hane · Türkiye: TC 11 hane · Turist: pasaport no'
export const IDENTITY_DOCUMENT_HINT_EN =
  'Local: KKTC 10 digits · Turkey: TR ID 11 digits · Visitor: passport number'
