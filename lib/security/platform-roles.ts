import type { Prisma, TeamRole } from '@prisma/client'

/**
 * Platform-level roles that must never be granted through tenant team UI/actions.
 * P0.8 paid-pilot gate — owner → SUPER_ADMIN escalation.
 */
export function platformRoleAssignmentError(role: string | null | undefined): string | null {
  if (role === 'SUPER_ADMIN') {
    return 'SUPER_ADMIN platform rolu ekip yonetimi uzerinden atanamaz.'
  }
  return null
}

/**
 * Roles that may appear in clinic appointment / ops staff pickers.
 * SUPER_ADMIN is platform-only and must never be assignable as tenant staff.
 */
export const CLINIC_ASSIGNABLE_ROLES = [
  'ISLETME_SAHIBI',
  'DOKTOR',
  'SEKRETER',
  'PERSONEL',
] as const satisfies readonly TeamRole[]

export type ClinicAssignableRole = (typeof CLINIC_ASSIGNABLE_ROLES)[number]

export function isClinicAssignableRole(role: string | null | undefined): role is ClinicAssignableRole {
  return Boolean(role && (CLINIC_ASSIGNABLE_ROLES as readonly string[]).includes(role))
}

/** Prisma `where` fragment for active clinic staff of a tenant (excludes SUPER_ADMIN). */
export function clinicAssignableStaffWhere(businessId: string): Prisma.TeamMemberWhereInput {
  return {
    businessId,
    isActive: true,
    role: { in: [...CLINIC_ASSIGNABLE_ROLES] },
  }
}

export function clinicStaffAssignmentError(input: {
  staff:
    | {
        businessId: string
        isActive: boolean
        role: string
      }
    | null
    | undefined
  expectedBusinessId: string
}): string | null {
  if (!input.staff) return 'Personel bulunamadı'
  if (input.staff.businessId !== input.expectedBusinessId) {
    return 'Personel bu işletmeye ait değil'
  }
  if (!input.staff.isActive) return 'Personel pasif'
  if (!isClinicAssignableRole(input.staff.role)) {
    return 'Platform rolü (SUPER_ADMIN) klinik personeli olarak atanamaz'
  }
  return null
}
