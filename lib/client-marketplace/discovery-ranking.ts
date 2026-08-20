import type { ClientDiscoveryItem } from './types'

/**
 * Recommended (Önerilen) ranking — documented, no geolocation claim.
 *
 * Priority (higher score first):
 * 1. Active + verified doctor credentials (license / KKTC ID / diploma)
 * 2. Real next availability
 * 3. Match to user's selected region (`preferredCity`)
 * 4. Appointment-backed review score (avg × volume dampening)
 * 5. Profile completeness (city, address, logo, specialty, services)
 *
 * Sponsored placements are NOT scored here — callers must pin/label them
 * separately when sponsorship exists (`isSponsored`).
 */
export function profileCompletenessScore(item: Pick<
  ClientDiscoveryItem,
  | 'businessCity'
  | 'businessAddress'
  | 'businessLogoUrl'
  | 'doctorAvatarUrl'
  | 'specialty'
  | 'serviceCount'
>): number {
  let score = 0
  if (item.businessCity?.trim()) score += 1
  if (item.businessAddress?.trim()) score += 1
  if (item.businessLogoUrl || item.doctorAvatarUrl) score += 1
  if (item.specialty?.trim()) score += 1
  if (item.serviceCount > 0) score += 1
  return score
}

export function recommendedScore(
  item: ClientDiscoveryItem,
  preferredCity?: string | null,
): number {
  let score = 0

  // 1. Verified clinician
  if (item.doctorVerified) score += 1000

  // 2. Real availability
  if (item.nextAvailableAt) score += 500

  // 3. User region (city chip / filter)
  if (preferredCity) {
    const city = item.businessCity?.trim().toLocaleLowerCase('tr-TR') ?? ''
    const pref = preferredCity.trim().toLocaleLowerCase('tr-TR')
    if (city && (city === pref || city.includes(pref) || pref.includes(city))) {
      score += 300
    }
  }

  // 4. Verified review score (reviews require an appointment in schema)
  if (item.ratingAverage != null && item.reviewCount > 0) {
    const volume = Math.min(item.reviewCount, 25)
    score += item.ratingAverage * 40 + volume * 2
  }

  // 5. Profile completeness (0–5 → 0–100)
  score += profileCompletenessScore(item) * 20

  return score
}

export function compareRecommended(
  a: ClientDiscoveryItem,
  b: ClientDiscoveryItem,
  preferredCity?: string | null,
): number {
  const diff = recommendedScore(b, preferredCity) - recommendedScore(a, preferredCity)
  if (diff !== 0) return diff
  // Stable tie-break: name
  return a.businessName.localeCompare(b.businessName, 'tr')
}
