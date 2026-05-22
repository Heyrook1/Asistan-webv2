'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'

import { AsistanIcon } from '@/components/asistan-logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/urun', label: 'Ürün' },
  { href: '/cozumler', label: 'Çözümler' },
  { href: '/fiyatlandirma', label: 'Fiyatlandırma' },
  { href: '/kaynaklar', label: 'Kaynaklar' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
]

const solutionItems = [
  { href: '/cozumler/health', label: 'Asistan Health', status: 'Aktif' },
  { href: '/cozumler', label: 'Beauty', status: 'Yakında' },
  { href: '/cozumler', label: 'Hukuk', status: 'Yakında' },
  { href: '/cozumler', label: 'Emlak', status: 'Yakında' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const solutionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!solutionsRef.current?.contains(event.target as Node)) setSolutionsOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSolutionsOpen(false)
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <nav
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-slate-100 bg-white/90 shadow-sm backdrop-blur-xl' : 'bg-white/95 backdrop-blur-md',
      )}
      aria-label="Ana menü"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Asistan ana sayfa">
            <AsistanIcon size={34} priority />
            <span className="text-lg font-bold tracking-tight text-brand-navy">Asistan</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              const isSolutions = item.href === '/cozumler'

              if (isSolutions) {
                return (
                  <div key={item.href} ref={solutionsRef} className="relative" onMouseEnter={() => setSolutionsOpen(true)}>
                    <button
                      type="button"
                      className={cn(
                        'relative flex min-h-11 items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                        active ? 'text-brand-teal-dark' : 'text-slate-600 hover:text-brand-navy',
                      )}
                      aria-haspopup="menu"
                      aria-expanded={solutionsOpen}
                      onClick={() => setSolutionsOpen((open) => !open)}
                    >
                      {item.label}
                      <ChevronDown className={cn('size-4 transition-transform', solutionsOpen && 'rotate-180')} aria-hidden="true" />
                      {active && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-brand-teal" />}
                    </button>
                    {solutionsOpen && (
                      <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                        <Link
                          href="/cozumler"
                          className="mb-1 block rounded-xl px-3 py-2 text-xs font-semibold uppercase text-slate-400 hover:bg-slate-50"
                          onClick={() => setSolutionsOpen(false)}
                        >
                          Tüm çözümler
                        </Link>
                        {solutionItems.map((solution) => (
                          <Link
                            key={`${solution.label}-${solution.status}`}
                            href={solution.href}
                            className="flex min-h-11 items-center justify-between rounded-xl px-3 py-2 text-sm text-brand-navy hover:bg-slate-50"
                            onClick={() => setSolutionsOpen(false)}
                          >
                            <span>{solution.label}</span>
                            <span className="rounded-full bg-brand-teal/10 px-2 py-0.5 text-[10px] font-semibold text-brand-teal-dark">
                              {solution.status}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex min-h-11 items-center px-4 py-2 text-sm font-medium transition-colors',
                    active ? 'text-brand-teal-dark' : 'text-slate-600 hover:text-brand-navy',
                  )}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-brand-teal" />}
                </Link>
              )
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button asChild variant="ghost" className="font-medium text-slate-600 hover:text-brand-navy">
              <Link href="/auth/login">Giriş yap</Link>
            </Button>
            <Button asChild className="rounded-full bg-gradient-to-r from-brand-teal to-brand-blue px-6 font-semibold text-white shadow-lg shadow-brand-blue/20">
              <Link href="/auth/sign-up">Erken erişim</Link>
            </Button>
          </div>

          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-xl md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-6 text-brand-navy" aria-hidden="true" /> : <Menu className="size-6 text-brand-navy" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex min-h-11 items-center justify-between rounded-xl px-4 py-3',
                    active ? 'bg-brand-teal/10 text-brand-teal-dark' : 'text-slate-600',
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="mt-2 border-t border-slate-100 pt-4">
              <p className="mb-2 px-4 text-xs font-semibold uppercase text-slate-400">Çözümler</p>
              {solutionItems.map((solution) => (
                <Link
                  key={`${solution.label}-mobile`}
                  href={solution.href}
                  className="flex min-h-11 items-center justify-between rounded-xl px-4 py-2 text-sm text-slate-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{solution.label}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">{solution.status}</span>
                </Link>
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-4">
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  Giriş yap
                </Link>
              </Button>
              <Button asChild className="w-full rounded-full bg-gradient-to-r from-brand-teal to-brand-blue text-white">
                <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  Erken erişim
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
