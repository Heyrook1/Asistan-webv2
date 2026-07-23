'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, HeartPulse, Home, Search, User } from 'lucide-react'

import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

export function ClientBottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const homeActive = pathname === '/client'
  const bookingsActive =
    pathname.startsWith('/client/bookings') || pathname.startsWith('/client/appointments')
  const searchActive = pathname.startsWith('/client/clinics')
  const healthActive = pathname.startsWith('/client/health')
  const profileActive = pathname.startsWith('/client/profile')

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50"
      aria-label={t({ tr: 'Hasta menüsü', en: 'Patient menu' })}
    >
      <div className="mx-auto max-w-[480px] pb-[max(0.35rem,env(safe-area-inset-bottom))]">
        <div className="rezervasyon-dock pointer-events-auto flex items-end rounded-t-[1.5rem] border-t border-slate-200/90 bg-white px-0.5 pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)]">
          <Link
            href="/client"
            aria-current={homeActive ? 'page' : undefined}
            className="flex min-h-[62px] flex-1 flex-col items-center gap-0.5 pb-1"
          >
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-[0.9rem]',
                homeActive ? 'bg-[#0071E3]/12 text-[#0071E3]' : 'text-slate-500',
              )}
            >
              <Home className="size-[1.25rem]" strokeWidth={homeActive ? 2.4 : 2} />
            </span>
            <span
              className={cn(
                'text-[10px] font-semibold',
                homeActive ? 'font-extrabold text-[#0071E3]' : 'text-slate-500',
              )}
            >
              {t({ tr: 'Ana Sayfa', en: 'Home' })}
            </span>
          </Link>

          <Link
            href="/client/bookings"
            aria-current={bookingsActive ? 'page' : undefined}
            className="flex min-h-[62px] flex-1 flex-col items-center gap-0.5 pb-1"
          >
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-[0.9rem]',
                bookingsActive ? 'bg-[#0071E3]/12 text-[#0071E3]' : 'text-slate-500',
              )}
            >
              <CalendarDays className="size-[1.25rem]" strokeWidth={bookingsActive ? 2.4 : 2} />
            </span>
            <span
              className={cn(
                'text-[10px] font-semibold',
                bookingsActive ? 'font-extrabold text-[#0071E3]' : 'text-slate-500',
              )}
            >
              {t({ tr: 'Randevular', en: 'Bookings' })}
            </span>
          </Link>

          <Link
            href="/client/clinics"
            aria-current={searchActive ? 'page' : undefined}
            aria-label={t({ tr: 'Ara', en: 'Search' })}
            className="flex min-h-[62px] flex-1 flex-col items-center pb-1"
          >
            <span
              className={cn(
                '-mt-7 flex size-[56px] items-center justify-center rounded-full border-[4px] border-white bg-[#0071E3] text-white shadow-[0_10px_24px_rgba(0,113,227,0.35)] transition',
                searchActive && 'scale-[1.04] ring-4 ring-[#0071E3]/20',
              )}
            >
              <Search className="size-6" strokeWidth={2.4} />
            </span>
            <span
              className={cn(
                'mt-1 text-[10px] font-semibold',
                searchActive ? 'font-extrabold text-[#0071E3]' : 'text-slate-500',
              )}
            >
              {t({ tr: 'Ara', en: 'Search' })}
            </span>
          </Link>

          <Link
            href="/client/health"
            aria-current={healthActive ? 'page' : undefined}
            className="flex min-h-[62px] flex-1 flex-col items-center gap-0.5 pb-1"
          >
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-[0.9rem]',
                healthActive ? 'bg-[#0071E3]/12 text-[#0071E3]' : 'text-slate-500',
              )}
            >
              <HeartPulse className="size-[1.25rem]" strokeWidth={healthActive ? 2.4 : 2} />
            </span>
            <span
              className={cn(
                'text-[10px] font-semibold',
                healthActive ? 'font-extrabold text-[#0071E3]' : 'text-slate-500',
              )}
            >
              {t({ tr: 'Pasaport', en: 'Passport' })}
            </span>
          </Link>

          <Link
            href="/client/profile"
            aria-current={profileActive ? 'page' : undefined}
            className="flex min-h-[62px] flex-1 flex-col items-center gap-0.5 pb-1"
          >
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-[0.9rem]',
                profileActive ? 'bg-[#0071E3]/12 text-[#0071E3]' : 'text-slate-500',
              )}
            >
              <User className="size-[1.25rem]" strokeWidth={profileActive ? 2.4 : 2} />
            </span>
            <span
              className={cn(
                'text-[10px] font-semibold',
                profileActive ? 'font-extrabold text-[#0071E3]' : 'text-slate-500',
              )}
            >
              {t({ tr: 'Profil', en: 'Profile' })}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
