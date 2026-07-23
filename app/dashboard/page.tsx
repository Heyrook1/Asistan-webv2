import { AdminOverview } from '@/components/dashboard/admin-overview'
import { RoleOpsHome, type RoleHomeFocus } from '@/components/dashboard/role-ops-home'
import { can, requireSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import {
  getAppointmentsList,
  getAppointmentsRange,
  getDashboardStats,
  getPendingAppointmentCount,
  getReminders,
} from '@/lib/queries'
import { buildPriorityItems } from '@/lib/priority-engine'
import type { SessionContext } from '@/lib/rbac'
import { isTeamMessagingEnabled } from '@/lib/messaging/policy'
import { isClinicAnalyticsEnabled } from '@/lib/analytics/policy'
import { isFillTheGapEnabled } from '@/lib/ops/policy'
import { getFillTheGapSnapshot } from '@/lib/ops/fill-the-gap'

export const dynamic = 'force-dynamic'

function dateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function resolveHomeFocus(session: SessionContext): RoleHomeFocus | 'owner' {
  if (session.isOwner || session.role === 'ISLETME_SAHIBI' || session.role === 'SUPER_ADMIN') {
    return 'owner'
  }
  if (session.role === 'SEKRETER') return 'secretary'
  if (session.role === 'DOKTOR') return 'doctor'
  if (session.role === 'PERSONEL') return 'staff'
  return 'owner'
}

type AppointmentRow = {
  id: string
  patientId: string
  patient: { fullName: string }
  service: { name: string }
  staff: { fullName: string } | null
  date: Date
  startTime: string
  endTime: string
  status: string
}

function serializeAppointment(appointment: AppointmentRow) {
  return {
    id: appointment.id,
    patientId: appointment.patientId,
    patientName: appointment.patient.fullName,
    serviceName: appointment.service.name,
    staffName: appointment.staff?.fullName ?? null,
    date: toIsoDate(appointment.date),
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status as 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW',
  }
}

async function loadLookups(businessId: string) {
  const [patients, services, staff, locations, business] = await Promise.all([
    prisma.patient.findMany({
      where: { businessId, isArchived: false },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true, patientNumber: true },
      take: 50,
    }),
    prisma.service.findMany({
      where: { businessId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, durationMin: true },
    }),
    prisma.teamMember.findMany({
      where: { businessId, isActive: true },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true },
    }),
    prisma.location.findMany({
      where: { businessId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true },
    }),
    prisma.business.findUnique({
      where: { id: businessId },
      select: {
        name: true,
        slug: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        currency: true,
      },
    }),
  ])

  return {
    patients,
    services,
    staff,
    locations,
    business,
    lookups: {
      patients: patients.map((patient) => ({
        id: patient.id,
        label: `${patient.fullName} (#${patient.patientNumber})`,
      })),
      services: services.map((service) => ({
        id: service.id,
        label: service.name,
        durationMin: service.durationMin,
      })),
      staff: staff.map((member) => ({ id: member.id, label: member.fullName })),
      locations: locations.map((location) => ({ id: location.id, label: location.name })),
      bookingSlug: business?.slug ?? 'klinik',
    },
  }
}

export default async function DashboardPage() {
  const session = await requireSession()
  const focus = resolveHomeFocus(session)
  const now = new Date()
  const today = dateOnly(now)

  if (focus !== 'owner') {
    const agendaTo = new Date(today)
    agendaTo.setDate(agendaTo.getDate() + 7)

    const [lookupsBundle, reminders, roleAppointments, pendingCount] = await Promise.all([
      loadLookups(session.businessId),
      getReminders(session.businessId, session.userId),
      focus === 'secretary'
        ? getAppointmentsList(session.businessId, { status: 'SCHEDULED' }, session).then((rows) =>
            rows
              .slice()
              .sort((a, b) => {
                const dateDiff = a.date.getTime() - b.date.getTime()
                if (dateDiff !== 0) return dateDiff
                return a.startTime.localeCompare(b.startTime)
              })
              .slice(0, 20),
          )
        : focus === 'doctor'
          ? getAppointmentsRange(
              session.businessId,
              {
                from: today,
                to: today,
                ...(session.staffMemberId ? { staffId: session.staffMemberId } : {}),
              },
              session,
            ).then((rows) =>
              rows.filter((row) => row.status === 'SCHEDULED' || row.status === 'CONFIRMED').slice(0, 30),
            )
          : getAppointmentsRange(
              session.businessId,
              { from: today, to: agendaTo },
              session,
            ).then((rows) =>
              rows.filter((row) => row.status === 'SCHEDULED' || row.status === 'CONFIRMED').slice(0, 20),
            ),
      focus === 'secretary'
        ? getPendingAppointmentCount(session.businessId, session)
        : Promise.resolve(0),
    ])

    const focusCount =
      focus === 'secretary' ? pendingCount : roleAppointments.length

    return (
      <RoleOpsHome
        focus={focus}
        businessName={lookupsBundle.business?.name ?? session.businessName}
        appointments={roleAppointments.map(serializeAppointment)}
        focusCount={focusCount}
        reminders={reminders.map((r) => ({
          id: r.id,
          title: r.title,
          note: r.note,
          dueAt: r.dueAt ? r.dueAt.toISOString() : null,
          isDone: r.isDone,
          priority: r.priority,
          createdAt: r.createdAt.toISOString(),
        }))}
        lookups={lookupsBundle.lookups}
        canCreatePatient={can(session, 'patient.edit')}
        canCreateAppointment={can(session, 'appointment.manage')}
        defaultStaffId={session.staffMemberId ?? undefined}
      />
    )
  }

  const calendarFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const calendarTo = new Date(now.getFullYear(), now.getMonth() + 2, 0)

  const [
    stats,
    lookupsBundle,
    confirmedAppointments,
    calendarAppointments,
    upcomingAppointments,
    reminders,
    todayPending,
    recentNoShows,
    fillGap,
  ] = await Promise.all([
    getDashboardStats(session.businessId),
    loadLookups(session.businessId),
    prisma.appointment.count({
      where: { businessId: session.businessId, status: 'CONFIRMED' },
    }),
    prisma.appointment.findMany({
      where: {
        businessId: session.businessId,
        date: { gte: calendarFrom, lte: calendarTo },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      include: {
        patient: { select: { fullName: true } },
        service: { select: { name: true } },
        staff: { select: { fullName: true } },
      },
    }),
    prisma.appointment.findMany({
      where: {
        businessId: session.businessId,
        date: { gte: today },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: 6,
      include: {
        patient: { select: { fullName: true } },
        service: { select: { name: true } },
        staff: { select: { fullName: true } },
      },
    }),
    getReminders(session.businessId, session.userId),
    prisma.appointment.count({
      where: { businessId: session.businessId, date: today, status: 'SCHEDULED' },
    }),
    prisma.appointment.count({
      where: {
        businessId: session.businessId,
        status: 'NO_SHOW',
        date: { gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7) },
      },
    }),
    isFillTheGapEnabled()
      ? getFillTheGapSnapshot(session.businessId)
      : Promise.resolve(null),
  ])

  const { services, staff, business, lookups } = lookupsBundle

  const setupSteps = [
    {
      title: 'İşletme bilgilerinizi tamamlayın',
      done: Boolean(business?.phone || business?.email || business?.address || business?.city),
      href: '/dashboard/ayarlar?tab=isletme',
    },
    {
      title: 'Hizmetlerinizi oluşturun',
      done: services.length > 0,
      href: '/dashboard/hizmetler',
    },
    {
      title: 'Ekip üyelerini ekleyin',
      done: staff.length > 1,
      href: '/dashboard/takim',
    },
    {
      title: 'Takvim planlamasını başlatın',
      done: confirmedAppointments > 0,
      href: '/dashboard/ajanda?mode=takvim',
    },
    {
      title: 'Para birimini ayarlayın',
      done: Boolean(business?.currency),
      href: '/dashboard/ayarlar?tab=marka',
    },
  ]

  const priorities = buildPriorityItems({
    pendingApprovals: stats.pendingAppointments,
    todayConfirmed: stats.todayAppointments,
    todayPending,
    recentNoShows,
    activePatients: stats.activePatients,
    hasConfirmedHistory: confirmedAppointments > 0,
  })

  return (
    <AdminOverview
      businessName={business?.name ?? session.businessName}
      stats={{
        todayAppointments: stats.todayAppointments,
        pendingAppointments: stats.pendingAppointments,
        activePatients: stats.activePatients,
        confirmedAppointments,
        monthlyRevenue: stats.monthlyRevenue,
      }}
      setupSteps={setupSteps}
      priorities={priorities}
      calendarEvents={calendarAppointments.map(serializeAppointment)}
      upcomingAppointments={upcomingAppointments.map(serializeAppointment)}
      reminders={reminders.map((r) => ({
        id: r.id,
        title: r.title,
        note: r.note,
        dueAt: r.dueAt ? r.dueAt.toISOString() : null,
        isDone: r.isDone,
        priority: r.priority,
        createdAt: r.createdAt.toISOString(),
      }))}
      lookups={lookups}
      canCreatePatient={can(session, 'patient.edit')}
      canCreateAppointment={can(session, 'appointment.manage')}
      canManageService={can(session, 'service.manage')}
      canViewAnalytics={can(session, 'analytics.view')}
      defaultStaffId={session.staffMemberId ?? undefined}
      teamMessagingEnabled={isTeamMessagingEnabled()}
      clinicAnalyticsEnabled={isClinicAnalyticsEnabled()}
      fillGap={
        fillGap?.headline
          ? {
              headline: fillGap.headline,
              detail: fillGap.detail,
              ajandaHref: fillGap.ajandaHref,
              clusters: fillGap.clusters.map((c) => ({
                date: c.date,
                weekdayLabel: c.weekdayLabel,
                doctorName: c.doctorName,
                serviceName: c.serviceName,
                slotCount: c.slotCount,
                sampleTimes: c.sampleTimes,
              })),
              patients: fillGap.patients.map((p) => ({
                id: p.id,
                fullName: p.fullName,
                phone: p.phone,
                lastVisitDate: p.lastVisitDate,
                lastServiceName: p.lastServiceName,
              })),
            }
          : null
      }
    />
  )
}
