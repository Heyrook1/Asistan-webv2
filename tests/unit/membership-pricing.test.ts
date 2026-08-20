import { describe, expect, it } from 'vitest'

import { getVendorPlanPrice } from '@/lib/vendor-membership'

describe('getVendorPlanPrice', () => {
  it('returns monthly catalog amounts', () => {
    expect(getVendorPlanPrice('STARTER', 'MONTHLY')).toEqual({
      amount: 1000,
      currency: 'TRY',
      durationDays: 30,
    })
  })

  it('returns yearly totals as monthly × 12', () => {
    expect(getVendorPlanPrice('PROFESSIONAL', 'YEARLY')).toEqual({
      amount: 2500 * 12,
      currency: 'TRY',
      durationDays: 365,
    })
  })

  it('rejects demo plan', () => {
    expect(getVendorPlanPrice('DEMO_14_DAYS', 'MONTHLY')).toBeNull()
  })

  it('routes Enterprise pricing to a custom quote', () => {
    expect(getVendorPlanPrice('ENTERPRISE', 'MONTHLY')).toBeNull()
  })
})
