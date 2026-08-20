import { describe, expect, it } from 'vitest'

import {
  DASHBOARD_NAV_ITEMS,
  NAV_GROUP_LABELS,
  NAV_GROUP_ORDER,
  filterDashboardNavItems,
  groupDashboardNavItems,
  isDashboardNavActive,
  mobilePrimaryNavItems,
} from '@/lib/dashboard/nav'
import type { SessionContext } from '@/lib/rbac'
import { TeamRole } from '@prisma/client'

function mockSession(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    userId: 'u1',
    fullName: 'Test',
    email: 't@example.com',
    businessId: 'b1',
    businessName: 'Demo',
    role: TeamRole.ISLETME_SAHIBI,
    permissions: [
      'patient.view',
      'patient.edit',
      'appointment.manage',
      'appointment.view',
      'service.manage',
      'team.view',
      'team.manage',
      'analytics.view',
      'analytics.revenue.view',
      'audit.view',
      'settings.business.edit',
    ],
    isOwner: true,
    staffMemberId: null,
    ...overrides,
  } as SessionContext
}

describe('dashboard nav IA', () => {
  it('defines five groups and unique ids/hrefs', () => {
    expect(NAV_GROUP_ORDER).toEqual(['operasyon', 'hasta', 'finans', 'iletisim', 'yonetim'])
    expect(Object.keys(NAV_GROUP_LABELS)).toHaveLength(5)
    const ids = DASHBOARD_NAV_ITEMS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    const hrefs = DASHBOARD_NAV_ITEMS.map((i) => i.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })

  it('groups filtered items in IA order', () => {
    const sections = groupDashboardNavItems(
      filterDashboardNavItems(DASHBOARD_NAV_ITEMS, {
        session: mockSession(),
        clinicAnalyticsEnabled: true,
        teamMessagingEnabled: true,
        showSuperAdmin: true,
      }),
    )
    expect(sections.map((s) => s.group)).toEqual([
      'operasyon',
      'hasta',
      'finans',
      'iletisim',
      'yonetim',
    ])
    expect(sections.find((s) => s.group === 'operasyon')?.items.map((i) => i.id)).toEqual([
      'overview',
      'agenda',
    ])
    expect(sections.find((s) => s.group === 'iletisim')?.items.map((i) => i.id)).toEqual([
      'notifications',
      'messages',
    ])
    expect(sections.find((s) => s.group === 'hasta')?.items.map((i) => i.id)).toEqual([
      'patients',
      'identity-matches',
      'intake',
    ])
  })

  it('limits mobile primary to overview, agenda, patients', () => {
    const primary = mobilePrimaryNavItems(DASHBOARD_NAV_ITEMS).map((i) => i.id)
    expect(primary).toEqual(['overview', 'agenda', 'patients'])
  })

  it('matches ayarlar tabs by query param', () => {
    expect(isDashboardNavActive('/dashboard/ayarlar', '/dashboard/ayarlar?tab=hesap', 'tab=hesap')).toBe(
      true,
    )
    expect(
      isDashboardNavActive('/dashboard/ayarlar', '/dashboard/ayarlar?tab=abonelik', 'tab=hesap'),
    ).toBe(false)
  })
})
