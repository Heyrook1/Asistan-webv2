import { APPOINTMENT_STATUS_LABELS } from '@/lib/format'

export type CalendarEvent = {
  id: string
  patientId: string
  patientName: string
  serviceId: string
  serviceName: string
  serviceColor: string
  staffId: string | null
  staffName: string | null
  locationId: string | null
  locationName: string | null
  date: string
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
}

export type Event = CalendarEvent

export type View = 'day' | 'week' | 'month'

export const VIEW_LABEL: Record<View, string> = { day: 'Gün', week: 'Hafta', month: 'Ay' }

export const STATUS_FILTERS = [
  { value: 'agenda', label: 'Ajanda (bekleyen + onaylı)' },
  { value: 'all', label: 'Tüm durumlar' },
  { value: 'SCHEDULED', label: APPOINTMENT_STATUS_LABELS.SCHEDULED },
  { value: 'CONFIRMED', label: APPOINTMENT_STATUS_LABELS.CONFIRMED },
  { value: 'COMPLETED', label: APPOINTMENT_STATUS_LABELS.COMPLETED },
  { value: 'CANCELLED', label: APPOINTMENT_STATUS_LABELS.CANCELLED },
  { value: 'NO_SHOW', label: APPOINTMENT_STATUS_LABELS.NO_SHOW },
]

export const HOUR_START = 8
export const HOUR_END = 21

export const WEEK_DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
export const FULL_WEEK_DAY_LABELS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
