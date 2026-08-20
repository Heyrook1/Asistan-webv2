/**
 * Branş chip / specialty search aliases — free-text TeamMember.specialty
 * has no taxonomy table; chips must expand to common TR spellings.
 */

export const SPECIALTY_ALIAS_GROUPS: Record<string, string[]> = {
  dis: ['diş', 'dis', 'dental', 'ortodont', 'ağız', 'agiz', 'diş hekim', 'dis hekim'],
  dermatoloji: ['dermatoloji', 'deri', 'cildiye', 'cilt'],
  fizyo: ['fizyo', 'fizik tedavi', 'rehabilitasyon', 'fizyoterapi'],
  estetik: ['estetik', 'plastik', 'güzellik', 'guzellik'],
  genel: ['genel', 'aile', 'pratisyen', 'aile hekim'],
  aile: ['aile', 'genel', 'pratisyen', 'aile hekim'],
  kardiyoloji: ['kardiyoloji', 'kalp'],
}

function foldTurkish(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
}

/** Canonical key for a chip/specialty string, or null if unknown. */
export function specialtyGroupKey(raw: string): string | null {
  const folded = foldTurkish(raw.trim())
  if (!folded) return null
  for (const [key, terms] of Object.entries(SPECIALTY_ALIAS_GROUPS)) {
    if (key === folded) return key
    if (terms.some((term) => foldTurkish(term) === folded || folded.includes(foldTurkish(term)))) {
      return key
    }
  }
  return null
}

/** Terms to OR-match against specialty / service / query fields. */
export function specialtySearchTerms(raw: string | undefined | null): string[] {
  if (!raw?.trim()) return []
  const key = specialtyGroupKey(raw)
  if (key) return SPECIALTY_ALIAS_GROUPS[key] ?? [raw.trim()]
  return [raw.trim()]
}

/** True if haystack matches any alias term (Turkish-insensitive). */
export function matchesSpecialtyTerms(haystack: string | null | undefined, terms: string[]) {
  if (!haystack || terms.length === 0) return false
  const folded = foldTurkish(haystack)
  return terms.some((term) => folded.includes(foldTurkish(term)))
}
