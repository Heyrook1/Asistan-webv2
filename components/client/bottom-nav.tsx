'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  Compass,
  HeartPulse,
  Home,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  icon: LucideIcon
  label: { tr: string; en: string }
  isActive: (pathname: string) => boolean
}

// Canonical patient IA (matches Expo tabs): Home · Discover · Appointments · Health · Profile.
// Labels are relabelled to the target IA; underlying routes stay stable (PWA shortcuts,
// /client/appointments -> /client/bookings redirect, existing deep links).
const NAV_ITEMS: NavItem[] = [
  {
    href: '/client',
    icon: Home,
    label: { tr: 'Ana Sayfa', en: 'Home' },
    isActive: (pathname) => pathname === '/client',
  },
  {
    href: '/client/clinics',
    icon: Compass,
    label: { tr: 'Keşfet', en: 'Discover' },
    isActive: (pathname) =>
      pathname.startsWith('/client/clinics') || pathname.startsWith('/client/doctors'),
  },
  {
    href: '/client/bookings',
    icon: CalendarDays,
    label: { tr: 'Randevular', en: 'Appointments' },
    isActive: (pathname) =>
      pathname.startsWith('/client/bookings') || pathname.startsWith('/client/appointments'),
  },
  {
    href: '/client/health',
    icon: HeartPulse,
    label: { tr: 'Sağlık', en: 'Health' },
    isActive: (pathname) => pathname.startsWith('/client/health'),
  },
  {
    href: '/client/profile',
    icon: UserRound,
    label: { tr: 'Profil', en: 'Profile' },
    isActive: (pathname) => pathname.startsWith('/client/profile'),
  },
]

export function ClientBottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3"
      aria-label={t({ tr: 'Hasta menüsü', en: 'Patient menu' })}
    >
      <div className="mx-auto max-w-[480px] pb-[max(0.65rem,env(safe-area-inset-bottom))]">
        <div className="rezervasyon-dock pointer-events-auto grid grid-cols-5 rounded-[1.55rem] border border-white/80 bg-white/95 p-1.5 shadow-[0_18px_50px_-18px_rgba(15,23,42,0.34)] ring-1 ring-slate-900/5 backdrop-blur-xl">
          {NAV_ITEMS.map((item) => {
            const active = item.isActive(pathname)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-[1.05rem] px-1 text-slate-500 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/40',
                  active && 'bg-[#EDF5FF] text-[#0071E3]',
                )}
              >
                <Icon
                  className={cn(
                    'size-[1.2rem] transition-transform group-active:scale-90',
                    active && 'stroke-[2.5]',
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    'max-w-full truncate text-[9px] font-semibold leading-none tracking-[-0.02em]',
                    active && 'font-extrabold',
                  )}
                >
                  {t(item.label)}
                </span>
                {active ? (
                  <span
                    aria-hidden
                    className="absolute bottom-1 size-1 rounded-full bg-[#0071E3]"
                  />
                ) : null}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
