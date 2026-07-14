'use client'

import { type ComponentType, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  CalendarDays,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  MessageCircle,
  ScrollText,
  Search,
  Settings,
  Shield,
  UserCog,
  Users,
} from 'lucide-react'
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
import type { Permission, SessionContext } from '@/lib/rbac'
import {
  appointmentScheduleNavLabels,
  canViewAppointmentSchedule,
} from '@/lib/rbac'

const DASHBOARD_COMMAND_OPEN_EVENT = 'dashboard:command-open'

type PageEntry = {
  title: string
  href: string
  icon: ComponentType<{ className?: string }>
  keywords: string
  visible: boolean
}

export function GlobalCommandPalette({
  session,
  showPlatformAdmin = false,
  showSuperAdmin = false,
}: {
  session: SessionContext
  showPlatformAdmin?: boolean
  showSuperAdmin?: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GlobalSearchPayload>({ patients: [], appointments: [] })
  const [isPending, startTransition] = useTransition()

  const hasPermission = (permission: Permission) => session.permissions.includes(permission)
  const canSeePatients = hasPermission('patient.view') || hasPermission('patient.edit') || hasPermission('patient.create')
  const canSeeAppointments = canViewAppointmentSchedule(session)
  const scheduleLabels = appointmentScheduleNavLabels(session)

  const pages: PageEntry[] = [
    {
      title: 'Genel Bakış',
      href: '/dashboard',
      icon: LayoutDashboard,
      keywords: 'anasayfa overview dashboard',
      visible: true,
    },
    {
      title: scheduleLabels.agenda,
      href: '/dashboard/ajanda',
      icon: CalendarDays,
      keywords: 'appointment randevu ajanda takvim liste benim',
      visible: canSeeAppointments,
    },
    {
      title: `${scheduleLabels.agenda} · Liste`,
      href: '/dashboard/ajanda?mode=liste',
      icon: Calendar,
      keywords: 'liste kuyruk onay randevu',
      visible: canSeeAppointments,
    },
    {
      title: `${scheduleLabels.agenda} · Takvim`,
      href: '/dashboard/ajanda?mode=takvim',
      icon: CalendarDays,
      keywords: 'calendar gunluk haftalik aylik takvim',
      visible: canSeeAppointments,
    },
    {
      title: 'Hastalar',
      href: '/dashboard/hastalar',
      icon: Users,
      keywords: 'patient hasta musteri kart',
      visible: canSeePatients,
    },
    {
      title: 'Hizmetler',
      href: '/dashboard/hizmetler',
      icon: Briefcase,
      keywords: 'service hizmet fiyat sure',
      visible: hasPermission('service.manage'),
    },
    {
      title: 'Takım',
      href: '/dashboard/takim',
      icon: UserCog,
      keywords: 'team calisan personel doktor',
      visible: hasPermission('team.manage'),
    },
    {
      title: 'Mesajlar',
      href: '/dashboard/mesajlar',
      icon: MessageCircle,
      keywords: 'chat mesaj konusma',
      visible: true,
    },
    {
      title: 'Bildirimler',
      href: '/dashboard/bildirimler',
      icon: Bell,
      keywords: 'notification uyari hatirlatma',
      visible: true,
    },
    {
      title: 'Analitik',
      href: '/dashboard/analitik',
      icon: BarChart3,
      keywords: 'analytics rapor ciro',
      visible: hasPermission('analytics.view'),
    },
    {
      title: 'Yönetişim',
      href: '/dashboard/yonetisim',
      icon: Shield,
      keywords: 'denetim audit kvkk uyumluluk silme riza',
      visible: showSuperAdmin,
    },
    {
      href: '/dashboard/denetim',
      icon: ScrollText,
      keywords: 'denetim audit log guvenlik',
      visible: hasPermission('audit.view'),
    },
    {
      title: 'Yardım Merkezi',
      href: '/dashboard/yardim',
      icon: HelpCircle,
      keywords: 'yardim destek help faq dokumantasyon rehber iletisim',
      visible: true,
    },
    {
      title: 'Profilim',
      href: '/dashboard/ayarlar?tab=hesap',
      icon: Settings,
      keywords: 'settings profil hesap',
      visible: true,
    },
    {
      title: 'İşletme Ayarları',
      href: '/dashboard/ayarlar?tab=isletme',
      icon: Settings,
      keywords: 'settings isletme marka para birimi',
      visible: session.isOwner,
    },
    {
      title: 'Abonelik / Paket',
      href: '/dashboard/ayarlar?tab=abonelik',
      icon: CreditCard,
      keywords: 'abonelik paket billing yenileme trial',
      visible: session.isOwner,
    },
    {
      title: 'Sistem Admin',
      href: '/dashboard/sistem-admin',
      icon: Shield,
      keywords: 'platform admin sistem',
      visible: showPlatformAdmin,
    },
    {
      title: 'Super Admin',
      href: '/dashboard/super-admin',
      icon: Shield,
      keywords: 'super admin',
      visible: showSuperAdmin,
    },
  ].filter((item) => item.visible)

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
              key={page.href}
              value={`${page.title} ${page.keywords}`}
              onSelect={() => go(page.href)}
            >
              <page.icon className="h-4 w-4" />
              <span>{page.title}</span>
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
