export type OverviewStats = {
  todayAppointments: number
  pendingAppointments: number
  activePatients: number
  confirmedAppointments: number
  monthlyRevenue: number
}

export type CalendarEvent = {
  id: string
  patientId: string
  patientName: string
  serviceName: string
  staffName: string | null
  date: string
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
}

export type { PriorityItem } from '@/lib/priority-engine'
