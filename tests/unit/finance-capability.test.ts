import { describe, it, expect } from 'vitest'

import {
  can,
  canViewFinance,
  memberHasFinanceAccess,
  ROLE_DEFAULT_PERMISSIONS,
  type SessionContext,
} from '@/lib/rbac'

function session(partial: Partial<SessionContext> & Pick<SessionContext, 'role' | 'permissions'>): SessionContext {
  return {
    userId: 'u-1',
    email: 'a@b.com',
    fullName: 'Test User',
    businessId: 'biz-1',
    businessName: 'Test Klinik',
    isOwner: false,
    staffMemberId: 'staff-1',
    ...partial,
  }
}

describe('finance capability (ciro)', () => {
  it('ISLETME_SAHIBI always has finance even with empty/stale permissions', () => {
    const ownerRole = session({
      role: 'ISLETME_SAHIBI',
      permissions: ['patient.view'],
      isOwner: false,
    })
    expect(canViewFinance(ownerRole)).toBe(true)
    expect(can(ownerRole, 'analytics.revenue.view')).toBe(true)
  })

  it('isOwner always has finance', () => {
    const owner = session({
      role: 'DOKTOR',
      permissions: [],
      isOwner: true,
    })
    expect(canViewFinance(owner)).toBe(true)
  })

  it('DOKTOR with analytics.view only cannot see finance', () => {
    const doktor = session({
      role: 'DOKTOR',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.DOKTOR],
    })
    expect(can(doktor, 'analytics.view')).toBe(true)
    expect(canViewFinance(doktor)).toBe(false)
  })

  it('DOKTOR with explicit revenue grant can see finance', () => {
    const doktor = session({
      role: 'DOKTOR',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.DOKTOR, 'analytics.revenue.view'],
    })
    expect(canViewFinance(doktor)).toBe(true)
  })

  it('memberHasFinanceAccess treats ISLETME_SAHIBI as finance admin', () => {
    expect(memberHasFinanceAccess({ role: 'ISLETME_SAHIBI', permissions: [] })).toBe(true)
    expect(memberHasFinanceAccess({ role: 'DOKTOR', permissions: ['analytics.view'] })).toBe(false)
    expect(
      memberHasFinanceAccess({
        role: 'DOKTOR',
        permissions: ['analytics.revenue.view'],
      }),
    ).toBe(true)
  })
})
