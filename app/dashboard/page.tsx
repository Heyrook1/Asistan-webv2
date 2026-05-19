import { requireSession, can } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getDashboardStats, getReminders } from '@/lib/queries'
import { AdminOverview } from '@/components/dashboard/admin-overview'

export const dynamic = 'force-dynamic'

function dateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default async function DashboardPage() {
  const session = await requireSession()
  const now = new Date()
  const today = dateOnly(now)
  const calendarFrom = new Date(now.getFullYear(), now.getMonth() - 6, 1)
  const calendarTo = new Date(now.getFullYear(), now.getMonth() + 7, 0)

  const [
    stats,
    patients,
    services,
    staff,
    business,
    confirmedAppointments,
    calendarAppointments,
    upcomingAppointments,
    reminders,
  ] = await Promise.all([
    getDashboardStats(session.businessId),
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
    prisma.business.findUnique({
      where: { id: session.businessId },
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
  ])

  const lookups = {
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
    bookingSlug: business?.slug ?? 'klinik',
  }

  const setupSteps = [
    {
      title: 'İşletme bilgilerinizi ekleyin',
      done: Boolean(business?.phone || business?.email || business?.address || business?.city),
    },
    {
      title: 'Hizmetlerinizi oluşturun',
      done: services.length > 0,
    },
    {
      title: 'Çalışma ekibinizi ayarlayın',
      done: staff.length > 1,
    },
    {
      title: 'Takviminizi bağlayın',
      done: confirmedAppointments > 0,
    },
    {
      title: 'Ödeme ayarlarınızı tamamlayın',
      done: Boolean(business?.currency),
    },
  ]

  const suggestions = [
    stats.todayAppointments === 0
      ? {
          title: 'Bugün ajandada boşluk var',
          description: 'Onaylanan randevu yok. Bekleyen talepleri kontrol edebilirsiniz.',
          tone: 'teal' as const,
          href: '/dashboard/randevular',
        }
      : {
          title: `Bugün ${stats.todayAppointments} onaylı randevu var`,
          description: 'Ajandadaki randevuları takvimden yönetebilirsiniz.',
          tone: 'teal' as const,
          href: '/dashboard/takvim',
        },
    {
      title: `${stats.pendingAppointments} randevu onay bekliyor`,
      description: 'Onaylanan randevular otomatik olarak ajandaya eklenir.',
      tone: 'orange' as const,
      href: '/dashboard/randevular',
    },
    {
      title: patients.length > 0 ? 'Bekleyen müşteriye uygun saat önerilebilir' : 'İlk müşteri kaydını oluşturun',
      description: patients.length > 0 ? `${patients[0].fullName} için uygun saatleri kontrol edin.` : 'Hasta/müşteri kaydı olmadan randevu akışı başlatılamaz.',
      tone: 'violet' as const,
      href: patients.length > 0 ? '/dashboard/takvim' : '/dashboard/hastalar',
    },
  ]

  const serializeAppointment = (appointment: (typeof upcomingAppointments)[number]) => ({
    id: appointment.id,
    patientId: appointment.patientId,
    patientName: appointment.patient.fullName,
    serviceName: appointment.service.name,
    staffName: appointment.staff?.fullName ?? null,
    date: toIsoDate(appointment.date),
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
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
      suggestions={suggestions}
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
    />
  )
}
