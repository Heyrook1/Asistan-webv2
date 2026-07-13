import type { AppointmentStatus } from '@prisma/client'

/** Allowed clinic-driven status transitions. Reschedule uses its own action and resets to SCHEDULED. */
export const APPOINTMENT_STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  SCHEDULED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
}

export function canTransitionAppointmentStatus(
  from: AppointmentStatus,
  to: AppointmentStatus
): boolean {
  if (from === to) return true
  return APPOINTMENT_STATUS_TRANSITIONS[from].includes(to)
}

export function allowedNextStatuses(from: AppointmentStatus): AppointmentStatus[] {
  return APPOINTMENT_STATUS_TRANSITIONS[from]
}
