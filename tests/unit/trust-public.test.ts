import { describe, expect, it } from 'vitest'

import {
  PUBLIC_TRUST_STATS_MIN_COMPLETED,
  shouldPublishPublicTrustStats,
  type PublicTrustStats,
} from '@/lib/trust/publish-policy'

function stats(overrides: Partial<PublicTrustStats> = {}): PublicTrustStats {
  return {
    activeClinics: 1,
    verifiedDoctors: 0,
    completedAppointments: 2,
    reviewCount: 0,
    averageRating: null,
    ...overrides,
  }
}

describe('public trust stats publishing', () => {
  it('hides live counts until completed appointments reach the platform bar', () => {
    expect(PUBLIC_TRUST_STATS_MIN_COMPLETED).toBe(40)
    expect(shouldPublishPublicTrustStats(stats())).toBe(false)
    expect(shouldPublishPublicTrustStats(stats({ completedAppointments: 39 }))).toBe(false)
    expect(shouldPublishPublicTrustStats(stats({ completedAppointments: 40 }))).toBe(true)
  })
})
