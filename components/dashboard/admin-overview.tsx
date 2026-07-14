'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  CalendarPlus,
  Check,
  ChevronRight,
  ClipboardList,
  Clock,
  Scissors,
  Send,
  Share2,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'

import { AppointmentFormDrawer, type AppointmentOption } from '@/components/dashboard/appointment-form-drawer'
import { PatientFormDrawer } from '@/components/dashboard/patient-form-drawer'
import { ServiceFormDialog } from '@/components/dashboard/service-form-dialog'
import { PriorityCards } from '@/components/dashboard/admin-overview/priority-cards'
import { MiniCalendar } from '@/components/dashboard/admin-overview/mini-calendar'
import { QuickStartTour } from '@/components/dashboard/admin-overview/quick-start-tour'
import { StatsGrid } from '@/components/dashboard/admin-overview/stats-grid'
import type { CalendarEvent, OverviewStats, PriorityItem } from '@/components/dashboard/admin-overview/types'
import { UpcomingAppointmentsTable } from '@/components/dashboard/admin-overview/upcoming-appointments-table'
import { RemindersCard, type ReminderItem } from '@/components/dashboard/reminders-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type LookupData = {
  locations: AppointmentOption[]
  patients: AppointmentOption[]
  services: (AppointmentOption & { durationMin: number })[]
  staff: AppointmentOption[]
  bookingSlug: string
}

type SetupStep = {
  title: string
  done: boolean
  href?: string
}

type Modal = 'appointment' | 'patient' | 'service' | 'share' | null

const DASHBOARD_REFRESH_INTERVAL_MS = 120_000
const QUICK_START_TOUR_KEY_PREFIX = 'asistan.quick-start-tour.v1.dismissed.'

export function AdminOverview({
  businessName,
  stats,
  setupSteps,
  priorities,
  calendarEvents,
  upcomingAppointments,
  reminders,
  lookups,
  canCreatePatient,
  canCreateAppointment,
  canManageService,
  canViewAnalytics,
  defaultStaffId,
}: {
  businessName: string
  stats: OverviewStats
  setupSteps: SetupStep[]
  priorities: PriorityItem[]
  calendarEvents: CalendarEvent[]
  upcomingAppointments: CalendarEvent[]
  reminders: ReminderItem[]
  lookups: LookupData
  canCreatePatient: boolean
  canCreateAppointment: boolean
  canManageService: boolean
  canViewAnalytics: boolean
  defaultStaffId?: string
}) {
  const router = useRouter()
  const [modal, setModal] = useState<Modal>(null)
  const [quickStartOpen, setQuickStartOpen] = useState(false)

  useEffect(() => {
    let timer: number | null = null

    const clearPolling = () => {
      if (timer !== null) {
        window.clearInterval(timer)
        timer = null
      }
    }

    const startPolling = () => {
      clearPolling()
      if (document.visibilityState !== 'visible') return
      timer = window.setInterval(() => {
        router.refresh()
      }, DASHBOARD_REFRESH_INTERVAL_MS)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        router.refresh()
        startPolling()
      } else {
        clearPolling()
      }
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  const bookingLink = useMemo(() => {
    if (typeof window === 'undefined') return `/randevu/${lookups.bookingSlug}`
    return `${window.location.origin}/randevu/${lookups.bookingSlug}`
  }, [lookups.bookingSlug])

  const quickStartStorageKey = useMemo(() => `${QUICK_START_TOUR_KEY_PREFIX}${lookups.bookingSlug}`, [lookups.bookingSlug])

  const completedSteps = setupSteps.filter((step) => step.done).length
  const setupProgress = setupSteps.length ? Math.round((completedSteps / setupSteps.length) * 100) : 0
  const setupComplete = setupSteps.length > 0 && completedSteps === setupSteps.length
  const isFirstDayCandidate =
    !setupComplete &&
    upcomingAppointments.length === 0 &&
    stats.confirmedAppointments === 0 &&
    canCreateAppointment

  useEffect(() => {
    if (!isFirstDayCandidate) return
    const alreadyDismissed = window.localStorage.getItem(quickStartStorageKey)
    if (alreadyDismissed === '1') return
    const timer = window.setTimeout(() => setQuickStartOpen(true), 350)
    return () => window.clearTimeout(timer)
  }, [isFirstDayCandidate, quickStartStorageKey])

  function dismissQuickStartForever() {
    window.localStorage.setItem(quickStartStorageKey, '1')
    setQuickStartOpen(false)
  }

  const mobilePrimary =
    stats.pendingAppointments > 0
      ? {
          kind: 'link' as const,
          href: '/dashboard/ajanda?mode=liste&status=SCHEDULED',
          label:
            stats.pendingAppointments === 1
              ? '1 onay bekleyen'
              : `${stats.pendingAppointments} onay bekleyen`,
          icon: ClipboardList,
        }
      : canCreateAppointment
        ? {
            kind: 'create' as const,
            label: 'Randevu oluştur',
            icon: CalendarPlus,
          }
        : null

  return (
    <div className="space-y-4 lg:space-y-5">
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardContent className="relative p-4 lg:p-5">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-brand-ink lg:text-[26px]">Klinik Operasyon Özeti</h1>
              <p className="mt-1 text-[13px] text-muted-foreground lg:text-sm">{businessName}</p>
            </div>

            {mobilePrimary && (
              <div className="lg:hidden">
                {mobilePrimary.kind === 'link' ? (
                  <Button asChild className="h-11 w-full gap-2 rounded-xl bg-brand-teal text-white shadow-lg shadow-blue-600/20 hover:bg-brand-teal-hover">
                    <Link href={mobilePrimary.href}>
                      <mobilePrimary.icon className="h-4 w-4" />
                      {mobilePrimary.label}
                    </Link>
                  </Button>
                ) : (
                  <Button
                    onClick={() => setModal('appointment')}
                    className="h-11 w-full gap-2 rounded-xl bg-brand-teal text-white shadow-lg shadow-blue-600/20 hover:bg-brand-teal-hover"
                  >
                    <mobilePrimary.icon className="h-4 w-4" />
                    {mobilePrimary.label}
                  </Button>
                )}
              </div>
            )}

            <div className="hidden flex-wrap gap-2 lg:flex">
              {canCreateAppointment && (
                <Button
                  onClick={() => setModal('appointment')}
                  className="h-11 gap-2 rounded-xl bg-brand-teal text-white shadow-lg shadow-blue-600/20 hover:bg-brand-teal-hover"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Randevu Oluştur
                </Button>
              )}
              {canCreatePatient && (
                <Button variant="outline" onClick={() => setModal('patient')} className="h-11 gap-2 rounded-xl border-slate-200 bg-white">
                  <UserPlus className="h-4 w-4" />
                  Hasta Ekle
                </Button>
              )}
              <Button variant="outline" onClick={() => setModal('share')} className="h-11 gap-2 rounded-xl border-slate-200 bg-white">
                <Share2 className="h-4 w-4" />
                Takvimi Paylaş
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <StatsGrid stats={stats} canViewAnalytics={canViewAnalytics} />
      <RemindersCard initialReminders={reminders} />

      <div className={cn('grid gap-4', setupComplete ? 'xl:grid-cols-[1.25fr_1.55fr]' : 'xl:grid-cols-[1fr_1.25fr_1.55fr]')}>
        {!setupComplete && (
          <Card className="shadow-sm">
            <CardContent className="p-4 lg:p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-brand-ink">Kurulum adımlarını tamamlayın</h2>
                  <p className="mt-1 text-[12px] text-muted-foreground">İlk randevu trafiğine hazır olmak için kalan adımlar.</p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-brand-teal text-xs font-bold text-brand-ink">
                  {completedSteps}/{setupSteps.length}
                </div>
              </div>
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-teal transition-[width]" style={{ width: `${setupProgress}%` }} />
              </div>
              <ul className="space-y-2.5">
                {setupSteps.map((step, index) => {
                  const row = (
                    <>
                      <span
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          step.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        {step.done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                      </span>
                      <span className={cn('flex-1', step.done ? 'text-muted-foreground line-through' : 'font-semibold text-brand-ink')}>
                        {step.title}
                      </span>
                      {!step.done && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    </>
                  )

                  if (!step.done && step.href) {
                    return (
                      <li key={step.title}>
                        <Link
                          href={step.href}
                          className="flex items-center gap-3 rounded-xl px-1 py-1.5 text-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40"
                        >
                          {row}
                        </Link>
                      </li>
                    )
                  }

                  return (
                    <li key={step.title} className="flex items-center gap-3 px-1 py-1.5 text-sm">
                      {row}
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        <MiniCalendar calendarEvents={calendarEvents} />
        <PriorityCards items={priorities} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <UpcomingAppointmentsTable
          upcomingAppointments={upcomingAppointments}
          canCreateAppointment={canCreateAppointment}
          onCreateAppointment={() => setModal('appointment')}
          onShareCalendar={() => setModal('share')}
          onOpenQuickStart={() => setQuickStartOpen(true)}
        />

        <Card className="hidden shadow-sm xl:block">
          <CardContent className="p-5">
            <h2 className="mb-4 text-sm font-bold text-brand-ink">Hızlı İşlemler</h2>
            <div className="grid grid-cols-2 gap-3">
              {canCreateAppointment && <QuickAction icon={<CalendarPlus />} label="Randevu Oluştur" onClick={() => setModal('appointment')} />}
              {canCreatePatient && <QuickAction icon={<UserPlus />} label="Hasta Ekle" onClick={() => setModal('patient')} />}
              {canManageService && <QuickAction icon={<Scissors />} label="Hizmet Ekle" onClick={() => setModal('service')} />}
              <QuickAction icon={<Clock />} label="Müsaitlik Düzenle" href="/dashboard/ajanda?mode=takvim" />
              <QuickAction icon={<Send />} label="Mesajlar" href="/dashboard/mesajlar" />
              {canViewAnalytics && <QuickAction icon={<BarChart3 />} label="Rapor Oluştur" href="/dashboard/analitik" />}
            </div>
          </CardContent>
        </Card>
      </div>

      <AppointmentFormDrawer
        open={modal === 'appointment'}
        onOpenChange={(open) => setModal(open ? 'appointment' : null)}
        locations={lookups.locations}
        patients={lookups.patients}
        services={lookups.services}
        staff={lookups.staff}
        defaultStaffId={defaultStaffId}
      />
      <PatientFormDrawer open={modal === 'patient'} onOpenChange={(open) => setModal(open ? 'patient' : null)} />
      <ServiceFormDialog open={modal === 'service'} onOpenChange={(open) => setModal(open ? 'service' : null)} onSaved={() => router.refresh()} />

      <Dialog open={modal === 'share'} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Takvimi Paylaş</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input readOnly value={bookingLink} />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(bookingLink)
                toast.success('Bağlantı kopyalandı')
              }}
              className="bg-brand-teal text-white hover:bg-brand-teal-hover"
            >
              Bağlantıyı Kopyala
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <QuickStartTour
        open={quickStartOpen}
        onOpenChange={setQuickStartOpen}
        onStartAppointment={() => {
          setQuickStartOpen(false)
          setModal('appointment')
        }}
        onOpenPatients={() => {
          setQuickStartOpen(false)
          router.push('/dashboard/hastalar')
        }}
        onOpenCalendar={() => {
          setQuickStartOpen(false)
          router.push('/dashboard/ajanda?mode=takvim')
        }}
        onDismissForever={dismissQuickStartForever}
      />

      {mobilePrimary && (
        <div
          className="fixed z-30 lg:hidden"
          style={{
            left: '1rem',
            right: '5.5rem',
            bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {mobilePrimary.kind === 'link' ? (
            <Button
              asChild
              className="h-12 w-full gap-2 rounded-2xl bg-brand-teal text-sm font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-brand-teal-hover"
            >
              <Link href={mobilePrimary.href}>
                <mobilePrimary.icon className="h-4 w-4" />
                {mobilePrimary.label}
              </Link>
            </Button>
          ) : (
            <Button
              onClick={() => setModal('appointment')}
              className="h-12 w-full gap-2 rounded-2xl bg-brand-teal text-sm font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-brand-teal-hover"
            >
              <mobilePrimary.icon className="h-4 w-4" />
              {mobilePrimary.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function QuickAction({
  icon,
  label,
  href,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
}) {
  const content = (
    <span className="flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center text-xs font-semibold text-brand-ink shadow-sm transition-colors hover:border-brand-blue/40 hover:bg-blue-50/40">
      <span className="text-brand-blue [&_svg]:h-6 [&_svg]:w-6">{icon}</span>
      {label}
    </span>
  )

  if (href) return <Link href={href}>{content}</Link>
  return <button type="button" onClick={onClick}>{content}</button>
}

