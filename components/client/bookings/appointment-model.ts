/**
 * Appointment view types + pure presentation helpers for the patient bookings UI.
 * Kept separate from the panel component so logic is unit-testable and reusable
 * (Home upcoming card, appointments list) without importing React.
 */

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export type AppointmentRow = {
  id: string
  status: AppointmentStatus
  date: string
  startTime: string
  endTime: string
  businessId: string
  serviceId: string
  doctorId: string | null
  locationId: string | null
  hasReview?: boolean
  clinic: { id: string; name: string; slug?: string | null }
  doctor: { id: string; fullName: string; specialty: string | null } | null
  service: { id: string; name: string }
  location: { id: string; name: string; address: string | null } | null
}

export type Slot = { startTime: string; endTime: string }

/** Same pair shape as useLanguage().t — for module-level helpers. */
export type Translate = <T>(translations: { tr: T; en: T }) => T

export function statusLabel(status: AppointmentStatus, t: Translate): string {
  switch (status) {
    case 'SCHEDULED':
      return t({ tr: 'Onay bekliyor', en: 'Awaiting confirmation' })
    case 'CONFIRMED':
      return t({ tr: 'Onaylandı', en: 'Confirmed' })
    case 'COMPLETED':
      return t({ tr: 'Tamamlandı', en: 'Completed' })
    case 'CANCELLED':
      return t({ tr: 'İptal', en: 'Cancelled' })
    case 'NO_SHOW':
      return t({ tr: 'Gelinmedi', en: 'No-show' })
  }
}

export const STATUS_CLASS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-amber-50 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-sky-50 text-sky-800 border-sky-200',
  COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-800 border-rose-200',
  NO_SHOW: 'bg-slate-100 text-slate-700 border-slate-200',
}

export function isActive(status: AppointmentStatus): boolean {
  return status === 'SCHEDULED' || status === 'CONFIRMED'
}

export function appointmentStartsAtMs(date: string, startTime: string): number {
  const time = startTime.length === 5 ? `${startTime}:00` : startTime
  return new Date(`${date}T${time}`).getTime()
}

/** Yaklaşan = aktif durum + henüz başlamamış (geçmiş tarihli SCHEDULED past'e düşer). */
export function isUpcomingRow(row: AppointmentRow, now = Date.now()): boolean {
  return isActive(row.status) && appointmentStartsAtMs(row.date, row.startTime) >= now
}

export function nextStepCopy(status: AppointmentStatus, t: Translate): string {
  switch (status) {
    case 'SCHEDULED':
      return t({
        tr: 'Klinik onayı bekleniyor. Onaylanınca bildirim alırsınız.',
        en: 'Waiting for clinic confirmation. You will be notified once it is approved.',
      })
    case 'CONFIRMED':
      return t({
        tr: 'Randevunuz onaylandı. Zamanı gelince hatırlatma gönderilir.',
        en: 'Your appointment is confirmed. A reminder will be sent closer to the time.',
      })
    case 'COMPLETED':
      return t({
        tr: 'Ziyaret tamamlandı. Deneyiminizi puanlayabilirsiniz.',
        en: 'Visit completed. You can rate your experience.',
      })
    case 'CANCELLED':
      return t({
        tr: 'Bu randevu iptal edildi. Yeni bir saat seçebilirsiniz.',
        en: 'This appointment was cancelled. You can pick a new time.',
      })
    case 'NO_SHOW':
      return t({
        tr: 'Bu randevu gelinmedi olarak işaretlendi.',
        en: 'This appointment was marked as a no-show.',
      })
  }
}
