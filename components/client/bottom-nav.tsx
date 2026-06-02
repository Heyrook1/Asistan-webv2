'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Home, Search, User } from 'lucide-react'

import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/client', label: 'Home', icon: Home },
  { href: '/client/clinics', label: 'Clinics', icon: Search },
  { href: '/client/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/client/profile', label: 'Profile', icon: User },
] as const

export function ClientBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      {/* Frosted glass background with top shadow */}
      <div className="border-t border-border/40 bg-white/80 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-md items-center justify-around gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2">
          {NAV_ITEMS.map((item) => {
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
                {/* Active indicator gradient bar */}
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
