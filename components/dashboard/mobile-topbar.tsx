'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, CreditCard, LogOut, MessageCircle, User } from 'lucide-react'
import { toast } from 'sonner'

import { DashboardBrandLockup } from '@/components/dashboard/dashboard-brand-lockup'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GlobalCommandTrigger } from '@/components/dashboard/global-command-palette'
import { NotificationBell } from '@/components/dashboard/notification-bell'
import { createClient } from '@/lib/supabase/client'
import type { SessionContext } from '@/lib/rbac'
import type { NotificationListItem } from '@/lib/notifications/types'
import { canManageClinicSettings } from '@/lib/settings/tabs'
import type { DashboardMembership } from '@/components/dashboard/membership-expiry-banner'

export function MobileTopbar({
  session,
  unreadCount,
  unreadMessages,
  notifications,
  membership,
  teamMessagingEnabled = false,
}: {
  session: SessionContext
  unreadCount: number
  unreadMessages: number
  notifications: NotificationListItem[]
  membership: DashboardMembership | null
  teamMessagingEnabled?: boolean
}) {
  const router = useRouter()
  const canManageSettings = canManageClinicSettings(session)
  const initials = session.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const membershipEndText = membership?.accessEndAt
    ? new Date(membership.accessEndAt).toLocaleDateString('tr-TR')
    : 'Süresiz'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Çıkış yapıldı')
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-15 items-center gap-2 border-b border-border/60 bg-white/85 px-3 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 lg:hidden">
      <DashboardBrandLockup compact />

      <div className="ml-auto flex items-center gap-1">
        <GlobalCommandTrigger variant="icon" />

        {teamMessagingEnabled ? (
          <Link
            href="/dashboard/mesajlar"
            aria-label="Mesajlar"
            className="tap-target relative flex h-10 w-10 items-center justify-center rounded-xl text-foreground/70 hover:bg-dashboard-hover"
          >
            <MessageCircle className="h-5 w-5" />
            {unreadMessages > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-danger px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </Link>
        ) : null}

        <NotificationBell
          businessId={session.businessId}
          userId={session.userId}
          notifications={notifications}
          unreadCount={unreadCount}
          variant="mobile"
        />

        <DropdownMenu>
          <DropdownMenuTrigger className="tap-target flex items-center justify-center rounded-xl hover:bg-dashboard-hover" aria-label="Hesap menüsü">
            <Avatar className="h-9 w-9">
              <AvatarFallback
                className="text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-blue-hover))' }}
              >
                {initials || 'AS'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/50 shadow-xl">
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold text-brand-ink">{session.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{session.email}</p>
              {membership && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {membership.isDemo ? 'Demo' : membership.planName} · Erişim: {membershipEndText}
                </p>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/ayarlar?tab=hesap" className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-muted-foreground" />
                Profilim
              </Link>
            </DropdownMenuItem>
            {canManageSettings && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/ayarlar?tab=isletme" className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  İşletme Ayarları
                </Link>
              </DropdownMenuItem>
            )}
            {canManageSettings && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/ayarlar?tab=abonelik" className="flex items-center gap-2.5">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Abonelik
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2.5 text-rose-600 focus:text-rose-600"
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

