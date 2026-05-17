'use client'

export type AppointmentStatus = 'pending' | 'approved' | 'completed' | 'cancelled'
export type RecordType = 'note' | 'lab' | 'treatment' | 'image' | 'file'

export type User = { id: string; name: string; email: string; role: string; avatar?: string; status: 'active' | 'inactive' }
export type Patient = {
  id: string
  fullName: string
  phone: string
  email: string
  birthDate?: string
  gender?: string
  notes?: string
  tags: string[]
  createdAt: string
  lastVisitAt?: string
}
export type PatientRecord = {
  id: string
  patientId: string
  type: RecordType
  title: string
  description: string
  fileUrl?: string
  createdAt: string
  createdBy: string
}
export type Service = { id: string; name: string; duration: number; price: number; category: string; color: string; active: boolean; description?: string }
export type TeamMember = { id: string; name: string; email: string; role: string; permissions: string[]; status: 'active' | 'inactive' }
export type Appointment = {
  id: string
  patientId: string
  serviceId: string
  staffId: string
  date: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  notes?: string
}
export type Notification = { id: string; title: string; message: string; type: string; read: boolean; createdAt: string }
export type Review = { id: string; rating: number; message: string; createdAt: string }

export type DashboardDB = {
  users: User[]
  patients: Patient[]
  records: PatientRecord[]
  appointments: Appointment[]
  services: Service[]
  team: TeamMember[]
  notifications: Notification[]
  reviews: Review[]
}

const KEY = 'asistan.dashboard.db.v1'

export const emptyDb: DashboardDB = {
  users: [],
  patients: [],
  records: [],
  appointments: [],
  services: [],
  team: [],
  notifications: [],
  reviews: [],
}

export function readDb(): DashboardDB {
  if (typeof window === 'undefined') return emptyDb
  const raw = localStorage.getItem(KEY)
  if (!raw) return emptyDb
  try {
    return { ...emptyDb, ...JSON.parse(raw) } as DashboardDB
  } catch {
    return emptyDb
  }
}

export function writeDb(db: DashboardDB) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

export function uid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
}

export function calcStats(db: DashboardDB) {
  const today = new Date().toISOString().slice(0, 10)
  const month = new Date().toISOString().slice(0, 7)
  const todayAppointments = db.appointments.filter((a) => a.date === today)
  const pending = db.appointments.filter((a) => a.status === 'pending').length
  const activePatients = db.patients.length
  const averageReview = db.reviews.length ? (db.reviews.reduce((acc, r) => acc + r.rating, 0) / db.reviews.length) : null
  const servicePrice = new Map(db.services.map((s) => [s.id, s.price]))
  const monthlyRevenue = db.appointments
    .filter((a) => a.status === 'completed' && a.date.startsWith(month))
    .reduce((acc, a) => acc + (servicePrice.get(a.serviceId) || 0), 0)
  return {
    todayAppointments: todayAppointments.length,
    pending,
    activePatients,
    averageReview,
    monthlyRevenue,
  }
}
