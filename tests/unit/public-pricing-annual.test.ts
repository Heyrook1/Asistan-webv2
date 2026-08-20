import { describe, expect, it } from 'vitest'

import {
  formatPublicPlanPrice,
  listPublicMarketingPlanCards,
  publicPlanAnnualPrepaidAmount,
  publicPlanMonthlyAmount,
} from '@/lib/pricing/public-catalog'

describe('public pricing annual totals', () => {
  it('exposes monthly equivalent and prepaid annual charge for yearly cycle', () => {
    const starter = listPublicMarketingPlanCards().find((p) => p.code === 'STARTER')
    expect(starter).toBeTruthy()
    if (!starter) return

    expect(publicPlanMonthlyAmount(starter, 'monthly')).toBe(1000)
    expect(publicPlanMonthlyAmount(starter, 'annual')).toBe(1000)
    expect(publicPlanAnnualPrepaidAmount(starter)).toBe(1000 * 12)
    expect(formatPublicPlanPrice(12000, 'tr')).toBe('12.000 TRY')
  })

  it('matches Professional and Enterprise prepaid math', () => {
    const plans = listPublicMarketingPlanCards()
    const pro = plans.find((p) => p.code === 'PROFESSIONAL')
    const ent = plans.find((p) => p.code === 'ENTERPRISE')
    expect(publicPlanAnnualPrepaidAmount(pro!)).toBe(2500 * 12)
    expect(publicPlanAnnualPrepaidAmount(ent!)).toBeNull()
  })
})
