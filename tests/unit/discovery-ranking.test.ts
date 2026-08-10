import { describe, expect, it } from 'vitest'

import {
  compareRecommended,
  profileCompletenessScore,
  recommendedScore,
} from '@/lib/client-marketplace/discovery-ranking'
import type { ClientDiscoveryItem } from '@/lib/client-marketplace/types'

function item(partial: Partial<ClientDiscoveryItem>): ClientDiscoveryItem {
  return {
    businessId: 'b1',
    businessName: 'Klinik A',
    businessSlug: 'klinik-a',
    businessAddress: null,
    businessCity: null,
    businessLogoUrl: null,
    businessDistanceKm: null,
    doctorId: 'd1',
    doctorName: 'Dr A',
    doctorAvatarUrl: null,
    doctorVerified: false,
    specialty: null,
    ratingAverage: null,
    reviewCount: 0,
    serviceCount: 0,
    nextAvailableAt: null,
    minPrice: null,
    maxPrice: null,
    fromPriceServiceName: null,
    openNow: false,
    isSponsored: false,
    ...partial,
  }
}

describe('discovery recommended ranking', () => {
  it('scores verified + availability above unrated incomplete profiles', () => {
    const weak = item({ businessName: 'Zayıf' })
    const strong = item({
      businessName: 'Güçlü',
      doctorVerified: true,
      nextAvailableAt: '2099-01-15T09:00:00.000Z',
      businessCity: 'Girne',
      businessAddress: 'Merkez',
      specialty: 'Dermatoloji',
      serviceCount: 2,
      businessLogoUrl: 'https://example.com/logo.png',
    })
    expect(recommendedScore(strong, 'Girne')).toBeGreaterThan(recommendedScore(weak, 'Girne'))
    expect(compareRecommended(strong, weak, 'Girne')).toBeLessThan(0)
  })

  it('boosts preferred city match', () => {
    const local = item({ businessCity: 'Girne', doctorVerified: true })
    const other = item({ businessCity: 'Lefkoşa', doctorVerified: true })
    expect(recommendedScore(local, 'Girne')).toBeGreaterThan(recommendedScore(other, 'Girne'))
  })

  it('uses review score only when reviews exist', () => {
    const rated = item({ ratingAverage: 4.8, reviewCount: 10 })
    const unrated = item({ ratingAverage: null, reviewCount: 0 })
    expect(recommendedScore(rated)).toBeGreaterThan(recommendedScore(unrated))
  })

  it('profile completeness is 0–5', () => {
    expect(profileCompletenessScore(item({}))).toBe(0)
    expect(
      profileCompletenessScore(
        item({
          businessCity: 'Girne',
          businessAddress: 'A',
          businessLogoUrl: 'x',
          specialty: 'Diş',
          serviceCount: 1,
        }),
      ),
    ).toBe(5)
  })
})
