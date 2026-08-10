import { APPOINTMENT_STATUS_LABELS } from '@/lib/format'
import { combineDateAndTime } from '@/lib/health-timeline/group-by-day'
import type { HealthTimelineItem } from '@/lib/health-timeline/types'
import {
  DEFAULT_CLINIC_TIMEZONE,
  normalizeWallTime,
  resolveClinicTimezone,
} from '@/lib/datetime/clinic-zone'

export type PatientVisitAppointment = {
  id: string
  date: string
  startTime?: string | null
  status: string
  clinic?: { name?: string | null; timezone?: string | null } | null
  service?: { name?: string | null } | null
  doctor?: { fullName?: string | null; specialty?: string | null } | null
  location?: { name?: string | null } | null
}

/** Patient-safe visit timeline only — no clinic chart PHI. */
export function buildPatientVisitTimeline(
  appointments: PatientVisitAppointment[],
  timeZone?: string | null,
): HealthTimelineItem[] {
  const fallbackZone = resolveClinicTimezone(timeZone ?? DEFAULT_CLINIC_TIMEZONE)
  return appointments
    .map((appt) => {
      const zone = resolveClinicTimezone(appt.clinic?.timezone ?? fallbackZone)
      const occurred = combineDateAndTime(appt.date, appt.startTime, zone)
      const parts = [
        appt.doctor?.fullName,
        appt.doctor?.specialty,
        appt.location?.name,
        APPOINTMENT_STATUS_LABELS[appt.status] ?? appt.status,
      ].filter(Boolean)

      return {
        id: `visit:${appt.id}`,
        kind: 'visit' as const,
        occurredAt: occurred.toISOString(),
        clockTime: appt.startTime ? normalizeWallTime(appt.startTime) : null,
        title: appt.service?.name ?? 'Randevu',
        subtitle: parts.join(' · ') || null,
        status: appt.status,
        clinicName: appt.clinic?.name ?? null,
        sourceEntityId: appt.id,
        href: '/client/bookings',
      }
    })
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
}
