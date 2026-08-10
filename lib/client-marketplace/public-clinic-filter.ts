/**
 * Public marketplace (/client) must not look like a demo when only seed clinics exist.
 * Slug stays ASCII (URL-safe); display name may use Turkish characters (Kliniği).
 */

const TEST_SLUG_SUFFIX = '-asistan-test'

export function isTestClinicSlug(slug: string | null | undefined): boolean {
  if (!slug) return false
  const s = slug.trim().toLowerCase()
  return s.endsWith(TEST_SLUG_SUFFIX) || /(?:^|-)test(?:-|$)/.test(s)
}

export function isTestClinicName(name: string | null | undefined): boolean {
  if (!name) return false
  return /asistan\s+test/i.test(name) || /test\s*klini[gğ]i/i.test(name)
}

export function isPublicTestClinic(input: {
  slug?: string | null
  name?: string | null
}): boolean {
  return isTestClinicSlug(input.slug) || isTestClinicName(input.name)
}

/** Staging opt-in — never default on in production. */
export function shouldIncludeTestClinicsInPublicIndex(): boolean {
  const flag = process.env.CLIENT_SHOW_TEST_CLINICS?.trim().toLowerCase()
  return flag === '1' || flag === 'true' || flag === 'yes'
}
