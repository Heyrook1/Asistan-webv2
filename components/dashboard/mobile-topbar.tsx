'use client'

import Link from 'next/link'
import { Bell, LogOut, User, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AsistanLogo } from '@/components/asistan-logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import type { SessionContext } from '@/lib/rbac'

export function MobileTopbar({
  session,
  unreadCount,
}: {
  session: SessionContext
  unreadCount: number
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 bg-white/85 px-3 backdrop-blur supports-[backdrop-filter]:bg-white/75 lg:hidden">
      <Link href="/dashboard" className="flex min-w-0 items-center" aria-label="Asistan'a git">
        <AsistanLogo variant="dark" size="md" priority />
      </Link>

      <div className="ml-auto flex items-center gap-1">
        <Link
          href="/dashboard/bildirimler"
          className="tap-target relative flex items-center justify-center rounded-xl text-foreground/70 hover:bg-[#F7F8FB]"
          aria-label="Bildirimler"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 min-w-[16px] h-4 rounded-full bg-[#12C8AD] text-[#06142A] text-[9px] font-bold flex items-center justify-center px-1 leading-none ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="tap-target flex items-center justify-center rounded-xl hover:bg-[#F7F8FB]">
            <Avatar className="h-9 w-9">
              <AvatarFallback
                className="text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #12C8AD, #16A9E8)' }}
              >
                {initials || 'AS'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg">
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold text-[#0C1D36]">{session.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{session.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/ayarlar" className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-muted-foreground" />
                Profilim
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/ayarlar" className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                İşletme Ayarları
              </Link>
            </DropdownMenuItem>
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
