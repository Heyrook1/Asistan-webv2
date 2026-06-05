// Shared notification types — safe to import from client and server.
// Server-only logic lives in `./service.ts`.

import type { NotificationActionStatus, NotificationActionType, NotificationPriority, NotificationType } from '@prisma/client'

export const NOTIFICATION_SUBTYPES = [
  'appointment_assigned',
  'appointment_pending_approval',
  'appointment_updated',
  'appointment_cancelled',
  'appointment_approved',
  'appointment_rescheduled',
  'patient_created',
  'patient_updated',
  'patient_note_added',
  'patient_file_uploaded',
  'treatment_added',
  'lab_result_added',
  'team_member_added',
  'permission_changed',
  'system_alert',
] as const

export type NotificationSubtype = (typeof NOTIFICATION_SUBTYPES)[number]

export type NotificationStatus = 'unread' | 'read' | 'archived'

export const NOTIFICATION_SUBTYPE_LABELS: Record<NotificationSubtype, string> = {
  appointment_assigned: 'Randevu atandı',
  appointment_pending_approval: 'Onay bekleyen randevu',
  appointment_updated: 'Randevu güncellendi',
  appointment_cancelled: 'Randevu iptal edildi',
  appointment_approved: 'Randevu onaylandı',
  appointment_rescheduled: 'Randevu ertelendi',
  patient_created: 'Yeni hasta kartı',
  patient_updated: 'Hasta kartı güncellendi',
  patient_note_added: 'Yeni not eklendi',
  patient_file_uploaded: 'Yeni dosya yüklendi',
  treatment_added: 'Yeni tedavi',
  lab_result_added: 'Yeni tahlil sonucu',
  team_member_added: 'Ekip üyesi eklendi',
  permission_changed: 'Yetkiler güncellendi',
  system_alert: 'Sistem bildirimi',
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  APPOINTMENT: 'Randevu',
  PATIENT: 'Hasta',
  TEAM: 'Ekip',
  SYSTEM: 'Sistem',
}

export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, string> = {
  LOW: 'Düşük',
  NORMAL: 'Normal',
  HIGH: 'Yüksek',
  URGENT: 'Acil',
}

export const NOTIFICATION_PRIORITY_COLORS: Record<NotificationPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600 border-slate-200',
  NORMAL: 'bg-sky-50 text-sky-700 border-sky-200',
  HIGH: 'bg-amber-50 text-amber-800 border-amber-200',
  URGENT: 'bg-rose-50 text-rose-700 border-rose-200',
}

export type NotificationActionDraft = {
  label: string
  actionType: NotificationActionType
  payload?: Record<string, unknown>
}

export type NotificationActionView = {
  id: string
  label: string
  actionType: NotificationActionType
  payload: Record<string, unknown> | null
  status: NotificationActionStatus
  completedAt: string | null
}

export type NotificationListItem = {
  id: string
  type: NotificationType
  subtype: NotificationSubtype | string | null
  title: string
  message: string
  link: string | null
  entityType: string | null
  entityId: string | null
  priority: NotificationPriority
  actionRequired: boolean
  metadata: Record<string, unknown> | null
  isRead: boolean
  status: NotificationStatus
  readAt: string | null
  archivedAt: string | null
  createdAt: string
  actor: { id: string; fullName: string } | null
  actions: NotificationActionView[]
}

export function deriveStatus(input: { isRead: boolean; archivedAt: Date | string | null }): NotificationStatus {
  if (input.archivedAt) return 'archived'
  return input.isRead ? 'read' : 'unread'
}
