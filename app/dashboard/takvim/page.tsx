import { requirePermission, can } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getAppointmentsRange } from '@/lib/queries'
import { CalendarBoard } from './calendar-board'

export const dynamic = 'force-dynamic'

export default async function TakvimPage() {
  const session = await requirePermission('appointment.manage')

  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 2, 0)

  const [appointments, patients, services, staff] = await Promise.all([
    getAppointmentsRange(session.businessId, { from, to }),
    prisma.patient.findMany({
      where: { businessId: session.businessId, isArchived: false },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true, patientNumber: true },
      take: 500,
    }),
    prisma.service.findMany({
      where: { businessId: session.businessId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, durationMin: true, color: true },
    }),
    prisma.teamMember.findMany({
      where: { businessId: session.businessId, isActive: true },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true, color: true },
    }),
  ])

  return (
    <CalendarBoard
      events={appointments.map((a) => ({
        id: a.id,
        patientId: a.patientId,
        patientName: a.patient.fullName,
        serviceId: a.serviceId,
        serviceName: a.service.name,
        serviceColor: a.service.color,
        staffId: a.staffId,
        staffName: a.staff?.fullName ?? null,
        date: a.date.toISOString().slice(0, 10),
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
      }))}
      patients={patients.map((p) => ({ id: p.id, label: `${p.fullName} (#${p.patientNumber})` }))}
      services={services.map((s) => ({ id: s.id, name: s.name, durationMin: s.durationMin, color: s.color }))}
      staff={staff.map((s) => ({ id: s.id, name: s.fullName, color: s.color }))}
      canCreate={can(session, 'appointment.manage')}
    />
  )
}
