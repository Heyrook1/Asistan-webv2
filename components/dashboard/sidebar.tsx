'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AsistanLogo } from '@/components/asistan-logo'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  LayoutDashboard, Calendar, CalendarDays, Users,
  Briefcase, Clock, Star, Bell, BarChart3,
  Settings, Menu, X, Sparkles, HelpCircle, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { name: 'Genel Bakış',      href: '/dashboard',                icon: LayoutDashboard },
  { name: 'Randevular',       href: '/dashboard/randevular',     icon: Calendar },
  { name: 'Takvim',           href: '/dashboard/takvim',         icon: CalendarDays },
  { name: 'Hastalar',         href: '/dashboard/musteriler',     icon: Users },
  { name: 'Hizmetler',        href: '/dashboard/hizmetler',      icon: Briefcase },
  { name: 'Müsaitlik',        href: '/dashboard/musaitlik',      icon: Clock },
  { name: 'Değerlendirmeler', href: '/dashboard/degerlendirmeler', icon: Star },
  { name: 'Bildirimler',      href: '/dashboard/bildirimler',    icon: Bell, badge: true },
  { name: 'Analitik',         href: '/dashboard/analitik',       icon: BarChart3 },
  { name: 'Ayarlar',          href: '/dashboard/ayarlar',        icon: Settings },
]

interface DashboardSidebarProps {
  unreadNotifications?: number
  canAccessAnalytics?: boolean
  canManageTeam?: boolean
}

export function DashboardSidebar({ unreadNotifications = 5 }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Çıkış yapıldı')
    router.push('/auth/login')
    router.refresh()
  }

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col bg-[#06142A] relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute -top-32 -left-20 h-64 w-64 rounded-full bg-[#12C8AD]/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-[#16A9E8]/5 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex h-[68px] shrink-0 items-center px-5 border-b border-[#1A3050]">
          <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
            <AsistanLogo variant="light" />
          </Link>
        </div>

        {/* Nav */}
        <ScrollArea className="relative flex-1 py-4">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group',
                    active
                      ? 'bg-gradient-to-r from-[#12C8AD]/15 to-transparent text-white shadow-[inset_0_0_0_1px_rgba(18,200,173,0.2)]'
                      : 'text-white/55 hover:bg-white/[0.04] hover:text-white/90'
                  )}
                >
                  {active && (
                    <span className="absolute left-0 inset-y-2 w-[3px] rounded-r-full bg-[#12C8AD]" />
                  )}
                  <item.icon
                    className={cn(
                      'h-[18px] w-[18px] shrink-0 transition-colors',
                      active ? 'text-[#12C8AD]' : 'group-hover:text-white/90'
                    )}
                  />
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge && unreadNotifications > 0 && (
                    <span className="min-w-[20px] h-5 rounded-full bg-[#12C8AD] text-[#06142A] text-[11px] font-bold flex items-center justify-center px-1.5 leading-none">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Bottom */}
        <div className="relative shrink-0 px-3 pb-4 pt-2 space-y-2">
          {/* Upgrade Card */}
          <div className="relative overflow-hidden rounded-2xl p-4 border border-[#1F3A60]" style={{ background: 'linear-gradient(155deg, #0E2D52 0%, #0A2240 60%, #0D2D4D 100%)' }}>
            <div className="absolute -right-4 -top-4 opacity-90">
              <Sparkles className="h-12 w-12 text-[#12C8AD]/30" />
            </div>
            <div className="absolute right-6 bottom-3 opacity-60">
              <div className="h-1 w-1 rounded-full bg-white/30" />
            </div>
            <div className="absolute right-10 bottom-6 opacity-60">
              <div className="h-1.5 w-1.5 rounded-full bg-[#12C8AD]/50" />
            </div>
            <p className="relative text-sm font-bold text-white mb-1 leading-tight">
              Asistan Pro'ya yükseltin
            </p>
            <p className="relative text-[11px] text-white/55 mb-3 leading-relaxed">
              Daha fazlası için<br />şimdi yükseltin.
            </p>
            <button className="relative rounded-lg px-4 py-1.5 text-xs font-bold bg-[#12C8AD] hover:bg-[#10B49C] text-[#06142A] transition-colors">
              Yükselt
            </button>
          </div>

          {/* Help center */}
          <button
            onClick={() => toast.info('Yardım merkezi yakında aktif olacak.')}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/55 hover:bg-white/[0.04] hover:text-white/90 transition-all duration-200 group"
          >
            <HelpCircle className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 text-left">Yardım Merkezi</span>
            <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-[14px] z-50 lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-[#06142A] text-white shadow-lg border border-[#1A3050]"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menüyü aç/kapat"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </aside>
    </>
  )
}
