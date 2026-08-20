import { describe, it, expect } from 'vitest'

import {
  can,
  canAny,
  canAccessTeam,
  canViewAppointmentSchedule,
  isOwnAppointmentsOnly,
  isPrivilegedClinicAdmin,
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

describe('lib/rbac', () => {
  it('owner bypasses permission checks', () => {
    const owner = session({
      role: 'ISLETME_SAHIBI',
      permissions: [],
      isOwner: true,
    })
    expect(can(owner, 'analytics.revenue.view')).toBe(true)
    expect(can(owner, 'team.manage')).toBe(true)
    expect(canAccessTeam(owner)).toBe(true)
  })

  it('ISLETME_SAHIBI role bypasses even with stale permissions missing team.view', () => {
    const isletme = session({
      role: 'ISLETME_SAHIBI',
      permissions: ['team.manage', 'patient.view'],
      isOwner: false,
    })
    expect(isPrivilegedClinicAdmin(isletme)).toBe(true)
    expect(can(isletme, 'team.view')).toBe(true)
    expect(canAny(isletme, ['team.view', 'team.manage'])).toBe(true)
    expect(canAccessTeam(isletme)).toBe(true)
  })

  it('SUPER_ADMIN bypasses permission checks even without owner flag', () => {
    const admin = session({
      role: 'SUPER_ADMIN',
      permissions: [],
      isOwner: false,
    })
    expect(can(admin, 'patient.delete')).toBe(true)
  })

  it('PERSONEL cannot access team module', () => {
    const personel = session({
      role: 'PERSONEL',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.PERSONEL],
    })
    expect(canAccessTeam(personel)).toBe(false)
    expect(can(personel, 'team.manage')).toBe(false)
  })

  it('PERSONEL cannot manage appointments but can view own schedule', () => {
    const personel = session({
      role: 'PERSONEL',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.PERSONEL],
    })
    expect(can(personel, 'appointment.manage')).toBe(false)
    expect(can(personel, 'appointment.own.view')).toBe(true)
    expect(canViewAppointmentSchedule(personel)).toBe(true)
    expect(isOwnAppointmentsOnly(personel)).toBe(true)
  })

  it('SEKRETER can manage appointments and is not own-only', () => {
    const sekreter = session({
      role: 'SEKRETER',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.SEKRETER],
    })
    expect(can(sekreter, 'appointment.manage')).toBe(true)
    expect(isOwnAppointmentsOnly(sekreter)).toBe(false)
    expect(canAccessTeam(sekreter)).toBe(false)
  })

  it('DOKTOR cannot view revenue analytics by default', () => {
    const doktor = session({
      role: 'DOKTOR',
      permissions: [...ROLE_DEFAULT_PERMISSIONS.DOKTOR],
    })
    expect(can(doktor, 'analytics.view')).toBe(true)
    expect(can(doktor, 'analytics.revenue.view')).toBe(false)
  })

  it('null session denies everything', () => {
    expect(can(null, 'patient.view')).toBe(false)
    expect(canAccessTeam(null)).toBe(false)
    expect(canViewAppointmentSchedule(null)).toBe(false)
    expect(isOwnAppointmentsOnly(null)).toBe(false)
  })
})
