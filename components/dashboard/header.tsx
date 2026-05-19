'use client'

import { Bell, ChevronDown, User, Building2, HelpCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { SessionContext } from '@/lib/rbac'
import { ROLE_LABELS } from '@/lib/rbac'
import { PatientSearch } from '@/components/dashboard/patient-search'

export function DashboardHeader({
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
    <header className="sticky top-0 z-30 hidden h-[68px] items-center gap-3 border-b border-border/50 bg-white/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/70 lg:flex lg:px-6">
      <div className="flex flex-1 max-w-xl">
        <PatientSearch />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-[#F7F8FB]">
              <Bell className="h-[18px] w-[18px] text-foreground/70" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#12C8AD] text-[#06142A] text-[9px] font-bold flex items-center justify-center leading-none ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-lg border-border/40">
            <DropdownMenuLabel className="flex items-center justify-between py-3 px-4">
              <span className="font-semibold">Bildirimler</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] bg-[#12C8AD]/10 text-[#0b7f6f] border-0">
                  {unreadCount} yeni
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/bildirimler"
                className="w-full justify-center text-sm font-medium text-[#12C8AD] py-2.5"
              >
                Tümünü Gör →
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
