'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  UserPlus,
} from 'lucide-react'

import { AppointmentFormDrawer, type AppointmentOption } from '@/components/dashboard/appointment-form-drawer'
import { PatientFormDrawer } from '@/components/dashboard/patient-form-drawer'
import type { CalendarEvent } from '@/components/dashboard/admin-overview/types'
import { UpcomingAppointmentsTable } from '@/components/dashboard/admin-overview/upcoming-appointments-table'
import { RemindersCard, type ReminderItem } from '@/components/dashboard/reminders-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export type RoleHomeFocus = 'secretary' | 'doctor' | 'staff'

type LookupData = {
  locations: AppointmentOption[]
  patients: AppointmentOption[]
  services: (AppointmentOption & { durationMin: number })[]
  staff: AppointmentOption[]
  bookingSlug: string
}

const DASHBOARD_REFRESH_INTERVAL_MS = 120_000

const SHARE_BOOKING_HREF = '/dashboard/ayarlar?tab=isletme'
const SHARE_BOOKING_LABEL = 'Randevu linkini paylaş'

const FOCUS_COPY: Record<
  RoleHomeFocus,
  {
    title: string
    subtitle: (count: number) => string
    listTitle: string
    allHref: string
    allLabel: string
    emptyTitle: string
    emptyDescription: string
    emptyActionHref: string
    emptyActionLabel: string
    calendarHref: string
    calendarLabel: string
  }
> = {
  secretary: {
    title: 'Onay kuyruğu',
    subtitle: (count) =>
      count === 0 ? 'Şu an onay bekleyen talep yok.' : `${count} randevu onay bekliyor.`,
    listTitle: 'Onay bekleyenler',
    allHref: '/dashboard/ajanda?mode=liste&status=SCHEDULED',
    allLabel: 'Kuyruk',
    emptyTitle: 'Onay bekleyen randevu yok',
    emptyDescription:
      'Yeni talepler geldiğinde burada listelenir. Ajandadan planlayın veya randevu linkinizi paylaşın.',
    emptyActionHref: '/dashboard/ajanda?mode=takvim',
    emptyActionLabel: 'Ajanda',
    calendarHref: '/dashboard/ajanda?mode=takvim',
    calendarLabel: 'Takvim modu',
  },
  doctor: {
    title: 'Bugünkü liste',
    subtitle: (count) =>
      count === 0 ? 'Bugün size atanmış randevu yok.' : `Bugün ${count} randevu.`,
    listTitle: 'Bugünkü hastalar',
    allHref: '/dashboard/ajanda?mode=takvim',
    allLabel: 'Ajanda',
    emptyTitle: 'Bugün randevu yok',
    emptyDescription: 'Ajandanızı kontrol edin veya genel randevu linkini paylaşarak talep toplayın.',
    emptyActionHref: '/dashboard/ajanda?mode=takvim',
    emptyActionLabel: 'Ajanda',
    calendarHref: '/dashboard/ajanda?mode=takvim',
    calendarLabel: 'Ajandam',
  },
  staff: {
    title: 'Ajandam',
    subtitle: (count) =>
      count === 0 ? 'Yaklaşan kendi randevunuz yok.' : `${count} yaklaşan randevu.`,
    listTitle: 'Randevularım',
    allHref: '/dashboard/ajanda?mode=takvim',
    allLabel: 'Ajanda',
    emptyTitle: 'Ajandanız boş',
    emptyDescription: 'Size atanmış yaklaşan randevu bulunmuyor. Ajandaya bakın veya linki paylaşın.',
    emptyActionHref: '/dashboard/ajanda?mode=takvim',
    emptyActionLabel: 'Ajanda',
    calendarHref: '/dashboard/ajanda?mode=takvim',
    calendarLabel: 'Ajandam',
  },
}

export function RoleOpsHome({
  focus,
  businessName,
  appointments,
  focusCount,
  reminders,
  lookups,
  canCreatePatient,
  canCreateAppointment,
  defaultStaffId,
}: {
  focus: RoleHomeFocus
  businessName: string
  appointments: CalendarEvent[]
  focusCount: number
  reminders: ReminderItem[]
  lookups: LookupData
  canCreatePatient: boolean
  canCreateAppointment: boolean
  defaultStaffId?: string
}) {
  const router = useRouter()
  const [modal, setModal] = useState<'appointment' | 'patient' | null>(null)
  const copy = FOCUS_COPY[focus]

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

  const mobilePrimary = useMemo(() => {
    if (focus === 'secretary' && focusCount > 0) {
      return {
        kind: 'link' as const,
        href: copy.allHref,
        label: focusCount === 1 ? '1 onay bekleyen' : `${focusCount} onay bekleyen`,
        icon: ClipboardList,
      }
    }
    if (canCreateAppointment) {
      return { kind: 'create' as const, label: 'Randevu oluştur', icon: CalendarPlus }
    }
    return {
      kind: 'link' as const,
      href: copy.calendarHref,
      label: copy.calendarLabel,
      icon: CalendarDays,
    }
  }, [canCreateAppointment, copy.allHref, copy.calendarHref, copy.calendarLabel, focus, focusCount])

  return (
    <div className="space-y-4 lg:space-y-5">
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardContent className="relative p-4 lg:p-5">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-brand-ink lg:text-[26px]">{copy.title}</h1>
              <p className="mt-1 text-[13px] text-muted-foreground lg:text-sm">
                {businessName} · {copy.subtitle(focusCount)}
              </p>
            </div>

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
              <Button asChild variant="outline" className="h-11 gap-2 rounded-xl border-slate-200 bg-white">
                <Link href={copy.calendarHref}>
                  <CalendarDays className="h-4 w-4" />
                  {copy.calendarLabel}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RemindersCard initialReminders={reminders} />

      <UpcomingAppointmentsTable
        upcomingAppointments={appointments}
        canCreateAppointment={canCreateAppointment}
        onCreateAppointment={() => setModal('appointment')}
        onShareCalendar={() => router.push(copy.calendarHref)}
        onOpenQuickStart={() => router.push(copy.allHref)}
        title={copy.listTitle}
        allHref={copy.allHref}
        allLabel={copy.allLabel}
        emptyTitle={copy.emptyTitle}
        emptyDescription={copy.emptyDescription}
        emptyActionHref={copy.emptyActionHref}
        emptyActionLabel={copy.emptyActionLabel}
        emptySecondaryHref={SHARE_BOOKING_HREF}
        emptySecondaryLabel={SHARE_BOOKING_LABEL}
        showShare={false}
        showQuickStart={false}
      />

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
    </div>
  )
}
