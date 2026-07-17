import { describe, expect, it } from 'vitest'

import { getVendorPlanPrice } from '@/lib/vendor-membership'

describe('getVendorPlanPrice', () => {
  it('returns monthly catalog amounts', () => {
    expect(getVendorPlanPrice('STARTER', 'MONTHLY')).toEqual({
      amount: 149,
      currency: 'EUR',
      durationDays: 30,
    })
  })

  it('returns yearly totals as discounted monthly × 12', () => {
    expect(getVendorPlanPrice('PROFESSIONAL', 'YEARLY')).toEqual({
      amount: 199 * 12,
      currency: 'EUR',
      durationDays: 365,
    })
  })

  it('rejects demo plan', () => {
    expect(getVendorPlanPrice('DEMO_14_DAYS', 'MONTHLY')).toBeNull()
  })
})
