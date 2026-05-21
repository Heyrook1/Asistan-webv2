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
