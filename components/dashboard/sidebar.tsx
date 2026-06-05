'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  CalendarDays,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  UserCog,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

import { AsistanLogo } from '@/components/asistan-logo'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ROLE_LABELS } from '@/lib/rbac'
import type { Permission, SessionContext } from '@/lib/rbac'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type NavItem = {
  name: string
  href: string
  icon: typeof LayoutDashboard
  permission?: Permission
  adminOnly?: boolean
  superAdminOnly?: boolean
  badge?: boolean
}

const navItems: NavItem[] = [
  { name: 'Genel Bakış', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Randevular', href: '/dashboard/randevular', icon: Calendar, permission: 'appointment.manage' },
  { name: 'Takvim', href: '/dashboard/takvim', icon: CalendarDays, permission: 'appointment.manage' },
  { name: 'Hastalar', href: '/dashboard/hastalar', icon: Users, permission: 'patient.view' },
  { name: 'Hizmetler', href: '/dashboard/hizmetler', icon: Briefcase, permission: 'service.manage' },
  { name: 'Takım', href: '/dashboard/takim', icon: UserCog, permission: 'team.manage' },
  { name: 'Bildirimler', href: '/dashboard/bildirimler', icon: Bell, badge: true },
  { name: 'Analitik', href: '/dashboard/analitik', icon: BarChart3, permission: 'analytics.view' },
  { name: 'Super Admin', href: '/dashboard/super-admin', icon: Shield, superAdminOnly: true },
  { name: 'Ayarlar', href: '/dashboard/ayarlar', icon: Settings },
]

export function DashboardSidebar({
  unreadNotifications,
  session,
  showPlatformAdmin = false,
  showSuperAdmin = false,
}: {
  unreadNotifications: number
  session: SessionContext
  showPlatformAdmin?: boolean
  showSuperAdmin?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()

  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && !showPlatformAdmin) return false
    if (item.superAdminOnly && !showSuperAdmin) return false
    return !item.permission || session.permissions.includes(item.permission)
  })

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Çıkış yapıldı')
    router.push('/auth/login')
    router.refresh()
  }

  function SidebarContent() {
    return (
      <div className="relative flex h-full flex-col overflow-hidden bg-brand-navy">
        <div className="pointer-events-none absolute -left-20 -top-32 h-64 w-64 rounded-full bg-brand-teal/7 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-12 h-56 w-56 rounded-full bg-brand-cyan/7 blur-3xl" />

        <div className="relative flex h-[72px] shrink-0 items-center border-b border-sidebar-border px-5">
          <Link href="/dashboard" aria-label="Asistan paneli">
            <AsistanLogo variant="light" size="lg" priority />
          </Link>
        </div>

        <ScrollArea className="relative flex-1 py-4">
          <nav className="space-y-1 px-3">
            {visibleItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-gradient-to-r from-brand-teal/15 to-transparent text-white shadow-[inset_0_0_0_1px_rgba(11,127,111,0.24)]'
                      : 'text-white/60 hover:bg-white/[0.05] hover:text-white/95',
                  )}
                >
                  {active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-brand-teal" />}
                  <item.icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-brand-teal' : 'group-hover:text-white/90')} />
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge && unreadNotifications > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-teal px-1.5 text-[11px] font-bold leading-none text-brand-navy">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
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
              <Sparkles className="h-12 w-12 text-brand-teal/30" />
            </div>
            <p className="relative mb-1 truncate text-sm font-bold text-white">{session.businessName}</p>
            <p className="relative mb-3 text-[11px] text-white/55">
              {ROLE_LABELS[session.role]} · {session.fullName}
            </p>
            <Link
              href="/dashboard/ayarlar"
              className="relative inline-block rounded-lg bg-brand-teal px-4 py-1.5 text-xs font-bold text-brand-navy transition-colors hover:bg-brand-teal-hover"
            >
              İşletme Ayarları
            </Link>
          </div>

          <button
            type="button"
            onClick={() => toast.info('Yardım merkezi yakında bu alanda görünecek.')}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-all duration-200 hover:bg-white/[0.05] hover:text-white/90"
          >
            <HelpCircle className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 text-left">Yardım Merkezi</span>
          </button>

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
    )
  }

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
      <SidebarContent />
    </aside>
  )
}

