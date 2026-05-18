// Client-safe RBAC types and constants.
// `lib/session.ts` re-exports these and adds server-only helpers.

import type { TeamRole } from '@prisma/client'

export const PERMISSIONS = [
  'patient.view',
  'patient.edit',
  'appointment.manage',
  'team.manage',
  'analytics.view',
  'file.view',
  'medical_note.view',
  'service.manage',
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
    'patient.edit',
    'appointment.manage',
    'file.view',
    'medical_note.view',
    'analytics.view',
  ],
  SEKRETER: ['patient.view', 'appointment.manage', 'file.view'],
  PERSONEL: ['patient.view'],
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
}

export function can(session: SessionContext | null, permission: Permission) {
  return Boolean(session && session.permissions.includes(permission))
}
