'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Globe, Menu, X } from 'lucide-react'

import { AsistanLogo } from '@/components/asistan-logo'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/useLanguage'
import { getLoginPath, getRegisterPath } from '@/lib/auth-routes'
import { ENTRY_CTA } from '@/lib/entry-routes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FocusTrapPanel } from '@/components/a11y/focus-trap-panel'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  hasMenu?: boolean
}

const navItems: NavItem[] = [
  { href: '/cozumler', label: 'Cozumler', hasMenu: true },
  { href: '/urun', label: 'Ozellikler' },
  { href: '/urun#nasil-calisir', label: 'Nasil Calisir?' },
  { href: '/fiyatlandirma', label: 'Fiyatlandirma' },
  { href: '/fiyatlandirma#sss', label: 'SSS' },
]

const solutionItems = [
  { href: '/cozumler/health', label: 'Klinik Sahipleri', status: 'Aktif' },
  { href: '/cozumler/beauty', label: 'Doktorlar', status: 'Yakinda' },
  { href: '/cozumler/legal', label: 'Sekreterler', status: 'Yakinda' },
  { href: '/cozumler/pro', label: 'Tum Cozumler', status: 'Plan' },
]

const languageItems = [
  { code: 'TR', label: 'Turkce' },
  { code: 'EN', label: 'English' },
]

function baseHref(path: string) {
  return path.split('#')[0] ?? path
}

export function Navbar() {
  const pathname = usePathname()
  const { language: currentLanguage } = useLanguage()
  const loginPath = getLoginPath(currentLanguage)
  const registerPath = getRegisterPath(currentLanguage)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const solutionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!solutionsRef.current?.contains(event.target as Node)) {
        setSolutionsOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSolutionsOpen(false)
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <nav
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-all duration-[var(--motion-interaction-duration)] ease-[var(--motion-interaction-ease)]',
        scrolled
          ? 'border-brand-blue/15 bg-white/96 shadow-[0_10px_30px_rgba(12,29,54,0.08)] backdrop-blur-xl'
          : 'border-transparent bg-white/90 backdrop-blur-md'
      )}
      aria-label="Ana menu"
    >
      <div className="marketing-container">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Asistan ana sayfa">
            <AsistanLogo variant="dark" size="md" priority />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = pathname === baseHref(item.href) || pathname.startsWith(`${baseHref(item.href)}/`)

              if (item.hasMenu) {
                return (
                  <div
                    key={item.href}
                    ref={solutionsRef}
                    className="relative"
                    onMouseEnter={() => setSolutionsOpen(true)}
                    onMouseLeave={() => setSolutionsOpen(false)}
                  >
                    <button
                      id="solutions-menu-button"
                      type="button"
                      className={cn(
                        'relative flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                        active ? 'text-brand-teal-dark' : 'text-slate-600 hover:text-brand-navy'
                      )}
                      aria-haspopup="menu"
                      aria-expanded={solutionsOpen}
                      onClick={() => setSolutionsOpen((open) => !open)}
                    >
                      {item.label}
                      <ChevronDown className={cn('size-4 transition-transform', solutionsOpen && 'rotate-180')} aria-hidden="true" />
                      {active && <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-brand-teal" />}
                    </button>
                    {solutionsOpen && (
                      <div
                        role="menu"
                        aria-labelledby="solutions-menu-button"
                        className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-brand-blue/15 bg-white p-2 shadow-xl"
                      >
                        {solutionItems.map((solution) => (
                          <Link
                            key={`${solution.label}-${solution.status}`}
                            href={solution.href}
                            role="menuitem"
                            className="flex min-h-11 items-center justify-between rounded-lg px-3 py-2 text-sm text-brand-navy hover:bg-brand-light"
                            onClick={() => setSolutionsOpen(false)}
                          >
                            <span>{solution.label}</span>
                            <span className="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2 py-0.5 text-[10px] font-semibold text-brand-blue">
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
                    'relative flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                    active ? 'text-brand-teal-dark' : 'text-slate-600 hover:text-brand-navy'
                  )}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-brand-teal" />}
                </Link>
              )
            })}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-brand-blue/15 px-3 text-xs font-semibold text-slate-600 hover:bg-brand-light"
                aria-label="Dil seçimi"
              >
                <Globe className="size-3.5" aria-hidden="true" />
                TR
                <ChevronDown className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 rounded-xl">
                {languageItems.map((language) => (
                  <DropdownMenuItem key={language.code} className="cursor-pointer">
                    {language.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild variant="ghost" className="h-10 px-3 text-sm font-semibold text-slate-600 hover:text-brand-navy">
              <Link href={loginPath}>{ENTRY_CTA.clinicLogin.tr}</Link>
            </Button>
            <Button asChild className="h-10 rounded-lg bg-brand-blue px-4 text-sm font-semibold text-white hover:bg-brand-blue/90">
              <Link href={registerPath}>{ENTRY_CTA.clinicTrial.short.tr}</Link>
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-brand-blue/15 text-brand-navy lg:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Menuyu kapat' : 'Menuyu ac'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <FocusTrapPanel
          role="dialog"
          label="Mobil menü"
          onEscape={() => setMobileMenuOpen(false)}
          className="border-t border-brand-blue/10 bg-white py-3 lg:hidden"
        >
          <div className="marketing-container flex flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname === baseHref(item.href) || pathname.startsWith(`${baseHref(item.href)}/`)
              return (
                <Link
                  key={`mobile-${item.href}`}
                  href={item.href}
                  className={cn(
                    'flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold',
                    active ? 'bg-brand-blue/10 text-brand-teal-dark' : 'text-slate-700 hover:bg-brand-light'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="mt-2 flex items-center justify-between rounded-lg border border-brand-blue/10 px-3 py-2 text-xs">
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Globe className="size-3.5" />
                Dil
              </span>
              <div className="inline-flex overflow-hidden rounded-lg border border-brand-blue/15">
                {languageItems.map((languageItem) => (
                  <button
                    key={languageItem.code}
                    type="button"
                    aria-pressed={currentLanguage === languageItem.code.toLowerCase()}
                    aria-label={`${languageItem.label} dilini seç`}
                    className={cn(
                      'min-h-8 px-2.5 font-semibold',
                      languageItem.code === 'TR' ? 'bg-brand-blue text-white' : 'bg-white text-slate-600'
                    )}
                  >
                    {languageItem.code}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-brand-blue/10 pt-3">
              <Button asChild variant="outline" className="h-10 rounded-lg border-brand-blue/20">
                <Link href={loginPath} onClick={() => setMobileMenuOpen(false)}>
                  {ENTRY_CTA.clinicLogin.tr}
                </Link>
              </Button>
              <Button asChild className="h-10 rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90">
                <Link href={registerPath} onClick={() => setMobileMenuOpen(false)}>
                  {ENTRY_CTA.clinicTrial.short.tr}
                </Link>
              </Button>
            </div>
          </div>
        </FocusTrapPanel>
      )}
    </nav>
  )
}
