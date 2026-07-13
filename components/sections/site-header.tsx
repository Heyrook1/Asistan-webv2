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

const HOME_NAV_COPY = {
  tr: {
    links: [
      { href: '#ecosystem', label: 'Ekosistem' },
      { href: '#for-whom', label: 'Kimler İçin' },
      { href: '#features', label: 'Özellikler' },
      { href: '#pricing', label: 'Fiyatlar' },
      { href: '#trust', label: 'Güven' },
    ],
    joinPatient: ENTRY_CTA.patientBook.short.tr,
    startTrial: ENTRY_CTA.clinicTrial.short.tr,
    startTrialShort: ENTRY_CTA.clinicTrial.short.tr,
    openMenu: 'Gezinme menüsünü aç',
    closeMenu: 'Gezinme menüsünü kapat',
    login: ENTRY_CTA.clinicLogin.tr,
  },
  en: {
    links: [
      { href: '#ecosystem', label: 'Ecosystem' },
      { href: '#for-whom', label: 'For Whom' },
      { href: '#features', label: 'Features' },
      { href: '#pricing', label: 'Pricing' },
      { href: '#trust', label: 'Trust' },
    ],
    joinPatient: ENTRY_CTA.patientBook.short.en,
    startTrial: ENTRY_CTA.clinicTrial.short.en,
    startTrialShort: ENTRY_CTA.clinicTrial.short.en,
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    login: ENTRY_CTA.clinicLogin.en,
  },
} as const

const SITE_NAV_COPY = {
  tr: {
    links: [
      { href: '/urun', label: 'Özellikler' },
      { href: '/cozumler', label: 'Çözümler' },
      { href: '/fiyatlandirma', label: 'Fiyatlandırma' },
      { href: '/guven', label: 'Güven Merkezi' },
      { href: '/kaynaklar', label: 'Kaynaklar' },
      { href: '/contact', label: 'İletişim' },
    ],
    joinPatient: ENTRY_CTA.patientBook.short.tr,
    startTrial: ENTRY_CTA.clinicTrial.short.tr,
    startTrialShort: ENTRY_CTA.clinicTrial.short.tr,
    openMenu: 'Gezinme menüsünü aç',
    closeMenu: 'Gezinme menüsünü kapat',
    login: ENTRY_CTA.clinicLogin.tr,
  },
  en: {
    links: [
      { href: '/urun', label: 'Features' },
      { href: '/cozumler', label: 'Solutions' },
      { href: '/fiyatlandirma', label: 'Pricing' },
      { href: '/guven', label: 'Trust Center' },
      { href: '/kaynaklar', label: 'Resources' },
      { href: '/contact', label: 'Contact' },
    ],
    joinPatient: ENTRY_CTA.patientBook.short.en,
    startTrial: ENTRY_CTA.clinicTrial.short.en,
    startTrialShort: ENTRY_CTA.clinicTrial.short.en,
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    login: ENTRY_CTA.clinicLogin.en,
  },
} as const

type SiteHeaderProps = {
  variant?: 'home' | 'site'
}

export function SiteHeader({ variant = 'home' }: SiteHeaderProps) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { language, setLanguage } = useLanguage()
  const copy = (variant === 'site' ? SITE_NAV_COPY : HOME_NAV_COPY)[language]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [language])

  const loginUrl = getLoginPath(language)
  const registerUrl = getRegisterPath(language)

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        scrolled ? 'pt-3' : 'pt-4',
      )}
    >
      <div className="mx-auto flex w-[min(1200px,92vw)] items-center justify-between rounded-2xl border border-black/8 bg-white/76 px-4 py-2.5 shadow-glass-soft backdrop-blur-xl md:px-6">
        <Link href="/" aria-label="Asistan home" className="inline-flex items-center">
          <AsistanLogo variant="dark" size="md" priority />
        </Link>

        <nav className="hidden items-center gap-5 md:flex" aria-label="Ana menü">
          {copy.links.map((item) =>
            item.href.startsWith('#') ? (
              <a
                key={item.href}
                href={item.href}
                className="tap-target inline-flex items-center text-sm font-medium tracking-[-0.01em] text-[#1D1D1F]/80 transition hover:text-[#1D1D1F]"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="tap-target inline-flex items-center text-sm font-medium tracking-[-0.01em] text-[#1D1D1F]/80 transition hover:text-[#1D1D1F]"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {/* Language Switcher */}
          <div className="inline-flex h-10 items-center rounded-xl border border-black/10 bg-white/75 p-1 text-xs font-semibold backdrop-blur-md">
            <button
              type="button"
              aria-pressed={language === 'tr'}
              aria-label="Türkçe dilini seç"
              className={cn(
                'rounded-lg px-2.5 py-1 transition cursor-pointer',
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
                'rounded-lg px-2.5 py-1 transition cursor-pointer',
                language === 'en' ? 'bg-[#0071E3] text-white' : 'text-[#5F6370] hover:bg-black/5',
              )}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
          </div>

          {/* Auth Actions */}
          <Button
            asChild
            variant="ghost"
            className="h-10 rounded-xl px-3 text-sm font-semibold text-[#5D6068] hover:bg-black/5 hover:text-[#1D1D1F]"
          >
            <Link href={PATIENT_BOOK_PATH}>{copy.joinPatient}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-xl border-black/10 bg-white/75 px-4 text-sm font-semibold text-[#1D1D1F] backdrop-blur-md hover:bg-slate-50"
          >
            <Link href={loginUrl}>{copy.login}</Link>
          </Button>
          <Button asChild className="h-10 rounded-xl bg-[#0071E3] px-4 text-sm font-semibold text-white hover:bg-[#0063C8]">
            <Link href={registerUrl}>{copy.startTrial}</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? copy.closeMenu : copy.openMenu}
          aria-expanded={open}
          className="tap-target inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white/75 md:hidden"
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
            className="mx-auto mt-2 w-[min(1200px,92vw)] rounded-2xl border border-black/8 bg-white/84 p-3 shadow-glass backdrop-blur-xl md:hidden"
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
              {copy.links.map((item) =>
                item.href.startsWith('#') ? (
                  <a
                    key={`mobile-${item.href}`}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="tap-target rounded-xl px-3 py-2.5 text-[15px] font-medium text-[#1D1D1F]/85 hover:bg-black/5"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={`mobile-${item.href}`}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="tap-target rounded-xl px-3 py-2.5 text-[15px] font-medium text-[#1D1D1F]/85 hover:bg-black/5"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-black/8 pt-3">
              <Button
                asChild
                variant="ghost"
                className="h-10 rounded-xl text-sm font-semibold text-[#1D1D1F] hover:bg-black/5"
              >
                <Link href={PATIENT_BOOK_PATH} onClick={() => setOpen(false)}>{copy.joinPatient}</Link>
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-xl border-black/10 bg-white text-sm font-semibold text-[#1D1D1F]"
                >
                  <Link href={loginUrl} onClick={() => setOpen(false)}>{copy.login}</Link>
                </Button>
                <Button asChild className="h-10 rounded-xl bg-[#0071E3] text-sm font-semibold text-white hover:bg-[#0063C8]">
                  <Link href={registerUrl} onClick={() => setOpen(false)}>{copy.startTrialShort}</Link>
                </Button>
              </div>
            </div>
          </FocusTrapPanel>
        )}
      </AnimatePresence>
    </header>
  )
}
