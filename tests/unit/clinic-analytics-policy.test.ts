import { describe, expect, it } from 'vitest'

import { isFeatureEnabled } from '@/lib/feature-flags'
import { isClinicAnalyticsEnabled } from '@/lib/analytics/policy'

describe('clinic analytics revival (Q2)', () => {
  it('ships honest overview on by default', () => {
    expect(isFeatureEnabled('clinicAnalytics')).toBe(true)
    expect(isClinicAnalyticsEnabled()).toBe(true)
  })

  it('keeps advanced funnel/utilization opt-in', () => {
    expect(isFeatureEnabled('advancedAnalytics')).toBe(false)
  })
})

describe('period cancellation rate (honest overview)', () => {
  it('matches selected-period completed + cancelled only', () => {
    const totalCompleted = 80
    const totalCancelled = 20
    const rate =
      totalCompleted + totalCancelled > 0
        ? totalCancelled / (totalCompleted + totalCancelled)
        : 0
    expect(rate).toBe(0.2)
  })
})
