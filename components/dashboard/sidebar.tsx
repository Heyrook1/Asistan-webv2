'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ClipboardList,
  BarChart3,
  Bell,
  Briefcase,
  CalendarDays,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Scale,
  Settings,
  Shield,
  Sparkles,
  ScrollText,
  UserCog,
  Users,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'

import { AsistanLogo } from '@/components/asistan-logo'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ROLE_LABELS, canViewAppointmentSchedule, appointmentScheduleNavLabels } from '@/lib/rbac'
import type { Permission, SessionContext } from '@/lib/rbac'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type NavItem = {
  name: string
  href: string
  icon: typeof LayoutDashboard
  permission?: Permission
  /** Show if the session has any of these permissions (OR). */
  anyOfPermissions?: Permission[]
  adminOnly?: boolean
  superAdminOnly?: boolean
  badge?: 'notifications' | 'messages' | 'pendingAppointments'
}

/** Analitik nav — honest ops overview (on by default). Hidden when clinicAnalytics is off. */
const ANALITIK_NAV_ITEM: NavItem = {
  name: 'Analitik',
  href: '/dashboard/analitik',
  icon: BarChart3,
  permission: 'analytics.view',
}

const BASE_NAV_ITEMS: NavItem[] = [
  { name: 'Genel Bakış', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Ajanda',
    href: '/dashboard/ajanda',
    icon: CalendarDays,
    anyOfPermissions: ['appointment.manage', 'appointment.view', 'appointment.own.view'],
    badge: 'pendingAppointments',
  },
  { name: 'Hastalar', href: '/dashboard/hastalar', icon: Users, permission: 'patient.view' },
  {
    name: 'Kimlik eşleşmeleri',
    href: '/dashboard/kimlik-eslesmeleri',
    icon: Sparkles,
    permission: 'patient.edit',
  },
  { name: 'Hizmetler', href: '/dashboard/hizmetler', icon: Briefcase, permission: 'service.manage' },
  { name: 'Anketler', href: '/dashboard/anketler', icon: ClipboardList, permission: 'service.manage' },
  {
    name: 'Faturalar',
    href: '/dashboard/faturalar',
    icon: FileText,
    anyOfPermissions: ['appointment.manage', 'analytics.revenue.view'],
  },
  { name: 'Takım', href: '/dashboard/takim', icon: UserCog, permission: 'team.manage' },
  { name: 'Mesajlar', href: '/dashboard/mesajlar', icon: MessageCircle, badge: 'messages' },
  { name: 'Bildirimler', href: '/dashboard/bildirimler', icon: Bell, badge: 'notifications' },
  { name: 'Denetim', href: '/dashboard/denetim', icon: ScrollText, permission: 'audit.view' },
  { name: 'Yönetişim', href: '/dashboard/yonetisim', icon: Scale, superAdminOnly: true },
  { name: 'Super Admin', href: '/dashboard/super-admin', icon: Shield, superAdminOnly: true },
  { name: 'Ayarlar', href: '/dashboard/ayarlar?tab=hesap', icon: Settings },
]

function buildNavItems(clinicAnalyticsEnabled: boolean): NavItem[] {
  if (!clinicAnalyticsEnabled) return BASE_NAV_ITEMS
  const denetimIdx = BASE_NAV_ITEMS.findIndex((item) => item.href === '/dashboard/denetim')
  if (denetimIdx < 0) return [...BASE_NAV_ITEMS, ANALITIK_NAV_ITEM]
  return [
    ...BASE_NAV_ITEMS.slice(0, denetimIdx),
    ANALITIK_NAV_ITEM,
    ...BASE_NAV_ITEMS.slice(denetimIdx),
  ]
}

function isNavActive(pathname: string, href: string) {
  const path = href.split('?')[0]
  if (path === '/dashboard/ajanda') {
    return (
      pathname === '/dashboard/ajanda' ||
      pathname.startsWith('/dashboard/ajanda/') ||
      pathname === '/dashboard/randevular' ||
      pathname.startsWith('/dashboard/randevular/') ||
      pathname === '/dashboard/takvim' ||
      pathname.startsWith('/dashboard/takvim/')
    )
  }
  return pathname === path || (path !== '/dashboard' && pathname.startsWith(path))
}

export function DashboardSidebar({
  unreadNotifications,
  unreadMessages = 0,
  pendingAppointments = 0,
  session,
  showPlatformAdmin = false,
  showSuperAdmin = false,
  teamMessagingEnabled = false,
  clinicAnalyticsEnabled = false,
}: {
  unreadNotifications: number
  unreadMessages?: number
  pendingAppointments?: number
  session: SessionContext
  showPlatformAdmin?: boolean
  showSuperAdmin?: boolean
  teamMessagingEnabled?: boolean
  clinicAnalyticsEnabled?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const scheduleLabels = appointmentScheduleNavLabels(session)

  const visibleItems = buildNavItems(clinicAnalyticsEnabled).filter((item) => {
    if (item.href === '/dashboard/mesajlar' && !teamMessagingEnabled) return false
    if (item.adminOnly && !showPlatformAdmin) return false
    if (item.superAdminOnly && !showSuperAdmin) return false
    if (item.anyOfPermissions?.length) {
      if (item.href === '/dashboard/ajanda' || item.href.startsWith('/dashboard/ajanda?')) {
        return canViewAppointmentSchedule(session)
      }
      return item.anyOfPermissions.some((permission) => session.permissions.includes(permission))
    }
    return !item.permission || session.permissions.includes(item.permission)
  })

  function navLabel(item: NavItem) {
    if (
      item.href === '/dashboard/ajanda' ||
      item.href.startsWith('/dashboard/ajanda?') ||
      item.href === '/dashboard/randevular' ||
      item.href === '/dashboard/takvim'
    ) {
      return scheduleLabels.agenda
    }
    return item.name
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Çıkış yapıldı')
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
      <div className="relative flex h-full flex-col overflow-hidden bg-sidebar">
        <div className="pointer-events-none absolute -left-20 -top-32 h-64 w-64 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-12 h-56 w-56 rounded-full bg-brand-blue/5 blur-3xl" />

        <div className="relative flex h-[72px] shrink-0 flex-col justify-center border-b border-sidebar-border px-5">
          <Link href="/dashboard" aria-label="Asistan Health paneli" className="inline-flex flex-col items-start gap-0.5">
            <AsistanLogo lockup="mark" variant="light" size="lg" priority />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
              Asistan Health
            </span>
          </Link>
        </div>

        <ScrollArea className="relative flex-1 py-4">
          <nav className="space-y-1 px-3">
            {visibleItems.map((item) => {
              const href =
                item.badge === 'pendingAppointments' && pendingAppointments > 0
                  ? '/dashboard/ajanda?mode=liste&status=SCHEDULED'
                  : item.href
              const active = isNavActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-gradient-to-r from-brand-blue/20 to-transparent text-white shadow-[inset_0_0_0_1px_rgba(0,113,227,0.35)]'
                      : 'text-white/60 hover:bg-white/[0.05] hover:text-white/95',
                  )}
                >
                  {active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-brand-blue" />}
                  <item.icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-brand-blue' : 'group-hover:text-white/90')} />
                  <span className="flex-1 truncate">{navLabel(item)}</span>
                  {item.badge === 'notifications' && unreadNotifications > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-blue px-1.5 text-[11px] font-bold leading-none text-white">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                  {item.badge === 'messages' && unreadMessages > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-blue px-1.5 text-[11px] font-bold leading-none text-white">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                  {item.badge === 'pendingAppointments' && pendingAppointments > 0 && (
                    <span
                      className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-400 px-1.5 text-[11px] font-bold leading-none text-amber-950"
                      title="Onay bekleyen randevu"
                    >
                      {pendingAppointments > 9 ? '9+' : pendingAppointments}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        <div className="relative shrink-0 space-y-2 px-3 pb-4 pt-2">
          <div
            className="relative overflow-hidden rounded-2xl border p-4"
            style={{
              borderColor: 'var(--sidebar-card-border)',
              background: 'linear-gradient(155deg, var(--sidebar-card) 0%, var(--sidebar-card-mid) 60%, var(--sidebar-card-end) 100%)',
            }}
          >
            <div className="absolute -right-4 -top-4 opacity-90">
              <Sparkles className="h-12 w-12 text-brand-blue/30" />
            </div>
            <p className="relative mb-1 truncate text-sm font-bold text-white">{session.businessName}</p>
            <p className="relative mb-3 text-[11px] text-white/55">
              {ROLE_LABELS[session.role]} · {session.fullName}
            </p>
            <Link
              href={session.isOwner ? '/dashboard/ayarlar?tab=isletme' : '/dashboard/ayarlar?tab=hesap'}
              className="relative inline-block rounded-lg bg-brand-blue px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-blue/90"
            >
              {session.isOwner ? 'İşletme Ayarları' : 'Profilim'}
            </Link>
          </div>

          <Link
            href="/dashboard/yardim"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.05] hover:text-white/90"
          >
            <HelpCircle className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 text-left">Yardım Merkezi</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.05] hover:text-rose-300"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 text-left">Çıkış Yap</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

