'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Calendar,
  CalendarDays,
  Users,
  Menu,
  Plus,
  UserPlus,
  CalendarPlus,
  StickyNote,
  Upload,
  Briefcase,
  UserCog,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  HelpCircle,
  X,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { SessionContext, Permission } from '@/lib/rbac'
import { ROLE_LABELS } from '@/lib/rbac'
import { AppointmentFormDrawer, type AppointmentOption } from '@/components/dashboard/appointment-form-drawer'
import { PatientFormDrawer } from '@/components/dashboard/patient-form-drawer'

export type MobileLookups = {
  patients: AppointmentOption[]
  services: (AppointmentOption & { durationMin: number })[]
  staff: AppointmentOption[]
}

type PrimaryNav = {
  name: string
  href: string
  icon: typeof Home
  permission?: Permission
  match?: (path: string) => boolean
}

type SecondaryNav = PrimaryNav & { badge?: boolean }

const PRIMARY_NAV: PrimaryNav[] = [
  { name: 'Ana Sayfa', href: '/dashboard', icon: Home, match: (p) => p === '/dashboard' },
  { name: 'Randevular', href: '/dashboard/randevular', icon: Calendar, permission: 'appointment.manage' },
  { name: 'Takvim', href: '/dashboard/takvim', icon: CalendarDays, permission: 'appointment.manage' },
  { name: 'Hastalar', href: '/dashboard/hastalar', icon: Users, permission: 'patient.view' },
]

const SECONDARY_NAV: SecondaryNav[] = [
  { name: 'Hizmetler', href: '/dashboard/hizmetler', icon: Briefcase, permission: 'service.manage' },
  { name: 'Takım', href: '/dashboard/takim', icon: UserCog, permission: 'team.manage' },
  { name: 'Bildirimler', href: '/dashboard/bildirimler', icon: Bell, badge: true },
  { name: 'Analitik', href: '/dashboard/analitik', icon: BarChart3, permission: 'analytics.view' },
  { name: 'Ayarlar', href: '/dashboard/ayarlar', icon: Settings },
]

export function MobileShell({
  session,
  unreadCount,
  lookups,
}: {
  session: SessionContext
  unreadCount: number
  lookups: MobileLookups
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [drawer, setDrawer] = useState<'patient' | 'appointment' | null>(null)

  const can = (perm?: Permission) => !perm || session.permissions.includes(perm)

  const primaryItems = PRIMARY_NAV.filter((i) => can(i.permission))
  const secondaryItems = SECONDARY_NAV.filter((i) => can(i.permission))

  const isSecondaryActive = secondaryItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  )

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
    } else if (action === 'appointment') {
      setDrawer('appointment')
    } else if (action === 'note') {
      toast.info('Not eklemek için bir hasta seçin')
      router.push('/dashboard/hastalar')
    } else {
      toast.info('Dosya yüklemek için bir hasta seçin')
      router.push('/dashboard/hastalar')
    }
  }

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-white/95 backdrop-blur pb-safe lg:hidden"
        aria-label="Ana navigasyon"
      >
        <div className="grid grid-cols-5">
          {primaryItems.map((item) => {
            const active = item.match
              ? item.match(pathname)
              : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'tap-target flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
                  active ? 'text-[#0B7F6F]' : 'text-muted-foreground'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="relative">
                  <item.icon className="h-[22px] w-[22px]" />
                  {active && (
                    <span className="absolute -top-3 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-[#0B7F6F]" />
                  )}
                </span>
                {item.name}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={cn(
              'tap-target flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
              menuOpen || isSecondaryActive ? 'text-[#0B7F6F]' : 'text-muted-foreground'
            )}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
          >
            <span className="relative">
              <Menu className="h-[22px] w-[22px]" />
              {unreadCount > 0 && !isSecondaryActive && (
                <span className="absolute -right-1.5 -top-1 min-w-[16px] h-4 rounded-full bg-[#0B7F6F] text-[#06142A] text-[9px] font-bold flex items-center justify-center px-1 leading-none ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
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
        className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0B7F6F] text-white shadow-xl shadow-teal-500/40 transition-transform active:scale-95 lg:hidden"
        style={{ bottom: 'calc(72px + env(safe-area-inset-bottom))' }}
      >
        <Plus className="h-7 w-7" />
      </button>

      <Sheet open={fabOpen} onOpenChange={setFabOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl border-t-0 p-0 pb-safe"
        >
          <SheetTitle className="sr-only">Hızlı İşlemler</SheetTitle>
          <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-slate-200" />
          <div className="px-4 pb-4 pt-3">
            <p className="mb-3 text-sm font-semibold text-[#0C1D36]">Hızlı İşlemler</p>
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
              {can('medical_note.view') && (
              <FabAction
                icon={<StickyNote className="h-6 w-6" />}
                label="Not Ekle"
                onClick={() => handleFabAction('note')}
                tone="amber"
              />
              )}
              {can('file.view') && (
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

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-full border-0 bg-[#06142A] p-0 text-white sm:max-w-sm"
        >
          <SheetTitle className="sr-only">Menü</SheetTitle>
          <div className="flex h-full flex-col pt-safe">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-base font-bold">{session.businessName}</p>
                <p className="text-[11px] text-white/55">{ROLE_LABELS[session.role]} • {session.fullName}</p>
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
                  const active = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          'tap-target flex items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors',
                          active
                            ? 'bg-[#0B7F6F]/15 text-white'
                            : 'text-white/70 hover:bg-white/5'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 shrink-0',
                            active ? 'text-[#0B7F6F]' : 'text-white/55'
                          )}
                        />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && unreadCount > 0 && (
                          <span className="min-w-[20px] h-5 rounded-full bg-[#0B7F6F] text-[#06142A] text-[11px] font-bold flex items-center justify-center px-1.5 leading-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
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
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      toast.info('Yardım merkezi yakında.')
                    }}
                    className="tap-target flex w-full items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-white/70 hover:bg-white/5"
                  >
                    <HelpCircle className="h-5 w-5 text-white/55" />
                    <span className="flex-1 text-left">Yardım Merkezi</span>
                  </button>
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

      <PatientFormDrawer
        open={drawer === 'patient'}
        onOpenChange={(open) => setDrawer(open ? 'patient' : null)}
      />
      <AppointmentFormDrawer
        open={drawer === 'appointment'}
        onOpenChange={(open) => setDrawer(open ? 'appointment' : null)}
        patients={lookups.patients}
        services={lookups.services}
        staff={lookups.staff}
      />
    </>
  )
}

function FabAction({
  icon,
  label,
  onClick,
  tone,
}: {
  icon: React.ReactNode
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
      <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', toneClasses)}>
        {icon}
      </span>
      <span className="text-sm font-semibold text-[#0C1D36]">{label}</span>
    </button>
  )
}
