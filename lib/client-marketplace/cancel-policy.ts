/**
 * Hasta iptal / erteleme politikası (saat cinsinden minimum ön süre).
 * Business alanı yoksa env / varsayılan kullanılır — uydurma “her zaman iptal” yok.
 */

export const DEFAULT_CANCEL_MIN_HOURS = 4

export function getCancelMinHoursBefore(): number {
  const raw = process.env.CLIENT_CANCEL_MIN_HOURS?.trim()
  if (!raw) return DEFAULT_CANCEL_MIN_HOURS
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0 || n > 168) return DEFAULT_CANCEL_MIN_HOURS
  return n
}

/** Appointment local date (YYYY-MM-DD) + HH:mm → Date in clinic-ish local (Europe/Istanbul offset approx via Date parse). */
export function appointmentStartsAt(dateIso: string, startTime: string): Date {
  const time = startTime.length === 5 ? `${startTime}:00` : startTime
  return new Date(`${dateIso}T${time}`)
}

export function hoursUntilAppointment(dateIso: string, startTime: string, now = new Date()): number {
  const starts = appointmentStartsAt(dateIso, startTime)
  return (starts.getTime() - now.getTime()) / (1000 * 60 * 60)
}

export function canCancelOrRescheduleByPolicy(
  dateIso: string,
  startTime: string,
  minHours = getCancelMinHoursBefore(),
  now = new Date(),
): { ok: true } | { ok: false; hoursLeft: number; minHours: number } {
  const hoursLeft = hoursUntilAppointment(dateIso, startTime, now)
  if (hoursLeft < minHours) {
    return { ok: false, hoursLeft, minHours }
  }
  return { ok: true }
}

export function cancelPolicyUserMessage(minHours: number): string {
  return `Randevu başlangıcına ${minHours} saatten az kaldığı için iptal veya yeniden planlama yapılamaz. Klinik ile iletişime geçin.`
}
