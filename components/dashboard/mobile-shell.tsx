'use client'

import { useEffect, useState, useTransition, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  CalendarPlus,
  Loader2,
  LogOut,
  Menu,
  Plus,
  Search,
  StickyNote,
  Upload,
  UserPlus,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { PatientFormDrawer } from '@/components/dashboard/patient-form-drawer'
import { DashboardBrandLockup } from '@/components/dashboard/dashboard-brand-lockup'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import {
  DASHBOARD_NAV_ITEMS,
  filterDashboardNavItems,
  groupDashboardNavItems,
  isDashboardNavActive,
  mobilePrimaryNavItems,
} from '@/lib/dashboard/nav'
import { ROLE_LABELS, can as sessionCan, appointmentScheduleNavLabels } from '@/lib/rbac'
import type { SessionContext, Permission } from '@/lib/rbac'
import {
  searchGlobalPalette,
  type GlobalPatientSearchHit,
} from '@/lib/actions/global-search'
import { cn } from '@/lib/utils'

export function MobileShell({
  session,
  unreadCount,
  unreadMessages = 0,
  pendingAppointments = 0,
  showSuperAdmin = false,
  teamMessagingEnabled = false,
  clinicAnalyticsEnabled = false,
}: {
  session: SessionContext
  unreadCount: number
  unreadMessages?: number
  pendingAppointments?: number
  showSuperAdmin?: boolean
  teamMessagingEnabled?: boolean
  clinicAnalyticsEnabled?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [drawer, setDrawer] = useState<'patient' | null>(null)
  const [patientPicker, setPatientPicker] = useState<'note' | 'file' | null>(null)
  const [pickerQuery, setPickerQuery] = useState('')
  const [pickerResults, setPickerResults] = useState<GlobalPatientSearchHit[]>([])
  const [pickerPending, startPickerSearch] = useTransition()
  const scheduleLabels = appointmentScheduleNavLabels(session)

  const can = (perm?: Permission) => !perm || sessionCan(session, perm)

  const visibleNav = filterDashboardNavItems(DASHBOARD_NAV_ITEMS, {
    session,
    showSuperAdmin,
    teamMessagingEnabled,
    clinicAnalyticsEnabled,
  })
  const primaryItems = mobilePrimaryNavItems(visibleNav)
  const menuSections = groupDashboardNavItems(
    visibleNav.filter((item) => !item.mobilePrimary),
  )

  function primaryLabel(item: (typeof primaryItems)[number]) {
    if (item.id === 'agenda') return scheduleLabels.agendaShort
    if (item.id === 'overview') return 'Ana'
    return item.name
  }

  const isSecondaryActive = menuSections.some((section) =>
    section.items.some((item) => isDashboardNavActive(pathname, item.href)),
  )
  const menuBadgeCount = unreadCount + (teamMessagingEnabled ? unreadMessages : 0)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Çıkış yapıldı')
    router.push('/auth/login')
    router.refresh()
  }

  function handleFabAction(action: 'patient' | 'appointment' | 'note' | 'upload') {
    setFabOpen(false)
    if (action === 'patient') {
      setDrawer('patient')
      return
    }
    if (action === 'appointment') {
      router.push('/dashboard/ajanda?mode=liste&create=1')
      return
    }
    if (action === 'note') {
      setPickerQuery('')
      setPickerResults([])
      setPatientPicker('note')
      return
    }
    setPickerQuery('')
    setPickerResults([])
    setPatientPicker('file')
  }

  useEffect(() => {
    if (!patientPicker) return
    const q = pickerQuery.trim()
    if (q.length < 2) {
      setPickerResults([])
      return
    }
    const timer = window.setTimeout(() => {
      startPickerSearch(async () => {
        const result = await searchGlobalPalette(q)
        setPickerResults(result.patients)
      })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [patientPicker, pickerQuery])

  function selectPatientForAction(patientId: string) {
    const action = patientPicker === 'file' ? 'file' : 'note'
    setPatientPicker(null)
    router.push(`/dashboard/hastalar/${patientId}?action=${action}`)
  }

  const tabCount = primaryItems.length + 1 // primary tabs + Menü

  return (
    <>
      {/*
        Mobile bottom nav: one equal-width row (never wrap). FAB sits above this bar
        via --dashboard-mobile-nav-h so it never covers tab hit targets.
      */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-white/90 backdrop-blur-xl pb-safe lg:hidden"
        aria-label="Alt gezinme"
      >
        <div
          className="mx-auto grid w-full max-w-lg min-h-[3.5rem] items-stretch px-1"
          style={{ gridTemplateColumns: `repeat(${tabCount}, minmax(0, 1fr))` }}
        >
          {primaryItems.map((item) => {
            const href =
              item.badge === 'pendingAppointments' && pendingAppointments > 0
                ? '/dashboard/ajanda?mode=liste&status=SCHEDULED'
                : item.href
            const active = isDashboardNavActive(pathname, item.href)
            const label = primaryLabel(item)
            const a11yLabel = item.id === 'overview' ? 'Ana Sayfa' : label
            return (
              <Link
                key={item.id}
                href={href}
                title={a11yLabel}
                aria-label={a11yLabel}
                className={cn(
                  'flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-[10px] font-medium leading-tight transition-colors sm:text-[11px]',
                  active ? 'text-brand-blue' : 'text-muted-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="relative shrink-0">
                  <item.icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden />
                  {active && (
                    <span className="absolute -top-2.5 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-brand-blue sm:w-6" />
                  )}
                  {item.badge === 'pendingAppointments' && pendingAppointments > 0 && (
                    <span className="absolute -right-2.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold leading-none text-amber-950 ring-2 ring-white">
                      {pendingAppointments > 9 ? '9+' : pendingAppointments}
                    </span>
                  )}
                </span>
                <span className="w-full truncate text-center">{label}</span>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            title="Menü"
            className={cn(
              'flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-[10px] font-medium leading-tight transition-colors sm:text-[11px]',
              menuOpen || isSecondaryActive ? 'text-brand-blue' : 'text-muted-foreground',
            )}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
          >
            <span className="relative shrink-0">
              <Menu className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden />
              {menuBadgeCount > 0 && !isSecondaryActive && (
                <span className="absolute -right-1.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-blue px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
                  {menuBadgeCount > 9 ? '9+' : menuBadgeCount}
                </span>
              )}
            </span>
            <span className="w-full truncate text-center">Menü</span>
          </button>
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setFabOpen(true)}
        aria-label="Hızlı işlemler"
        className="fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-white shadow-xl shadow-blue-500/40 transition-transform active:scale-95 lg:hidden"
        style={{
          // Clear the nav bar + safe area; never sit on top of tab labels/icons.
          bottom:
            'calc(var(--dashboard-mobile-nav-h, 3.5rem) + env(safe-area-inset-bottom, 0px) + 0.75rem)',
        }}
      >
        <Plus className="h-7 w-7" aria-hidden />
      </button>

      <Sheet open={fabOpen} onOpenChange={setFabOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl border-t-0 p-0 pb-safe">
          <SheetTitle className="sr-only">Hızlı İşlemler</SheetTitle>
          <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-slate-200" />
          <div className="px-4 pb-4 pt-3">
            <p className="mb-3 text-sm font-semibold text-brand-ink">Hızlı İşlemler</p>
            <div className="grid grid-cols-2 gap-3">
              {can('patient.edit') && (
                <FabAction
                  icon={<UserPlus className="h-6 w-6" />}
                  label="Hasta Ekle"
                  onClick={() => handleFabAction('patient')}
                  tone="teal"
                />
              )}
              {can('appointment.manage') && (
                <FabAction
                  icon={<CalendarPlus className="h-6 w-6" />}
                  label="Randevu Oluştur"
                  onClick={() => handleFabAction('appointment')}
                  tone="blue"
                />
              )}
              {can('medical_note.create') && (
                <FabAction
                  icon={<StickyNote className="h-6 w-6" />}
                  label="Not Ekle"
                  onClick={() => handleFabAction('note')}
                  tone="amber"
                />
              )}
              {can('file.upload') && (
                <FabAction
                  icon={<Upload className="h-6 w-6" />}
                  label="Dosya Yükle"
                  onClick={() => handleFabAction('upload')}
                  tone="violet"
                />
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={patientPicker !== null}
        onOpenChange={(open) => {
          if (!open) setPatientPicker(null)
        }}
      >
        <SheetContent side="bottom" className="rounded-t-2xl border-t-0 p-0 pb-safe">
          <SheetTitle className="sr-only">
            {patientPicker === 'file' ? 'Dosya için hasta seç' : 'Not için hasta seç'}
          </SheetTitle>
          <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-slate-200" />
          <div className="px-4 pb-4 pt-3">
            <p className="mb-1 text-sm font-semibold text-brand-ink">
              {patientPicker === 'file' ? 'Dosya yüklenecek hasta' : 'Not eklenecek hasta'}
            </p>
            <p className="mb-3 text-xs text-muted-foreground">İsim, telefon veya hasta no ile arayın.</p>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder="En az 2 karakter…"
                className="h-11 bg-white pl-9"
                autoFocus
                inputMode="search"
              />
            </div>
            <div className="mt-3 max-h-72 overflow-y-auto">
              {pickerPending && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Aranıyor…
                </div>
              )}
              {!pickerPending && pickerQuery.trim().length < 2 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Aramaya başlamak için yazın.</p>
              )}
              {!pickerPending && pickerQuery.trim().length >= 2 && pickerResults.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Eşleşen hasta yok.</p>
              )}
              {!pickerPending && pickerResults.length > 0 && (
                <ul className="space-y-1">
                  {pickerResults.map((patient) => (
                    <li key={patient.id}>
                      <button
                        type="button"
                        onClick={() => selectPatientForAction(patient.id)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-50 active:bg-slate-100"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue">
                          {patient.fullName
                            .split(' ')
                            .filter(Boolean)
                            .map((part) => part[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-brand-ink">{patient.fullName}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            #{patient.patientNumber}
                            {patient.phone ? ` · ${patient.phone}` : ''}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full max-w-full border-0 bg-sidebar p-0 text-white sm:max-w-sm"
        >
          <SheetTitle className="sr-only">Menü</SheetTitle>
          <div className="flex h-full flex-col pt-safe">
            <div className="border-b border-white/[0.08] px-5 py-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <DashboardBrandLockup />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="tap-target flex shrink-0 items-center justify-center rounded-xl text-white/70 hover:bg-white/5"
                  aria-label="Menüyü kapat"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white/90">{session.businessName}</p>
                <p className="text-[11px] text-white/50">{ROLE_LABELS[session.role]} · {session.fullName}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              <div className="space-y-4">
                {menuSections.map((section) => (
                  <div key={section.group}>
                    <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                      {section.label}
                    </p>
                    <ul className="space-y-1">
                      {section.items.map((item) => {
                        const active = isDashboardNavActive(pathname, item.href)
                        const label = item.id === 'agenda' ? scheduleLabels.agenda : item.name
                        return (
                          <li key={item.id}>
                            <Link
                              href={item.href}
                              onClick={() => setMenuOpen(false)}
                              className={cn(
                                'tap-target flex items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors',
                                active ? 'bg-brand-blue/15 text-white' : 'text-white/70 hover:bg-white/5',
                              )}
                            >
                              <item.icon
                                className={cn('h-5 w-5 shrink-0', active ? 'text-brand-blue' : 'text-white/55')}
                              />
                              <span className="flex-1">{label}</span>
                              {item.badge === 'notifications' && unreadCount > 0 && (
                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-blue px-1.5 text-[11px] font-bold leading-none text-white">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                              )}
                              {item.badge === 'messages' && unreadMessages > 0 && (
                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-blue px-1.5 text-[11px] font-bold leading-none text-white">
                                  {unreadMessages > 9 ? '9+' : unreadMessages}
                                </span>
                              )}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="my-4 h-px bg-white/10" />

              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="tap-target flex w-full items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-white/70 hover:bg-white/5 hover:text-rose-300"
                  >
                    <LogOut className="h-5 w-5 text-white/55" />
                    <span className="flex-1 text-left">Çıkış Yap</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <PatientFormDrawer open={drawer === 'patient'} onOpenChange={(open) => setDrawer(open ? 'patient' : null)} />
    </>
  )
}

function FabAction({
  icon,
  label,
  onClick,
  tone,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  tone: 'teal' | 'blue' | 'amber' | 'violet'
}) {
  const toneClasses = {
    teal: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-sky-50 text-sky-700',
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-700',
  }[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[96px] flex-col items-start gap-2 rounded-2xl border border-border/40 bg-white p-3 text-left shadow-sm transition-colors active:bg-slate-50"
    >
      <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', toneClasses)}>{icon}</span>
      <span className="text-sm font-semibold text-brand-ink">{label}</span>
    </button>
  )
}

