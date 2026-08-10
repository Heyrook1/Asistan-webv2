import { describe, expect, it } from 'vitest'

import type { SessionContext } from '@/lib/rbac'
import {
  canManageClinicSettings,
  resolveSettingsTab,
  visibleSettingsTabs,
} from '@/lib/settings/tabs'

function session(partial: Partial<SessionContext>): SessionContext {
  return {
    userId: 'u1',
    email: 'a@b.com',
    fullName: 'Test',
    businessId: 'b1',
    businessName: 'Klinik',
    role: 'PERSONEL',
    permissions: [],
    isOwner: false,
    staffMemberId: null,
    ...partial,
  }
}

describe('settings tabs deep-link (P1-05)', () => {
  it('opens abonelik for owner', () => {
    expect(resolveSettingsTab('abonelik', true)).toBe('abonelik')
    expect(visibleSettingsTabs(true)).toContain('abonelik')
    expect(visibleSettingsTabs(true)).toContain('isletme')
  })

  it('falls back to hesap for staff without business admin', () => {
    expect(resolveSettingsTab('abonelik', false)).toBe('hesap')
    expect(visibleSettingsTabs(false)).toEqual(['hesap', 'entegrasyonlar'])
  })

  it('treats ISLETME_SAHIBI as clinic settings admin even when isOwner is false', () => {
    const s = session({ role: 'ISLETME_SAHIBI', isOwner: false })
    expect(canManageClinicSettings(s)).toBe(true)
    expect(resolveSettingsTab('abonelik', canManageClinicSettings(s))).toBe('abonelik')
  })

  it('treats settings.business.edit as enough for business tabs', () => {
    const s = session({
      role: 'SEKRETER',
      permissions: ['settings.business.edit'],
    })
    expect(canManageClinicSettings(s)).toBe(true)
  })

  it('keeps entegrasyonlar available without business admin', () => {
    expect(resolveSettingsTab('entegrasyonlar', false)).toBe('entegrasyonlar')
  })
})
