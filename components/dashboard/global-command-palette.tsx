'use client'

import { type ComponentType, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, CalendarDays, Search, Shield, Users } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { APPOINTMENT_STATUS_LABELS, formatPhone, formatShortDate, formatTime } from '@/lib/format'
import { searchGlobalPalette, type GlobalSearchPayload } from '@/lib/actions/global-search'
import type { SessionContext } from '@/lib/rbac'
import { appointmentScheduleNavLabels, canViewAppointmentSchedule } from '@/lib/rbac'
import {
  DASHBOARD_NAV_ITEMS,
  NAV_GROUP_LABELS,
  filterDashboardNavItems,
  groupDashboardNavItems,
} from '@/lib/dashboard/nav'

const DASHBOARD_COMMAND_OPEN_EVENT = 'dashboard:command-open'

type PageEntry = {
  title: string
  href: string
  icon: ComponentType<{ className?: string }>
  keywords: string
  groupLabel?: string
}

export function GlobalCommandPalette({
  session,
  showPlatformAdmin = false,
  showSuperAdmin = false,
  teamMessagingEnabled = false,
  clinicAnalyticsEnabled = false,
}: {
  session: SessionContext
  showPlatformAdmin?: boolean
  showSuperAdmin?: boolean
  teamMessagingEnabled?: boolean
  clinicAnalyticsEnabled?: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GlobalSearchPayload>({ patients: [], appointments: [] })
  const [isPending, startTransition] = useTransition()

  const scheduleLabels = appointmentScheduleNavLabels(session)
  const canSeeAppointments = canViewAppointmentSchedule(session)

  const navPages: PageEntry[] = groupDashboardNavItems(
    filterDashboardNavItems(DASHBOARD_NAV_ITEMS, {
      session,
      showPlatformAdmin,
      showSuperAdmin,
      teamMessagingEnabled,
      clinicAnalyticsEnabled,
    }),
  ).flatMap((section) =>
    section.items.map((item) => ({
      title: item.id === 'agenda' ? scheduleLabels.agenda : item.name,
      href: item.href,
      icon: item.icon,
      keywords: `${item.keywords ?? ''} ${NAV_GROUP_LABELS[item.group]}`,
      groupLabel: section.label,
    })),
  )

  const extraPages: PageEntry[] = [
    {
      title: `${scheduleLabels.agenda} · Liste`,
      href: '/dashboard/ajanda?mode=liste',
      icon: Calendar,
      keywords: 'liste kuyruk onay randevu',
      groupLabel: NAV_GROUP_LABELS.operasyon,
    },
    {
      title: `${scheduleLabels.agenda} · Takvim`,
      href: '/dashboard/ajanda?mode=takvim',
      icon: CalendarDays,
      keywords: 'calendar gunluk haftalik aylik takvim',
      groupLabel: NAV_GROUP_LABELS.operasyon,
    },
    {
      title: 'Sistem Admin',
      href: '/dashboard/sistem-admin',
      icon: Shield,
      keywords: 'platform admin sistem',
      groupLabel: NAV_GROUP_LABELS.yonetim,
    },
  ].filter((page) => {
    if (page.href.startsWith('/dashboard/ajanda')) return canSeeAppointments
    if (page.href === '/dashboard/sistem-admin') return showPlatformAdmin
    return true
  })

  const pages = [...navPages, ...extraPages]

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
      }
    }

    function onExternalOpen() {
      setOpen(true)
    }

    document.addEventListener('keydown', onKeyDown)
    window.addEventListener(DASHBOARD_COMMAND_OPEN_EVENT, onExternalOpen)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener(DASHBOARD_COMMAND_OPEN_EVENT, onExternalOpen)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults({ patients: [], appointments: [] })
    }
  }, [open])

  useEffect(() => {
    const normalized = query.trim()
    if (!open || normalized.length < 2) {
      setResults({ patients: [], appointments: [] })
      return
    }

    const timerId = window.setTimeout(() => {
      startTransition(async () => {
        try {
          const payload = await searchGlobalPalette(normalized)
          setResults(payload)
        } catch {
          setResults({ patients: [], appointments: [] })
        }
      })
    }, 180)

    return () => window.clearTimeout(timerId)
  }, [open, query])

  const hasAnyDynamicResults = results.patients.length > 0 || results.appointments.length > 0

  function go(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Global Arama"
      description="Hasta, randevu ve sayfalar arasında hızlı gezinme"
      className="sm:max-w-[760px]"
    >
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Hasta, randevu veya sayfa ara..."
      />
      <CommandList>
        <CommandEmpty>
          {query.trim().length < 2 ? 'Arama için en az 2 karakter yazın.' : 'Sonuç bulunamadı.'}
        </CommandEmpty>

        <CommandGroup heading="Sayfalar">
          {pages.map((page) => (
            <CommandItem
              key={`${page.href}-${page.title}`}
              value={`${page.title} ${page.keywords} ${page.groupLabel ?? ''}`}
              onSelect={() => go(page.href)}
            >
              <page.icon className="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate">{page.title}</span>
              {page.groupLabel ? (
                <span className="hidden text-[10px] text-muted-foreground sm:inline">{page.groupLabel}</span>
              ) : null}
              <CommandShortcut>Git</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        {hasAnyDynamicResults && <CommandSeparator />}

        {results.patients.length > 0 && (
          <CommandGroup heading="Hastalar">
            {results.patients.map((patient) => (
              <CommandItem
                key={patient.id}
                value={`${patient.fullName} ${patient.patientNumber} ${patient.phone} ${patient.email ?? ''}`}
                onSelect={() => go(`/dashboard/hastalar/${patient.id}`)}
              >
                <Users className="h-4 w-4" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-ink">{patient.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    #{patient.patientNumber} | {formatPhone(patient.phone)}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.appointments.length > 0 && (
          <CommandGroup heading="Randevular">
            {results.appointments.map((appointment) => (
              <CommandItem
                key={appointment.id}
                value={`${appointment.patientName} ${appointment.serviceName} ${appointment.staffName ?? ''} ${appointment.date} ${appointment.startTime}`}
                onSelect={() => go(`/dashboard/ajanda?mode=takvim&date=${appointment.date}`)}
              >
                <Calendar className="h-4 w-4" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-ink">
                    {appointment.patientName} - {appointment.serviceName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatShortDate(appointment.date)} | {formatTime(appointment.startTime)}
                    {appointment.staffName ? ` | ${appointment.staffName}` : ''}
                  </p>
                </div>
                <CommandShortcut>
                  {APPOINTMENT_STATUS_LABELS[appointment.status] ?? appointment.status}
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {isPending && (
          <div className="px-3 py-2 text-xs text-muted-foreground">Aranıyor...</div>
        )}
      </CommandList>
    </CommandDialog>
  )
}

export function GlobalCommandTrigger({
  variant = 'desktop',
  className,
}: {
  variant?: 'desktop' | 'icon'
  className?: string
}) {
  function openPalette() {
    window.dispatchEvent(new Event(DASHBOARD_COMMAND_OPEN_EVENT))
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={openPalette}
        aria-label="Global Arama"
        className={cn(
          'tap-target flex h-10 w-10 items-center justify-center rounded-xl text-foreground/70 transition hover:bg-dashboard-hover',
          className
        )}
      >
        <Search className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={openPalette}
      aria-label="Global arama"
      className={cn(
        'flex h-10 w-full items-center gap-2 rounded-xl border border-border/40 bg-dashboard-hover px-3 text-left text-sm text-muted-foreground transition hover:border-brand-teal/30 hover:bg-white',
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground/70" />
      <span className="truncate">Hasta, randevu veya sayfa ara...</span>
      <span className="ml-auto rounded-md border border-border/60 bg-white px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
        Ctrl K
      </span>
    </button>
  )
}
