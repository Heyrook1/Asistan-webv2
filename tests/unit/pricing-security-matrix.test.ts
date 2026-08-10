import { describe, expect, it } from 'vitest'

import {
  listPublicMarketingPlanCards,
  listPublicPricingPlans,
  PUBLIC_PRICING_MATRIX_ROWS,
} from '@/lib/pricing/public-catalog'

describe('pricing security matrix (no core-security paywall)', () => {
  it('ships tenant isolation, RBAC, and privacy controls on every plan', () => {
    for (const plan of listPublicPricingPlans({ includeDemo: true })) {
      expect(plan.marketing.matrix.tenantIsolation).toBe(true)
      expect(plan.marketing.matrix.roleAccess).toBe(true)
      expect(plan.marketing.matrix.privacyControls).toBe(true)
    }
  })

  it('reserves advanced audit export for Enterprise only among paid cards', () => {
    const paid = listPublicMarketingPlanCards()
    const starter = paid.find((p) => p.code === 'STARTER')
    const pro = paid.find((p) => p.code === 'PROFESSIONAL')
    const ent = paid.find((p) => p.code === 'ENTERPRISE')
    expect(starter?.marketing.matrix.auditExport).toBe(false)
    expect(pro?.marketing.matrix.auditExport).toBe(false)
    expect(ent?.marketing.matrix.auditExport).toBe(true)
  })

  it('marks core security rows explicitly in the comparison matrix', () => {
    const core = PUBLIC_PRICING_MATRIX_ROWS.filter((row) => row.coreSecurity)
    expect(core.map((r) => r.key)).toEqual([
      'tenantIsolation',
      'roleAccess',
      'privacyControls',
    ])
  })
})
