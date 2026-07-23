'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

import { AsistanLogo } from '@/components/asistan-logo'
import { useLanguage } from '@/hooks/useLanguage'
import { getLoginPath, getRegisterPath } from '@/lib/auth-routes'
import { ENTRY_CTA, PATIENT_BOOK_PATH } from '@/lib/entry-routes'
import { Button } from '@/components/ui/button'
import { FocusTrapPanel } from '@/components/a11y/focus-trap-panel'
import { cn } from '@/lib/utils'

/** Canonical primary IA — same on home and inner marketing pages (no #anchor-only nav). */
const PRIMARY_NAV = [
  { href: '/urun', label: { tr: 'Özellikler', en: 'Features' } },
  { href: '/cozumler', label: { tr: 'Çözümler', en: 'Solutions' } },
  { href: '/fiyatlandirma', label: { tr: 'Fiyatlandırma', en: 'Pricing' } },
  { href: '/sonuclar', label: { tr: 'Sonuçlar', en: 'Outcomes' } },
  // Medikal turizm (/visit-cyprus) — pasif: menüde yok; sayfa canlı kalır
  { href: '/guven', label: { tr: 'Güven', en: 'Trust' } },
  { href: '/kaynaklar', label: { tr: 'Kaynaklar', en: 'Resources' } },
  { href: '/hakkimizda', label: { tr: 'Hakkımızda', en: 'About' } },
] as const

/** Core links always visible in the xl bar; rest move to overflow until 2xl. */
const CORE_NAV_HREFS = new Set(['/urun', '/cozumler', '/fiyatlandirma', '/sonuclar', '/guven'])

const HEADER_COPY = {
  tr: {
    joinPatient: ENTRY_CTA.patientBook.short.tr,
    startTrial: ENTRY_CTA.clinicTrial.short.tr,
    startTrialShort: ENTRY_CTA.clinicTrial.short.tr,
    openMenu: 'Gezinme menüsünü aç',
    closeMenu: 'Gezinme menüsünü kapat',
    login: ENTRY_CTA.clinicLogin.tr,
    loginShort: 'Giriş',
    more: 'Daha fazla',
  },
  en: {
    joinPatient: ENTRY_CTA.patientBook.short.en,
    startTrial: ENTRY_CTA.clinicTrial.short.en,
    startTrialShort: ENTRY_CTA.clinicTrial.short.en,
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    login: ENTRY_CTA.clinicLogin.en,
    loginShort: 'Sign in',
    more: 'More',
  },
} as const

type SiteHeaderProps = {
  /** Kept for callers; primary nav is identical on home and site. */
  variant?: 'home' | 'site'
}

export function SiteHeader({ variant: _variant = 'home' }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { language, setLanguage } = useLanguage()
  const copy = HEADER_COPY[language]
  const navLinks = PRIMARY_NAV.map((item) => ({
    href: item.href,
    label: item.label[language],
  }))
  const coreLinks = navLinks.filter((item) => CORE_NAV_HREFS.has(item.href))
  const overflowLinks = navLinks.filter((item) => !CORE_NAV_HREFS.has(item.href))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [language])

  useEffect(() => {
    if (!moreOpen) return
    const onPointer = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('[data-header-more]')) return
      setMoreOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [moreOpen])

  const loginUrl = getLoginPath(language)
  const registerUrl = getRegisterPath(language)

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        scrolled ? 'pt-3' : 'pt-4',
      )}
    >
      {/*
        Breakpoint ladder (no clip outside the pill):
        - < xl: logo + hamburger
        - xl: core nav + “Daha fazla” + lang + login + trial
        - 2xl: full nav + patient CTA
      */}
      <div className="mx-auto flex h-14 w-[min(1180px,calc(100vw-1.25rem))] items-center gap-2 overflow-hidden rounded-2xl border border-black/8 bg-white/76 px-3 shadow-glass-soft backdrop-blur-xl sm:px-4 xl:gap-3 xl:px-5">
        <Link
          href="/"
          aria-label="Asistan home"
          className="inline-flex h-10 shrink-0 items-center -translate-y-0.5"
        >
          <AsistanLogo variant="dark" size="md" priority className="w-auto" />
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center xl:flex"
          aria-label="Ana menü"
        >
          <div className="flex max-w-full items-center gap-1 2xl:gap-2">
            {coreLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg px-2 text-[13px] font-medium leading-none tracking-[-0.01em] text-[#1D1D1F]/80 transition hover:bg-black/[0.03] hover:text-[#1D1D1F] 2xl:px-2.5 2xl:text-sm"
              >
                {item.label}
              </Link>
            ))}

            {/* Overflow nav — visible only until 2xl where full list expands */}
            <div className="relative 2xl:hidden" data-header-more>
              <button
                type="button"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg px-2 text-[13px] font-medium leading-none text-[#1D1D1F]/80 transition hover:bg-black/[0.03] hover:text-[#1D1D1F]"
                onClick={() => setMoreOpen((state) => !state)}
              >
                {copy.more}
              </button>
              {moreOpen ? (
                <div
                  role="menu"
                  className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[11rem] rounded-xl border border-black/8 bg-white/95 p-1.5 shadow-lg backdrop-blur-xl"
                >
                  {overflowLinks.map((item) => (
                    <Link
                      key={`more-${item.href}`}
                      role="menuitem"
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#1D1D1F]/85 hover:bg-black/5"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            {overflowLinks.map((item) => (
              <Link
                key={`wide-${item.href}`}
                href={item.href}
                className="hidden h-10 shrink-0 items-center whitespace-nowrap rounded-lg px-2.5 text-sm font-medium leading-none tracking-[-0.01em] text-[#1D1D1F]/80 transition hover:bg-black/[0.03] hover:text-[#1D1D1F] 2xl:inline-flex"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-1.5 xl:flex 2xl:gap-2">
          <div className="inline-flex h-9 items-center rounded-xl border border-black/10 bg-white/75 p-0.5 text-xs font-semibold backdrop-blur-md">
            <button
              type="button"
              aria-pressed={language === 'tr'}
              aria-label="Türkçe dilini seç"
              className={cn(
                'inline-flex h-8 items-center rounded-lg px-2 leading-none transition cursor-pointer',
                language === 'tr' ? 'bg-[#0071E3] text-white' : 'text-[#5F6370] hover:bg-black/5',
              )}
              onClick={() => setLanguage('tr')}
            >
              TR
            </button>
            <button
              type="button"
              aria-pressed={language === 'en'}
              aria-label="İngilizce dilini seç"
              className={cn(
                'inline-flex h-8 items-center rounded-lg px-2 leading-none transition cursor-pointer',
                language === 'en' ? 'bg-[#0071E3] text-white' : 'text-[#5F6370] hover:bg-black/5',
              )}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
          </div>

          <Button
            asChild
            variant="ghost"
            className="hidden h-9 rounded-xl px-2.5 text-[13px] font-semibold leading-none text-[#5D6068] hover:bg-black/5 hover:text-[#1D1D1F] 2xl:inline-flex"
          >
            <Link href={PATIENT_BOOK_PATH}>{copy.joinPatient}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-9 shrink-0 rounded-xl border-black/10 bg-white/75 px-2.5 text-[13px] font-semibold leading-none text-[#1D1D1F] backdrop-blur-md hover:bg-slate-50 2xl:px-3 2xl:text-sm"
          >
            <Link href={loginUrl}>
              <span className="2xl:hidden">{copy.loginShort}</span>
              <span className="hidden 2xl:inline">{copy.login}</span>
            </Link>
          </Button>
          <Button
            asChild
            className="h-9 shrink-0 rounded-xl bg-[#0071E3] px-3 text-[13px] font-semibold leading-none text-white hover:bg-[#0063C8] 2xl:text-sm"
          >
            <Link href={registerUrl}>{copy.startTrialShort}</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? copy.closeMenu : copy.openMenu}
          aria-expanded={open}
          className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white/75 xl:hidden"
          onClick={() => setOpen((state) => !state)}
        >
          {open ? <X className="h-5 w-5 text-[#1D1D1F]" /> : <Menu className="h-5 w-5 text-[#1D1D1F]" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <FocusTrapPanel
            role="dialog"
            label="Mobil menü"
            onEscape={() => setOpen(false)}
            className="mx-auto mt-2 w-[min(1180px,calc(100vw-1.25rem))] rounded-2xl border border-black/8 bg-white/84 p-3 shadow-glass backdrop-blur-xl xl:hidden"
          >
            <div className="mb-2 inline-flex h-10 items-center rounded-xl border border-black/10 bg-white/75 p-1 text-xs font-semibold">
              <button
                type="button"
                aria-pressed={language === 'tr'}
                aria-label="Türkçe dilini seç"
                className={cn(
                  'rounded-lg px-2.5 py-1 transition cursor-pointer',
                  language === 'tr' ? 'bg-[#0071E3] text-white' : 'text-[#5F6370] hover:bg-black/5',
                )}
                onClick={() => {
                  setLanguage('tr')
                  setOpen(false)
                }}
              >
                TR
              </button>
              <button
                type="button"
                aria-pressed={language === 'en'}
                aria-label="İngilizce dilini seç"
                className={cn(
                  'rounded-lg px-2.5 py-1 transition cursor-pointer',
                  language === 'en' ? 'bg-[#0071E3] text-white' : 'text-[#5F6370] hover:bg-black/5',
                )}
                onClick={() => {
                  setLanguage('en')
                  setOpen(false)
                }}
              >
                EN
              </button>
            </div>
            <div className="grid gap-1">
              {navLinks.map((item) => (
                <Link
                  key={`mobile-${item.href}`}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="tap-target rounded-xl px-3 py-2.5 text-[15px] font-medium text-[#1D1D1F]/85 hover:bg-black/5"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-black/8 pt-3">
              <Button
                asChild
                variant="ghost"
                className="h-10 rounded-xl text-sm font-semibold text-[#1D1D1F] hover:bg-black/5"
              >
                <Link href={PATIENT_BOOK_PATH} onClick={() => setOpen(false)}>
                  {copy.joinPatient}
                </Link>
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-xl border-black/10 bg-white text-sm font-semibold text-[#1D1D1F]"
                >
                  <Link href={loginUrl} onClick={() => setOpen(false)}>
                    {copy.login}
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-10 rounded-xl bg-[#0071E3] text-sm font-semibold text-white hover:bg-[#0063C8]"
                >
                  <Link href={registerUrl} onClick={() => setOpen(false)}>
                    {copy.startTrialShort}
                  </Link>
                </Button>
              </div>
            </div>
          </FocusTrapPanel>
        )}
      </AnimatePresence>
    </header>
  )
}
