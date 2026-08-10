/**
 * Hasta iptal / erteleme politikası (saat cinsinden minimum ön süre).
 * Business alanı yoksa env / varsayılan kullanılır — uydurma “her zaman iptal” yok.
 */

import {
  DEFAULT_CLINIC_TIMEZONE,
  resolveClinicTimezone,
  wallClockToUtc,
} from '@/lib/datetime/clinic-zone'

export const DEFAULT_CANCEL_MIN_HOURS = 4

export function getCancelMinHoursBefore(): number {
  const raw = process.env.CLIENT_CANCEL_MIN_HOURS?.trim()
  if (!raw) return DEFAULT_CANCEL_MIN_HOURS
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0 || n > 168) return DEFAULT_CANCEL_MIN_HOURS
  return n
}

/** Appointment calendar date + wall-clock HH:mm in clinic TZ → UTC instant. */
export function appointmentStartsAt(
  dateIso: string,
  startTime: string,
  timeZone: string = DEFAULT_CLINIC_TIMEZONE,
): Date {
  return wallClockToUtc(dateIso.slice(0, 10), startTime, resolveClinicTimezone(timeZone))
}

export function hoursUntilAppointment(
  dateIso: string,
  startTime: string,
  now = new Date(),
  timeZone: string = DEFAULT_CLINIC_TIMEZONE,
): number {
  const starts = appointmentStartsAt(dateIso, startTime, timeZone)
  return (starts.getTime() - now.getTime()) / (1000 * 60 * 60)
}

export function canCancelOrRescheduleByPolicy(
  dateIso: string,
  startTime: string,
  minHours = getCancelMinHoursBefore(),
  now = new Date(),
  timeZone: string = DEFAULT_CLINIC_TIMEZONE,
): { ok: true } | { ok: false; hoursLeft: number; minHours: number } {
  const hoursLeft = hoursUntilAppointment(dateIso, startTime, now, timeZone)
  if (hoursLeft < minHours) {
    return { ok: false, hoursLeft, minHours }
  }
  return { ok: true }
}

export function cancelPolicyUserMessage(minHours: number): string {
  return `Randevu başlangıcına ${minHours} saatten az kaldığı için iptal veya yeniden planlama yapılamaz. Klinik ile iletişime geçin.`
}
