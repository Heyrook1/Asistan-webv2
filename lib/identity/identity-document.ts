/**
 * Client-safe identity document validation (no Node crypto).
 * Person hashing stays in normalize.ts / resolve.ts server-side.
 */

/**
 * KKTC kimlik / TC kimlik / pasaport — rezervasyon güvenliği için zorunlu belge no.
 */
export function normalizeIdentityDocument(raw: string | null | undefined): string | null {
  if (!raw) return null
  const cleaned = raw.replace(/\s+/g, '').toUpperCase()
  if (cleaned.length < 5 || cleaned.length > 20) return null
  if (!/^[A-Z0-9]+$/.test(cleaned)) return null

  // TR TC kimlik (11 hane) — standart checksum
  if (/^\d{11}$/.test(cleaned)) {
    if (cleaned[0] === '0') return null
    const d = cleaned.split('').map(Number)
    const odd = d[0]! + d[2]! + d[4]! + d[6]! + d[8]!
    const even = d[1]! + d[3]! + d[5]! + d[7]!
    const dig10 = ((odd * 7 - even) % 10 + 10) % 10
    const dig11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10
    if (dig10 !== d[9] || dig11 !== d[10]) return null
  }

  return cleaned
}

export function isValidIdentityDocument(raw: string | null | undefined): boolean {
  return normalizeIdentityDocument(raw) != null
}
