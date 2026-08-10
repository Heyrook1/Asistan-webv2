'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LogOut, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { AsistanLogo } from '@/components/asistan-logo'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DASHBOARD_NAV_ITEMS,
  filterDashboardNavItems,
  groupDashboardNavItems,
  isDashboardNavActive,
  type DashboardNavItem,
} from '@/lib/dashboard/nav'
import { ROLE_LABELS, appointmentScheduleNavLabels } from '@/lib/rbac'
import type { SessionContext } from '@/lib/rbac'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

function navLabel(item: DashboardNavItem, agendaLabel: string) {
  if (item.id === 'agenda') return agendaLabel
  return item.name
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const scheduleLabels = appointmentScheduleNavLabels(session)
  const search = searchParams.toString()

  const sections = groupDashboardNavItems(
    filterDashboardNavItems(DASHBOARD_NAV_ITEMS, {
      session,
      showPlatformAdmin,
      showSuperAdmin,
      teamMessagingEnabled,
      clinicAnalyticsEnabled,
    }),
  )

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

        <ScrollArea className="relative flex-1 py-3">
          <nav className="space-y-4 px-3" aria-label="Klinik menü">
            {sections.map((section) => (
              <div key={section.group}>
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const href =
                      item.badge === 'pendingAppointments' && pendingAppointments > 0
                        ? '/dashboard/ajanda?mode=liste&status=SCHEDULED'
                        : item.href
                    const active = isDashboardNavActive(pathname, item.href, search)
                    return (
                      <Link
                        key={item.id}
                        href={href}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                          active
                            ? 'bg-gradient-to-r from-brand-blue/20 to-transparent text-white shadow-[inset_0_0_0_1px_rgba(0,113,227,0.35)]'
                            : 'text-white/60 hover:bg-white/[0.05] hover:text-white/95',
                        )}
                      >
                        {active && (
                          <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-brand-blue" />
                        )}
                        <item.icon
                          className={cn(
                            'h-[18px] w-[18px] shrink-0',
                            active ? 'text-brand-blue' : 'group-hover:text-white/90',
                          )}
                        />
                        <span className="flex-1 truncate">{navLabel(item, scheduleLabels.agenda)}</span>
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
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="relative shrink-0 space-y-2 px-3 pb-4 pt-2">
          <div
            className="relative overflow-hidden rounded-2xl border p-4"
            style={{
              borderColor: 'var(--sidebar-card-border)',
              background:
                'linear-gradient(155deg, var(--sidebar-card) 0%, var(--sidebar-card-mid) 60%, var(--sidebar-card-end) 100%)',
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
