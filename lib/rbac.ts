// Client-safe RBAC types and constants.
// `lib/session.ts` re-exports these and adds server-only helpers.

import type { TeamRole } from '@prisma/client'

export const PERMISSIONS = [
  'patient.view',
  'patient.create',
  'patient.edit',
  'patient.archive',
  'patient.delete',
  'medical_note.create',
  'appointment.manage',
  'appointment.view',
  'appointment.own.view',
  'appointment.create',
  'appointment.edit',
  'appointment.cancel',
  'team.manage',
  'team.view',
  'team.create',
  'team.role.edit',
  'team.permission.edit',
  'analytics.view',
  'analytics.revenue.view',
  'file.view',
  'file.upload',
  'file.delete',
  'medical_note.view',
  'service.manage',
  'settings.business.edit',
  'settings.security.edit',
  'audit.view',
  'compliance.manage',
] as const

export type Permission = (typeof PERMISSIONS)[number]

export const ROLE_LABELS: Record<TeamRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ISLETME_SAHIBI: 'İşletme Sahibi',
  DOKTOR: 'Doktor',
  SEKRETER: 'Sekreter',
  PERSONEL: 'Personel',
}

export const ROLE_DEFAULT_PERMISSIONS: Record<TeamRole, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  ISLETME_SAHIBI: [...PERMISSIONS],
  DOKTOR: [
    'patient.view',
    'patient.create',
    'patient.edit',
    'patient.archive',
    'appointment.manage',
    'appointment.view',
    'appointment.create',
    'appointment.edit',
    'appointment.cancel',
    'file.view',
    'file.upload',
    'medical_note.view',
    'medical_note.create',
    'analytics.view',
  ],
  SEKRETER: [
    'patient.view',
    'patient.create',
    'patient.edit',
    'appointment.manage',
    'appointment.view',
    'appointment.create',
    'appointment.edit',
    'appointment.cancel',
    'file.view',
    'file.upload',
  ],
  PERSONEL: ['patient.view', 'appointment.own.view'],
}

export type SessionContext = {
  userId: string
  email: string
  fullName: string
  businessId: string
  businessName: string
  role: TeamRole
  permissions: Permission[]
  isOwner: boolean
  staffMemberId: string | null
  /** Super-admin viewing another clinic's dashboard. */
  supportMode?: { businessId: string; businessName: string } | null
}

/** Clinic admins — full capability matrix regardless of stale TeamMember.permissions JSON. */
export function isPrivilegedClinicAdmin(session: SessionContext | null): boolean {
  if (!session) return false
  return (
    session.isOwner ||
    session.role === 'SUPER_ADMIN' ||
    session.role === 'ISLETME_SAHIBI'
  )
}

/**
 * Single capability source for menu, route guards, and server actions.
 * Prefer this over raw `session.permissions.includes(...)`.
 */
export function can(session: SessionContext | null, permission: Permission) {
  if (!session) return false
  if (isPrivilegedClinicAdmin(session)) return true
  return session.permissions.includes(permission)
}

export function canAny(session: SessionContext | null, permissions: readonly Permission[]) {
  if (!session) return false
  if (isPrivilegedClinicAdmin(session)) return true
  if (permissions.length === 0) return true
  return permissions.some((permission) => session.permissions.includes(permission))
}

/** Team module — list / invite / roles (nav + page + actions share this). */
export const TEAM_ACCESS_PERMISSIONS = ['team.view', 'team.manage'] as const satisfies readonly Permission[]

export function canAccessTeam(session: SessionContext | null) {
  return canAny(session, TEAM_ACCESS_PERMISSIONS)
}

/**
 * Product decision: finance (ciro) visibility.
 * - Clinic owner (`isOwner`), `ISLETME_SAHIBI`, and `SUPER_ADMIN` always have access.
 * - Other roles need explicit `analytics.revenue.view`.
 * Dashboard + Analitik MUST use this helper — never `analytics.view` for money.
 */
export const FINANCE_VIEW_PERMISSION = 'analytics.revenue.view' as const satisfies Permission

export function canViewFinance(session: SessionContext | null): boolean {
  return can(session, FINANCE_VIEW_PERMISSION)
}

/** Effective finance access for a stored team member row (role matrix + explicit grants). */
export function memberHasFinanceAccess(input: {
  role: TeamRole
  permissions: readonly string[] | null | undefined
}): boolean {
  if (input.role === 'ISLETME_SAHIBI' || input.role === 'SUPER_ADMIN') return true
  return Array.isArray(input.permissions) && input.permissions.includes(FINANCE_VIEW_PERMISSION)
}

/** Matches page gates on /dashboard/ajanda (and legacy randevular/takvim redirects). */
export const APPOINTMENT_SCHEDULE_PERMISSIONS: Permission[] = [
  'appointment.manage',
  'appointment.view',
  'appointment.own.view',
]

export function canViewAppointmentSchedule(session: SessionContext | null) {
  if (!session) return false
  if (isPrivilegedClinicAdmin(session)) return true
  return APPOINTMENT_SCHEDULE_PERMISSIONS.some((permission) => session.permissions.includes(permission))
}

/** True when the user may only see their own appointments (e.g. PERSONEL). */
export function isOwnAppointmentsOnly(session: SessionContext | null) {
  if (!session) return false
  if (isPrivilegedClinicAdmin(session)) return false
  if (session.permissions.includes('appointment.manage') || session.permissions.includes('appointment.view')) {
    return false
  }
  return session.permissions.includes('appointment.own.view')
}

export function appointmentScheduleNavLabels(session: SessionContext | null) {
  if (isOwnAppointmentsOnly(session)) {
    return {
      agenda: 'Ajandam',
      agendaShort: 'Ajandam',
      appointments: 'Ajandam',
      appointmentsShort: 'Ajandam',
      calendar: 'Ajandam',
    }
  }
  return {
    agenda: 'Ajanda',
    agendaShort: 'Ajanda',
    appointments: 'Ajanda',
    appointmentsShort: 'Ajanda',
    calendar: 'Ajanda',
  }
}
