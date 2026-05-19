'use client'

import { ChevronDown, User, Building2, HelpCircle, LogOut, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { SessionContext } from '@/lib/rbac'
import { ROLE_LABELS } from '@/lib/rbac'
import { PatientSearch } from '@/components/dashboard/patient-search'
import { NotificationBell } from '@/components/dashboard/notification-bell'
import type { NotificationListItem } from '@/lib/notifications/types'

export function DashboardHeader({
  session,
  unreadCount,
  unreadMessages,
  notifications,
}: {
  session: SessionContext
  unreadCount: number
  unreadMessages: number
  notifications: NotificationListItem[]
}) {
  const router = useRouter()
  const initials = session.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Çıkış yapıldı')
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 hidden h-[68px] items-center gap-3 border-b border-border/50 bg-white/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/70 lg:flex lg:px-6">
      <div className="flex flex-1 max-w-xl">
        <PatientSearch />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Link
          href="/dashboard/mesajlar"
          aria-label="Mesajlar"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground/70 transition hover:bg-[#F7F8FB]"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          {unreadMessages > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF4D4F] px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
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
            <Button variant="ghost" className="h-10 gap-2.5 pl-1.5 pr-2.5 rounded-xl hover:bg-[#F7F8FB]">
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className="text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #12C8AD, #16A9E8)' }}
                >
                  {initials || 'AS'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-left md:flex">
                <span className="text-[13px] font-semibold leading-tight text-foreground">
                  {session.fullName}
                </span>
                <span className="text-[11px] text-muted-foreground leading-tight">
                  {ROLE_LABELS[session.role]}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border/40">
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold">{session.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{session.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/ayarlar" className="flex items-center gap-2.5 cursor-pointer">
                <User className="h-4 w-4 text-muted-foreground" />
                Profilim
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/ayarlar" className="flex items-center gap-2.5 cursor-pointer">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                İşletme Ayarları
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2.5 cursor-pointer">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              Destek
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2.5 text-red-500 focus:text-red-500 cursor-pointer"
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
