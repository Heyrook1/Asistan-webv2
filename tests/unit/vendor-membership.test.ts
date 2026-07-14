import { describe, it, expect } from 'vitest'

import {
  buildMembershipRenewMailto,
  daysUntilAccessEnd,
  getMembershipUrgency,
  getVendorPlanUserLimit,
  listVendorPlans,
  normalizeVendorPlanCode,
} from '@/lib/vendor-membership'

describe('lib/vendor-membership', () => {
  it('normalizes plan aliases', () => {
    expect(normalizeVendorPlanCode('PRO')).toBe('PROFESSIONAL')
    expect(normalizeVendorPlanCode('baslangic')).toBe('STARTER')
    expect(normalizeVendorPlanCode(null)).toBe('STARTER')
  })

  it('limits demo accounts to one user', () => {
    expect(getVendorPlanUserLimit({ plan: 'ENTERPRISE', isDemo: true })).toBe(1)
    expect(getVendorPlanUserLimit({ plan: 'ENTERPRISE', isDemo: false })).toBeNull()
    expect(getVendorPlanUserLimit({ plan: 'PROFESSIONAL' })).toBe(5)
  })

  it('lists paid plans without demo by default', () => {
    const plans = listVendorPlans()
    expect(plans.every((p) => !p.demoOnly)).toBe(true)
    expect(plans.some((p) => p.code === 'DEMO_14_DAYS')).toBe(false)
    expect(plans.find((p) => p.code === 'PROFESSIONAL')?.features.join(' ')).not.toMatch(/AI/i)
  })

  it('computes urgency windows from accessEndAt', () => {
    const now = new Date('2026-07-13T12:00:00.000Z')
    expect(getMembershipUrgency({ status: 'SUSPENDED', now })).toBe('expired')
    expect(
      getMembershipUrgency({
        accessEndAt: '2026-07-14T12:00:00.000Z',
        status: 'ACTIVE',
        now,
      }),
    ).toBe('critical')
    expect(
      getMembershipUrgency({
        accessEndAt: '2026-07-20T12:00:00.000Z',
        status: 'ACTIVE',
        now,
      }),
    ).toBe('soon')
    expect(
      getMembershipUrgency({
        accessEndAt: '2026-09-01T12:00:00.000Z',
        status: 'ACTIVE',
        now,
      }),
    ).toBe('ok')
  })

  it('returns null days when access end is missing', () => {
    expect(daysUntilAccessEnd(null)).toBeNull()
  })

  it('builds renew mailto with business context', () => {
    const href = buildMembershipRenewMailto({
      businessName: 'Ada Klinik',
      businessId: 'biz-123',
      planName: 'Profesyonel',
      accessEndAt: '2026-08-01T00:00:00.000Z',
    })
    expect(href.startsWith('mailto:merhaba@asistan.online?')).toBe(true)
    expect(decodeURIComponent(href)).toContain('Ada Klinik')
    expect(decodeURIComponent(href)).toContain('biz-123')
  })
})
