/**
 * Mirrors web `lib/format.ts` → APPOINTMENT_STATUS_LABELS.
 * Keep Turkish strings identical — no ASCII drift.
 */
export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Onay bekliyor',
  CONFIRMED: 'Onaylandı',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
  NO_SHOW: 'Gelinmedi',
}

export function appointmentStatusLabel(status: string): string {
  return APPOINTMENT_STATUS_LABELS[status] ?? status
}
