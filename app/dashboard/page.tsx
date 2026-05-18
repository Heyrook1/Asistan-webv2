import Link from 'next/link'
import {
  Calendar, Clock, HeartPulse, Wallet, CheckCircle2, XCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { requireSession, can } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getDashboardStats } from '@/lib/queries'
import { trMoney, formatTime, formatRelativeDate, APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/lib/format'
import { EmptyState } from '@/components/dashboard/empty-state'

export default async function DashboardPage() {
  const session = await requireSession()

  const [stats, patients, services, staff, business] = await Promise.all([
    getDashboardStats(session.businessId),
    prisma.patient.findMany({
      where: { businessId: session.businessId, isArchived: false },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true, patientNumber: true },
      take: 200,
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
      select: { slug: true },
    }),
  ])

  const lookups = {
    patients: patients.map((p) => ({ id: p.id, label: `${p.fullName} (#${p.patientNumber})` })),
    services: services.map((s) => ({ id: s.id, label: s.name, durationMin: s.durationMin })),
    staff: staff.map((s) => ({ id: s.id, label: s.fullName })),
    bookingSlug: business?.slug ?? 'klinik',
  }

  const cards = [
    {
      title: 'Bugünkü Randevular',
      value: stats.todayAppointments,
      hint: stats.todayAppointments === 0 ? 'Bugün için randevu yok.' : 'Bugüne planlanan randevular',
      icon: Calendar,
    },
    {
      title: 'Bekleyen Onay',
      value: stats.pendingAppointments,
      hint: stats.pendingAppointments === 0 ? 'Onay bekleyen randevu yok.' : 'Onaylanmamış randevular',
      icon: Clock,
    },
    {
      title: 'Aktif Hasta',
      value: stats.activePatients,
      hint: stats.activePatients === 0 ? 'Henüz hasta yok.' : 'Toplam aktif hasta',
      icon: HeartPulse,
    },
    {
      title: 'Aylık Ciro',
      value: trMoney.format(stats.monthlyRevenue),
      hint: stats.monthlyRevenue === 0 ? 'Bu ay tamamlanan randevu yok.' : 'Tamamlanan randevular toplamı',
      icon: Wallet,
    },
    {
      title: 'Tamamlanan',
      value: stats.completedAppointments,
      hint: 'Tüm zamanlar',
      icon: CheckCircle2,
    },
    {
      title: 'İptal Oranı',
      value: `${(stats.cancellationRate * 100).toFixed(1)}%`,
      hint: stats.cancellationRate === 0 ? 'İptal kaydı yok.' : 'Toplam içindeki iptal/no-show',
      icon: XCircle,
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-[#0C1D36]">
            Hoş geldiniz, {session.fullName.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.businessName} • Tüm metrikler canlı veritabanından hesaplanır.
          </p>
        </div>
        <QuickActions
          lookups={lookups}
          canCreatePatient={can(session, 'patient.edit')}
          canCreateAppointment={can(session, 'appointment.manage')}
          canManageService={can(session, 'service.manage')}
        />
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.title} className="border-border/40">
            <CardContent className="p-4">
              <c.icon className="mb-2 h-5 w-5 text-[#12C8AD]" />
              <p className="text-xs text-muted-foreground">{c.title}</p>
              <p className="text-2xl font-bold text-[#0C1D36]">{c.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{c.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#0C1D36]">Yaklaşan Randevular</h3>
            <Link href="/dashboard/randevular" className="text-xs text-[#12C8AD] font-medium">
              Tümünü Gör →
            </Link>
          </div>
          {stats.upcomingAppointments.length === 0 ? (
            <EmptyState
              title="Henüz randevu yok"
              description="İlk randevunuzu oluşturarak takviminizi başlatın."
              ctaLabel="Randevu Oluştur"
              ctaHref="/dashboard/randevular"
            />
          ) : (
            <div className="space-y-2">
              {stats.upcomingAppointments.map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/hastalar/${a.patientId}`}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-white p-3 hover:border-[#12C8AD]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-9 w-1.5 rounded-full"
                      style={{ background: a.service.color || '#12C8AD' }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0C1D36] truncate">{a.patient.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.service.name}{a.staff ? ` • ${a.staff.fullName}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-[#0C1D36]">{formatRelativeDate(a.date)}</p>
                    <p className="text-[11px] text-muted-foreground">{formatTime(a.startTime)} - {formatTime(a.endTime)}</p>
                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] ${APPOINTMENT_STATUS_COLORS[a.status]}`}>
                      {APPOINTMENT_STATUS_LABELS[a.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
