import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import {
  formatPublicPlanPrice,
  listPublicMarketingPlanCards,
  listPublicPaidPricingPlans,
  listPublicPricingPlans,
  publicPlanMonthlyAmount,
} from '@/lib/pricing/public-catalog'
import { getVendorPlanPrice, listVendorPlans, PAID_VENDOR_PLAN_CODES } from '@/lib/vendor-membership'

describe('public pricing catalog', () => {
  it('matches vendor membership plan codes 1:1 (demo + paid)', () => {
    const publicCodes = listPublicPricingPlans({ includeDemo: true }).map((p) => p.code)
    const vendorCodes = listVendorPlans({ includeDemo: true }).map((p) => p.code)
    expect(publicCodes).toEqual(vendorCodes)
    expect(publicCodes).toEqual(['DEMO_14_DAYS', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'])
  })

  it('paid surface is exactly STARTER / PROFESSIONAL / ENTERPRISE', () => {
    const paid = listPublicPaidPricingPlans().map((p) => p.code)
    expect(paid).toEqual([...PAID_VENDOR_PLAN_CODES])
  })

  it('monthly amounts match billing catalog (EUR)', () => {
    for (const plan of listPublicPaidPricingPlans()) {
      const ui = publicPlanMonthlyAmount(plan, 'monthly')
      const bill = getVendorPlanPrice(plan.code, 'MONTHLY')
      expect(ui).toBe(bill?.amount ?? null)
    }
  })

  it('formats free trial as Ücretsiz', () => {
    expect(formatPublicPlanPrice(0, 'tr')).toBe('Ücretsiz')
    expect(formatPublicPlanPrice(149, 'tr')).toBe('€149')
  })

  it('marketing plan cards are exactly 3 paid tiers', () => {
    const cards = listPublicMarketingPlanCards().map((p) => p.code)
    expect(cards).toEqual([...PAID_VENDOR_PLAN_CODES])
    expect(cards).toHaveLength(3)
  })

  it('marketing pages use the shared marketing plan card catalog', () => {
    const files = ['components/marketing/pricing-page-sections.tsx']
    for (const rel of files) {
      const source = readFileSync(path.join(process.cwd(), rel), 'utf8')
      expect(source, rel).toContain('listPublicMarketingPlanCards')
      expect(source, rel).not.toContain('listPublicPricingPlans({ includeDemo: true })')
      expect(source, rel).not.toMatch(/\b1290\b/)
      expect(source, rel).not.toMatch(/\b2490\b/)
      expect(source, rel).not.toMatch(/\b4890\b/)
      expect(source, rel).not.toMatch(/Standart/)
    }
  })
})
