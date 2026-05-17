'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { calcStats, emptyDb, readDb, uid, writeDb, type DashboardDB, type Patient, type PatientRecord, type Appointment, type Service, type TeamMember } from '@/lib/dashboard-store'

type Ctx = {
  db: DashboardDB
  loaded: boolean
  stats: ReturnType<typeof calcStats>
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => void
  addService: (service: Omit<Service, 'id' | 'active'>) => void
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'endTime'> & { status?: Appointment['status'] }) => void
  addRecord: (record: Omit<PatientRecord, 'id' | 'createdAt'>) => void
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void
  updateTeamMember: (id: string, patch: Partial<TeamMember>) => void
  markNotificationRead: (id: string) => void
}

const DashboardDataContext = createContext<Ctx | null>(null)

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DashboardDB>(emptyDb)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setDb(readDb())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) writeDb(db)
  }, [db, loaded])

  const value = useMemo<Ctx>(() => ({
    db,
    loaded,
    stats: calcStats(db),
    addPatient: (patient) => setDb((prev) => ({ ...prev, patients: [{ ...patient, id: uid(), createdAt: new Date().toISOString() }, ...prev.patients] })),
    addService: (service) => setDb((prev) => ({ ...prev, services: [{ ...service, id: uid(), active: true }, ...prev.services] })),
    addAppointment: (appointment) => {
      const service = db.services.find((s) => s.id === appointment.serviceId)
      const start = Number(appointment.startTime.split(':')[0])
      const endHour = Math.min(23, start + Math.max(1, Math.round((service?.duration || 30) / 60)))
      const endTime = `${String(endHour).padStart(2, '0')}:00`
      setDb((prev) => ({
        ...prev,
        appointments: [{ ...appointment, id: uid(), status: appointment.status || 'pending', endTime }, ...prev.appointments],
      }))
    },
    addRecord: (record) => setDb((prev) => ({ ...prev, records: [{ ...record, id: uid(), createdAt: new Date().toISOString() }, ...prev.records] })),
    addTeamMember: (member) => setDb((prev) => ({ ...prev, team: [{ ...member, id: uid() }, ...prev.team] })),
    updateTeamMember: (id, patch) => setDb((prev) => ({ ...prev, team: prev.team.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
    markNotificationRead: (id) => setDb((prev) => ({ ...prev, notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  }), [db, loaded])

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext)
  if (!ctx) throw new Error('useDashboardData must be used inside DashboardDataProvider')
  return ctx
}
