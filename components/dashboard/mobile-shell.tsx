'use client'

import { useEffect, useState, useTransition, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Bell,
  Briefcase,
  CalendarDays,
  CalendarPlus,
  HelpCircle,
  Home,
  Loader2,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Shield,
  StickyNote,
  Upload,
  UserCog,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { PatientFormDrawer } from '@/components/dashboard/patient-form-drawer'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { ROLE_LABELS, canViewAppointmentSchedule, appointmentScheduleNavLabels } from '@/lib/rbac'
import type { SessionContext, Permission } from '@/lib/rbac'
import {
  searchGlobalPalette,
  type GlobalPatientSearchHit,
} from '@/lib/actions/global-search'
import { cn } from '@/lib/utils'

type PrimaryNav = {
  name: string
  href: string
  icon: typeof Home
  permission?: Permission
  anyOfPermissions?: Permission[]
  match?: (path: string) => boolean
  badge?: 'notifications' | 'messages' | 'pendingAppointments'
}

type SecondaryNav = PrimaryNav & {
  superAdminOnly?: boolean
}

const PRIMARY_NAV: PrimaryNav[] = [
  { name: 'Ana Sayfa', href: '/dashboard', icon: Home, match: (p) => p === '/dashboard' },
  {
    name: 'Ajanda',
    href: '/dashboard/ajanda',
    icon: CalendarDays,
    anyOfPermissions: ['appointment.manage', 'appointment.view', 'appointment.own.view'],
    badge: 'pendingAppointments',
    match: (p) =>
      p === '/dashboard/ajanda' ||
      p.startsWith('/dashboard/ajanda/') ||
      p === '/dashboard/randevular' ||
      p.startsWith('/dashboard/randevular/') ||
      p === '/dashboard/takvim' ||
      p.startsWith('/dashboard/takvim/'),
  },
  { name: 'Hastalar', href: '/dashboard/hastalar', icon: Users, permission: 'patient.view' },
]

const SECONDARY_NAV: SecondaryNav[] = [
  { name: 'Mesajlar', href: '/dashboard/mesajlar', icon: MessageCircle, badge: 'messages' },
  { name: 'Hizmetler', href: '/dashboard/hizmetler', icon: Briefcase, permission: 'service.manage' },
  { name: 'Takım', href: '/dashboard/takim', icon: UserCog, permission: 'team.manage' },
  { name: 'Bildirimler', href: '/dashboard/bildirimler', icon: Bell, badge: 'notifications' },
  { name: 'Analitik', href: '/dashboard/analitik', icon: BarChart3, permission: 'analytics.view' },
  { name: 'Yönetişim', href: '/dashboard/yonetisim', icon: Shield, superAdminOnly: true },
  { name: 'Ayarlar', href: '/dashboard/ayarlar?tab=hesap', icon: Settings },
]

export function MobileShell({
  session,
  unreadCount,
  unreadMessages = 0,
  pendingAppointments = 0,
  showSuperAdmin = false,
}: {
  session: SessionContext
  unreadCount: number
  unreadMessages?: number
  pendingAppointments?: number
  showSuperAdmin?: boolean
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

  const can = (perm?: Permission) => !perm || session.permissions.includes(perm)
  const canAny = (perms?: Permission[]) =>
    !perms?.length || perms.some((permission) => session.permissions.includes(permission))

  const primaryItems = PRIMARY_NAV.filter((item) => {
    if (item.href === '/dashboard/ajanda') {
      return canViewAppointmentSchedule(session)
    }
    if (item.anyOfPermissions) return canAny(item.anyOfPermissions)
    return can(item.permission)
  })
  const secondaryItems = SECONDARY_NAV.filter((i) => {
    if (i.superAdminOnly && !showSuperAdmin) return false
    return can(i.permission)
  })
  if (showSuperAdmin) {
    secondaryItems.splice(secondaryItems.length - 1, 0, {
      name: 'Super Admin',
      href: '/dashboard/super-admin',
      icon: Shield,
    })
  }

  function primaryLabel(item: PrimaryNav) {
    if (item.href === '/dashboard/ajanda') return scheduleLabels.agendaShort
    return item.name
  }

  const isSecondaryActive = secondaryItems.some((item) => {
    const path = item.href.split('?')[0]
    return pathname === path || pathname.startsWith(`${path}/`)
  })
  const menuBadgeCount = unreadCount + unreadMessages

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
    }, 220)
    return () => window.clearTimeout(timer)
  }, [patientPicker, pickerQuery])

  function selectPatientForAction(patientId: string) {
    const action = patientPicker === 'file' ? 'file' : 'note'
    setPatientPicker(null)
    router.push(`/dashboard/hastalar/${patientId}?action=${action}`)
  }

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-white/90 backdrop-blur-xl pb-safe lg:hidden"
        aria-label="Alt gezinme"
      >
        <div className="grid grid-cols-4">
          {primaryItems.map((item) => {
            const active = item.match
              ? item.match(pathname)
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'tap-target flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
                  active ? 'text-brand-teal' : 'text-muted-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="relative">
                  <item.icon className="h-[22px] w-[22px]" />
                  {active && <span className="absolute -top-3 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-brand-teal" />}
                  {item.badge === 'pendingAppointments' && pendingAppointments > 0 && (
                    <span className="absolute -right-2.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold leading-none text-amber-950 ring-2 ring-white">
                      {pendingAppointments > 9 ? '9+' : pendingAppointments}
                    </span>
                  )}
                </span>
                {primaryLabel(item)}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={cn(
              'tap-target flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
              menuOpen || isSecondaryActive ? 'text-brand-teal' : 'text-muted-foreground',
            )}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
          >
            <span className="relative">
              <Menu className="h-[22px] w-[22px]" />
              {menuBadgeCount > 0 && !isSecondaryActive && (
                <span className="absolute -right-1.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-teal px-1 text-[9px] font-bold leading-none text-brand-navy ring-2 ring-white">
                  {menuBadgeCount > 9 ? '9+' : menuBadgeCount}
                </span>
              )}
            </span>
            Menü
          </button>
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setFabOpen(true)}
        aria-label="Hızlı işlemler"
        className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal text-white shadow-xl shadow-teal-500/40 transition-transform active:scale-95 lg:hidden"
        style={{ bottom: 'calc(72px + env(safe-area-inset-bottom))' }}
      >
        <Plus className="h-7 w-7" />
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
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-xs font-bold text-brand-teal">
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
        <SheetContent side="right" className="w-full max-w-full border-0 bg-sidebar p-0 text-white sm:max-w-sm">
          <SheetTitle className="sr-only">Menü</SheetTitle>
          <div className="flex h-full flex-col pt-safe">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-base font-bold">{session.businessName}</p>
                <p className="text-[11px] text-white/55">{ROLE_LABELS[session.role]} · {session.fullName}</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="tap-target flex items-center justify-center rounded-xl text-white/70 hover:bg-white/5"
                aria-label="Menüyü kapat"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              <ul className="space-y-1">
                {secondaryItems.map((item) => {
                  const path = item.href.split('?')[0]
                  const active = pathname === path || pathname.startsWith(`${path}/`)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          'tap-target flex items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors',
                          active ? 'bg-brand-teal/15 text-white' : 'text-white/70 hover:bg-white/5',
                        )}
                      >
                        <item.icon className={cn('h-5 w-5 shrink-0', active ? 'text-brand-teal' : 'text-white/55')} />
                        <span className="flex-1">{item.name}</span>
                        {item.badge === 'notifications' && unreadCount > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-teal px-1.5 text-[11px] font-bold leading-none text-brand-navy">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                        {item.badge === 'messages' && unreadMessages > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-teal px-1.5 text-[11px] font-bold leading-none text-brand-navy">
                            {unreadMessages > 9 ? '9+' : unreadMessages}
                          </span>
                        )}
                        {item.badge === 'pendingAppointments' && pendingAppointments > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-400 px-1.5 text-[11px] font-bold leading-none text-amber-950">
                            {pendingAppointments > 9 ? '9+' : pendingAppointments}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <div className="my-4 h-px bg-white/10" />

              <ul className="space-y-1">
                <li>
                  <Link
                    href="/contact"
                    onClick={() => setMenuOpen(false)}
                    className="tap-target flex w-full items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-white/70 hover:bg-white/5"
                  >
                    <HelpCircle className="h-5 w-5 text-white/55" />
                    <span className="flex-1 text-left">Yardım Merkezi</span>
                  </Link>
                </li>
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

