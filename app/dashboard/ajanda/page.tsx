import { requirePageAnyPermission, can } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getAppointmentsList, getAppointmentsRange } from '@/lib/queries'
import { AppointmentsBoard } from '@/app/dashboard/randevular/appointments-board'
import { CalendarBoard } from '@/app/dashboard/takvim/calendar-board'
import type { AjandaMode } from '@/components/dashboard/ajanda-mode-switch'

export const dynamic = 'force-dynamic'

function parseMode(raw: string | undefined): AjandaMode {
  return raw === 'takvim' ? 'takvim' : 'liste'
}

export default async function AjandaPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string
    status?: string
    create?: string
    date?: string
    id?: string
  }>
}) {
  const sp = await searchParams
  const mode = parseMode(sp.mode)
  const session = await requirePageAnyPermission(
    'appointment.manage',
    'appointment.view',
    'appointment.own.view',
  )

  if (mode === 'liste') {
    const [appointments, patients, services, staff, locations] = await Promise.all([
      getAppointmentsList(session.businessId, { status: sp.status }, session),
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
      prisma.location.findMany({
        where: { businessId: session.businessId, isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true },
      }),
    ])

    return (
      <AppointmentsBoard
        initialStatus={sp.status ?? 'ALL'}
        initialCreateOpen={sp.create === '1'}
        appointments={appointments.map((a) => ({
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
          notes: a.notes,
        }))}
        patients={patients.map((p) => ({ id: p.id, label: `${p.fullName} (#${p.patientNumber})` }))}
        services={services.map((s) => ({ id: s.id, label: s.name, durationMin: s.durationMin }))}
        staff={staff.map((s) => ({ id: s.id, label: s.fullName }))}
        locations={locations.map((l) => ({ id: l.id, label: l.name }))}
        canManage={can(session, 'appointment.manage')}
        defaultStaffId={session.staffMemberId ?? undefined}
      />
    )
  }

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
      events={appointments.map((a) => ({
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
      defaultStaffId={session.staffMemberId ?? undefined}
      pendingCount={appointments.filter((a) => a.status === 'SCHEDULED').length}
      initialDate={sp.date}
    />
  )
}
