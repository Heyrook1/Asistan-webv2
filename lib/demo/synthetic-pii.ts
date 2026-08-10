/**
 * Synthetic PII for demo / sales / test seeds only.
 * Never use real-looking mobile numbers or non-reserved email domains.
 *
 * Emails: RFC 2606 `example.com`
 * Phones: documentation block +90 555 010 xxxx (fiction; not a real assignable line)
 */

export const DEMO_EMAIL_DOMAIN = 'example.com' as const

/** Clinic / ops contact in the reserved demo block. */
export const DEMO_CLINIC_PHONE = '+90 555 010 0000'

/** Patient / person phones: +90 555 010 0001 … 0099 */
export function demoPersonPhone(index: number): string {
  const n = Math.max(1, Math.min(99, Math.floor(index)))
  return `+90 555 010 00${String(n).padStart(2, '0')}`
}

export function demoEmail(localPart: string): string {
  const local = localPart
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._+-]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
  return `${local || 'demo'}@${DEMO_EMAIL_DOMAIN}`
}

export function demoTestLabel(name: string): string {
  const trimmed = name.trim()
  if (/\(TEST\)/i.test(trimmed) || /^TEST\b/i.test(trimmed)) return trimmed
  return `${trimmed} (TEST)`
}

export function demoIdentityDocument(index: number): string {
  return `TEST-ID-${String(Math.max(1, index)).padStart(4, '0')}`
}

/** True when phone is in the reserved +90 555 010 xxxx demo block. */
export function isReservedDemoPhone(phone: string): boolean {
  return /^\+90\s*555\s*010\s*\d{4}$/.test(phone.trim())
}

/** Patterns that must not appear in demo seed person/clinic contact fields. */
export const DEMO_PII_FORBIDDEN_PATTERNS: RegExp[] = [
  /@asistan\.health\b/i,
  /@asistan\.online\b/i,
  /@asistan\.demo\b/i,
  /@ornek\.(mail|com)\b/i,
  /\b053[0-9]\b/, // TR mobile prefixes (053x)
  /\b0555\s*[1-9]/, // real-looking 0555 mobiles outside reserved fiction
  /\+90\s*392\b/, // KKTC geographic lines that looked like real clinic phones
  /\+90\s*212\b/, // TR metro landline used in older fixtures
  /\+90\s*555(?!\s*010\b)/, // 555 mobiles outside the 010 demo block
]

export function looksLikeForbiddenDemoPii(value: string): boolean {
  return DEMO_PII_FORBIDDEN_PATTERNS.some((re) => re.test(value))
}

export function assertNoForbiddenDemoPii(
  label: string,
  ...values: Array<string | null | undefined>
): void {
  const blob = values.filter((v) => v != null && v !== '').join(' ')
  if (!blob) return
  if (looksLikeForbiddenDemoPii(blob)) {
    throw new Error(`P1-09: ${label} uses non-synthetic contact (${blob})`)
  }
}
