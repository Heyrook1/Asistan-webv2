import { describe, expect, it } from 'vitest'

import {
  CLINIC_ASSIGNABLE_ROLES,
  clinicAssignableStaffWhere,
  clinicStaffAssignmentError,
  isClinicAssignableRole,
} from '@/lib/security/platform-roles'

describe('clinic assignable staff filter', () => {
  it('excludes SUPER_ADMIN from clinic-assignable roles', () => {
    expect(CLINIC_ASSIGNABLE_ROLES).not.toContain('SUPER_ADMIN')
    expect(isClinicAssignableRole('SUPER_ADMIN')).toBe(false)
    expect(isClinicAssignableRole('DOKTOR')).toBe(true)
    expect(isClinicAssignableRole('ISLETME_SAHIBI')).toBe(true)
    expect(isClinicAssignableRole('SEKRETER')).toBe(true)
    expect(isClinicAssignableRole('PERSONEL')).toBe(true)
  })

  it('scopes Prisma where to active tenant + clinic roles only', () => {
    expect(clinicAssignableStaffWhere('biz-1')).toEqual({
      businessId: 'biz-1',
      isActive: true,
      role: { in: [...CLINIC_ASSIGNABLE_ROLES] },
    })
  })
})

describe('clinicStaffAssignmentError (appointment staffId gate)', () => {
  const biz = 'biz-clinic-a'

  it('rejects missing staff', () => {
    expect(clinicStaffAssignmentError({ staff: null, expectedBusinessId: biz })).toBe(
      'Personel bulunamadı',
    )
  })

  it('rejects cross-tenant staffId', () => {
    expect(
      clinicStaffAssignmentError({
        staff: {
          businessId: 'biz-other',
          isActive: true,
          role: 'DOKTOR',
        },
        expectedBusinessId: biz,
      }),
    ).toBe('Personel bu işletmeye ait değil')
  })

  it('rejects inactive clinic staff', () => {
    expect(
      clinicStaffAssignmentError({
        staff: {
          businessId: biz,
          isActive: false,
          role: 'DOKTOR',
        },
        expectedBusinessId: biz,
      }),
    ).toBe('Personel pasif')
  })

  it('rejects platform SUPER_ADMIN even when on same tenant', () => {
    expect(
      clinicStaffAssignmentError({
        staff: {
          businessId: biz,
          isActive: true,
          role: 'SUPER_ADMIN',
        },
        expectedBusinessId: biz,
      }),
    ).toMatch(/SUPER_ADMIN|Platform rolü/)
  })

  it('allows active clinic-serviceable roles on the same tenant', () => {
    for (const role of CLINIC_ASSIGNABLE_ROLES) {
      expect(
        clinicStaffAssignmentError({
          staff: { businessId: biz, isActive: true, role },
          expectedBusinessId: biz,
        }),
      ).toBeNull()
    }
  })
})
