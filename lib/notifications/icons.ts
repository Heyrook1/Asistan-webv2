// Client-safe icon mapping for notification subtypes.

import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarX,
  FileText,
  FlaskConical,
  Pill,
  ShieldCheck,
  Upload,
  UserPlus,
  UserCog,
  Users,
} from 'lucide-react'

import type { NotificationSubtype } from './types'

export const NOTIFICATION_ICONS: Record<NotificationSubtype, LucideIcon> = {
  appointment_assigned: CalendarPlus,
  appointment_pending_approval: CalendarClock,
  appointment_updated: CalendarCheck,
  appointment_cancelled: CalendarX,
  appointment_approved: CalendarCheck,
  appointment_rescheduled: CalendarClock,
  patient_created: UserPlus,
  patient_updated: UserCog,
  patient_note_added: FileText,
  patient_file_uploaded: Upload,
  treatment_added: Pill,
  lab_result_added: FlaskConical,
  team_member_added: Users,
  permission_changed: ShieldCheck,
  system_alert: AlertTriangle,
}

export function iconForSubtype(subtype: string | null | undefined): LucideIcon {
  if (!subtype) return Bell
  const key = subtype as NotificationSubtype
  return NOTIFICATION_ICONS[key] ?? Bell
}
