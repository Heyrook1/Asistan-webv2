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
}

export function can(session: SessionContext | null, permission: Permission) {
  if (session?.isOwner || session?.role === 'SUPER_ADMIN') return true
  return Boolean(session && session.permissions.includes(permission))
}

/** Matches page gates on /dashboard/ajanda (and legacy randevular/takvim redirects). */
export const APPOINTMENT_SCHEDULE_PERMISSIONS: Permission[] = [
  'appointment.manage',
  'appointment.view',
  'appointment.own.view',
]

export function canViewAppointmentSchedule(session: SessionContext | null) {
  if (!session) return false
  if (session.isOwner || session.role === 'SUPER_ADMIN') return true
  return APPOINTMENT_SCHEDULE_PERMISSIONS.some((permission) => session.permissions.includes(permission))
}

/** True when the user may only see their own appointments (e.g. PERSONEL). */
export function isOwnAppointmentsOnly(session: SessionContext | null) {
  if (!session) return false
  if (session.isOwner || session.role === 'SUPER_ADMIN') return false
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
