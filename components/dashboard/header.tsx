'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Building2,
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  Command,
  HelpCircle,
  LogOut,
  MessageCircle,
  Scissors,
  User,
  UserPlus,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { can, ROLE_LABELS, type SessionContext } from '@/lib/rbac'
import { NotificationBell } from '@/components/dashboard/notification-bell'
import type { NotificationListItem } from '@/lib/notifications/types'
import { GlobalCommandTrigger } from '@/components/dashboard/global-command-palette'

const DASHBOARD_COMMAND_OPEN_EVENT = 'dashboard:command-open'

export function DashboardHeader({
  session,
  unreadCount,
  unreadMessages,
  notifications,
  membership,
}: {
  session: SessionContext
  unreadCount: number
  unreadMessages: number
  notifications: NotificationListItem[]
  membership: {
    planName: string
    isDemo: boolean
    accessEndAt: string | null
  } | null
}) {
  const router = useRouter()
  const initials = session.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const membershipEndText = membership?.accessEndAt
    ? new Date(membership.accessEndAt).toLocaleDateString('tr-TR')
    : 'Suresiz'

  const canManageAppointments = can(session, 'appointment.manage')
  const canCreatePatients = can(session, 'patient.edit')
  const canManageServices = can(session, 'service.manage')
  const hasQuickActions = canManageAppointments || canCreatePatients || canManageServices

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Çıkış yapıldı')
    router.push('/auth/login')
    router.refresh()
  }

  function openCommandPalette() {
    window.dispatchEvent(new Event(DASHBOARD_COMMAND_OPEN_EVENT))
  }

  return (
    <header className="sticky top-0 z-30 hidden h-[68px] items-center gap-3 border-b border-border/50 bg-white/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/70 lg:flex lg:px-6">
      <div className="flex max-w-xl flex-1">
        <GlobalCommandTrigger />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {hasQuickActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 gap-2 rounded-xl bg-white">
                <Zap className="h-4 w-4 text-brand-teal" />
                Hızlı Aksiyon
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl border-border/40 shadow-lg">
              <DropdownMenuLabel>Kısayol İşlemleri</DropdownMenuLabel>
              {canManageAppointments && (
                <DropdownMenuItem onSelect={() => router.push('/dashboard/randevular?create=1')}>
                  <CalendarPlus className="h-4 w-4 text-brand-teal" />
                  Yeni Randevu
                </DropdownMenuItem>
              )}
              {canCreatePatients && (
                <DropdownMenuItem onSelect={() => router.push('/dashboard/hastalar?create=1')}>
                  <UserPlus className="h-4 w-4 text-brand-teal" />
                  Yeni Hasta
                </DropdownMenuItem>
              )}
              {canManageServices && (
                <DropdownMenuItem onSelect={() => router.push('/dashboard/hizmetler?create=1')}>
                  <Scissors className="h-4 w-4 text-brand-teal" />
                  Yeni Hizmet
                </DropdownMenuItem>
              )}
              {canManageAppointments && (
                <DropdownMenuItem onSelect={() => router.push('/dashboard/takvim')}>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  Takvime Git
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={openCommandPalette}>
                <Command className="h-4 w-4 text-muted-foreground" />
                Komut Paleti
                <DropdownMenuShortcut>Ctrl K</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {membership && (
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 xl:flex">
            <span className="text-xs font-semibold text-brand-ink">
              {membership.isDemo ? 'Demo' : membership.planName}
            </span>
            <span className="text-xs text-muted-foreground">Pasif: {membershipEndText}</span>
          </div>
        )}

        <Link
          href="/dashboard/mesajlar"
          aria-label="Mesajlar"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground/70 transition hover:bg-dashboard-hover"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          {unreadMessages > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-danger px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </Link>

        <NotificationBell
          businessId={session.businessId}
          userId={session.userId}
          notifications={notifications}
          unreadCount={unreadCount}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2.5 rounded-xl pl-1.5 pr-2.5 hover:bg-dashboard-hover">
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className="text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-cyan))' }}
                >
                  {initials || 'AS'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left md:flex">
                <span className="text-[13px] font-semibold leading-tight text-foreground">{session.fullName}</span>
                <span className="text-[11px] leading-tight text-muted-foreground">{ROLE_LABELS[session.role]}</span>
              </div>
              <ChevronDown className="ml-1 hidden h-3.5 w-3.5 text-muted-foreground md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/40 shadow-lg">
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold">{session.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{session.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/ayarlar" className="flex cursor-pointer items-center gap-2.5">
                <User className="h-4 w-4 text-muted-foreground" />
                Profilim
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/ayarlar" className="flex cursor-pointer items-center gap-2.5">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                İşletme Ayarları
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex cursor-pointer items-center gap-2.5">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              Destek
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-2.5 text-red-500 focus:text-red-500"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

