'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Bell } from 'lucide-react'

import { AsistanLogo } from '@/components/asistan-logo'
import { useLanguage } from '@/hooks/useLanguage'
import { patientChromeName } from '@/lib/brand/masterbrand'
import { cn } from '@/lib/utils'

const TITLES: Record<string, { tr: string; en: string }> = {
  '/client': { tr: 'Ana Sayfa', en: 'Home' },
  '/client/clinics': { tr: 'Klinikler', en: 'Clinics' },
  '/client/bookings': { tr: 'Randevular', en: 'Bookings' },
  '/client/appointments': { tr: 'Randevular', en: 'Bookings' },
  '/client/health': { tr: 'Pasaport', en: 'Passport' },
  '/client/profile': { tr: 'Profil', en: 'Profile' },
}

function titleForPath(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname]
  const hit = Object.keys(TITLES)
    .filter((k) => k !== '/client' && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]
  return hit ? TITLES[hit] : TITLES['/client']
}

export function RezervasyonTopBar() {
  const pathname = usePathname()
  const { t, language } = useLanguage()
  const isHome = pathname === '/client'
  const screen = titleForPath(pathname)

  // Home: site ana sayfasına dönüş (sol) + randevu zili (sağ); marka hero’da.
  if (isHome) {
    return (
      <header className="relative z-20 -mb-14 flex items-center justify-between gap-3 px-0 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="rz-press inline-flex h-11 min-w-[44px] items-center gap-1.5 rounded-full bg-white/15 px-3 text-white ring-1 ring-white/30 backdrop-blur-md"
          aria-label={t({ tr: 'Ana sayfaya dön', en: 'Back to homepage' })}
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          <span className="text-[12px] font-bold tracking-tight">
            {t({ tr: 'Ana sayfa', en: 'Home' })}
          </span>
        </Link>
        <Link
          href="/client/bookings"
          className="rz-press flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md"
          aria-label={t({ tr: 'Randevularım', en: 'My bookings' })}
        >
          <Bell className="size-5" />
        </Link>
      </header>
    )
  }

  return (
    <header className="flex items-center justify-between gap-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Link
          href="/"
          className="flex size-11 shrink-0 items-center justify-center rounded-[1.1rem] bg-white text-slate-600 ring-1 ring-slate-900/5 transition hover:text-[#0071E3] active:scale-[0.98]"
          aria-label={t({ tr: 'Ana sayfaya dön', en: 'Back to homepage' })}
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <Link
          href="/client"
          className="group inline-flex min-w-0 items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/35"
          aria-label={patientChromeName(language)}
        >
          <span className="flex size-11 items-center justify-center rounded-[1.1rem] bg-white ring-1 ring-slate-900/5 transition group-active:scale-[0.98]">
            <AsistanLogo lockup="mark" variant="dark" size="sm" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[10px] font-bold uppercase tracking-[0.18em] text-[#0071E3]">
              {patientChromeName(language)}
            </span>
            <span className="block truncate font-heading text-lg font-extrabold tracking-tight text-slate-900">
              {t(screen)}
            </span>
          </span>
        </Link>
      </div>

      <Link
        href="/client/profile"
        className={cn(
          'shrink-0 rounded-full bg-white px-3.5 py-2 text-[11px] font-bold text-slate-600',
          'ring-1 ring-slate-900/5 transition hover:text-[#0071E3]',
          'active:scale-[0.98]',
        )}
      >
        {t({ tr: 'Profil', en: 'Profile' })}
      </Link>
    </header>
  )
}
