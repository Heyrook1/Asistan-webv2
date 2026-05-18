import { requirePermission, can } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getAppointmentsList } from '@/lib/queries'
import { AppointmentsBoard } from './appointments-board'

export const dynamic = 'force-dynamic'

export default async function RandevularPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const sp = await searchParams
  const session = await requirePermission('appointment.manage')

  const [appointments, patients, services, staff] = await Promise.all([
    getAppointmentsList(session.businessId, { status: sp.status }),
    prisma.patient.findMany({
      where: { businessId: session.businessId, isArchived: false },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true, patientNumber: true },
      take: 500,
    }),
    prisma.service.findMany({
      where: { businessId: session.businessId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, durationMin: true },
    }),
    prisma.teamMember.findMany({
      where: { businessId: session.businessId, isActive: true },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true },
    }),
  ])

  const plain = appointments.map((a) => ({
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
    notes: a.notes,
  }))

  return (
    <AppointmentsBoard
      initialStatus={sp.status ?? 'ALL'}
      appointments={plain}
      patients={patients.map((p) => ({ id: p.id, label: `${p.fullName} (#${p.patientNumber})` }))}
      services={services.map((s) => ({ id: s.id, label: s.name, durationMin: s.durationMin }))}
      staff={staff.map((s) => ({ id: s.id, label: s.fullName }))}
      canManage={can(session, 'appointment.manage')}
    />
  )
}
