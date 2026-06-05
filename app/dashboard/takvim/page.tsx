import { requirePageAnyPermission, can } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getAppointmentsRange } from '@/lib/queries'
import { CalendarBoard } from './calendar-board'

export const dynamic = 'force-dynamic'

export default async function TakvimPage() {
  const session = await requirePageAnyPermission(
    'appointment.manage',
    'appointment.view',
    'appointment.own.view',
  )

  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - 12, 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 13, 0)

  const [appointments, patients, services, staff, business, locations] = await Promise.all([
    getAppointmentsRange(session.businessId, { from, to }, session),
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
    prisma.business.findUnique({
      where: { id: session.businessId },
      select: { slug: true },
    }),
    prisma.location.findMany({
      where: { businessId: session.businessId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true },
    }),
  ])

  return (
    <CalendarBoard
      events={appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'COMPLETED').map((a) => ({
        id: a.id,
        patientId: a.patientId,
        patientName: a.patient.fullName,
        serviceId: a.serviceId,
        serviceName: a.service.name,
        serviceColor: a.service.color,
        staffId: a.staffId,
        staffName: a.staff?.fullName ?? null,
        locationId: a.locationId,
        locationName: a.location?.name ?? null,
        date: a.date.toISOString().slice(0, 10),
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
      }))}
      patients={patients.map((p) => ({ id: p.id, label: `${p.fullName} (#${p.patientNumber})` }))}
      services={services.map((s) => ({ id: s.id, name: s.name, durationMin: s.durationMin, color: s.color }))}
      staff={staff.map((s) => ({ id: s.id, name: s.fullName, color: s.color }))}
      locations={locations.map((l) => ({ id: l.id, label: l.name }))}
      canCreate={can(session, 'appointment.manage')}
      bookingSlug={business?.slug ?? 'klinik'}
    />
  )
}
