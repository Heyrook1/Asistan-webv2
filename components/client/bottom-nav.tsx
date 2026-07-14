'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Home, Search, User } from 'lucide-react'

import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

export function ClientBottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    { href: '/client', label: t({ tr: 'Ana sayfa', en: 'Home' }), icon: Home },
    { href: '/client/clinics', label: t({ tr: 'Klinikler', en: 'Clinics' }), icon: Search },
    { href: '/client/bookings', label: t({ tr: 'Randevular', en: 'Bookings' }), icon: CalendarDays },
    { href: '/client/profile', label: t({ tr: 'Profil', en: 'Profile' }), icon: User },
  ] as const

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden" aria-label={t({ tr: 'Hasta menüsü', en: 'Patient menu' })}>
      <div className="border-t border-border/40 bg-white/80 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-md items-center justify-around gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2">
          {navItems.map((item) => {
            const active =
              item.href === '/client'
                ? pathname === '/client'
                : pathname.startsWith(item.href)

            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'tap-target relative flex w-full flex-col items-center justify-center gap-1',
                  'rounded-2xl py-2 text-[11px] font-medium transition-all duration-200',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    active && 'scale-110',
                  )}
                />
                <span className={cn('transition-colors', active && 'font-bold')}>
                  {item.label}
                </span>
                {active && (
                  <span className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-gradient-to-r from-primary to-accent-pop" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
