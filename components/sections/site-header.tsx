'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, Menu, X } from 'lucide-react'

import { AsistanLogo } from '@/components/asistan-logo'
import { useLanguage } from '@/hooks/useLanguage'
import { getLoginPath, getRegisterPath } from '@/lib/auth-routes'
import { DEMO_CONTACT_PATH, ENTRY_CTA, PATIENT_BOOK_PATH } from '@/lib/entry-routes'
import { Button } from '@/components/ui/button'
import { FocusTrapPanel } from '@/components/a11y/focus-trap-panel'
import { cn } from '@/lib/utils'

type NavChild = {
  href: string
  label: { tr: string; en: string }
}

type NavItem = {
  href: string
  label: { tr: string; en: string }
  /** When set, click opens animated sub-bar instead of navigating immediately. */
  children?: readonly NavChild[]
}

const PRIMARY_NAV: readonly NavItem[] = [
  {
    href: '/urun',
    label: { tr: 'Özellikler', en: 'Features' },
    children: [
      { href: '/#why', label: { tr: 'Neden', en: 'Why' } },
      { href: '/#modules', label: { tr: 'Modüller', en: 'Modules' } },
      { href: '/#roadmap', label: { tr: 'Yol haritası', en: 'Roadmap' } },
      { href: '/#product', label: { tr: 'Ürün ekranları', en: 'Product screens' } },
      { href: '/#security', label: { tr: 'Güvenlik', en: 'Security' } },
      { href: '/#faq', label: { tr: 'SSS', en: 'FAQ' } },
      { href: '/#cta', label: { tr: 'Demo', en: 'Demo' } },
      { href: '/urun', label: { tr: 'Tüm özellikler', en: 'All features' } },
    ],
  },
  {
    href: '/cozumler',
    label: { tr: 'Çözümler', en: 'Solutions' },
    children: [
      { href: '/cozumler/health', label: { tr: 'Sağlık', en: 'Health' } },
      { href: '/cozumler/beauty', label: { tr: 'Güzellik', en: 'Beauty' } },
      { href: '/cozumler/legal', label: { tr: 'Hukuk', en: 'Legal' } },
      { href: '/cozumler/pro', label: { tr: 'Emlak', en: 'Real estate' } },
      { href: '/cozumler', label: { tr: 'Tüm çözümler', en: 'All solutions' } },
    ],
  },
  { href: '/fiyatlandirma', label: { tr: 'Fiyatlandırma', en: 'Pricing' } },
  { href: '/sonuclar', label: { tr: 'Sonuçlar', en: 'Outcomes' } },
  { href: '/guven', label: { tr: 'Güven', en: 'Trust' } },
  { href: '/kaynaklar', label: { tr: 'Kaynaklar', en: 'Resources' } },
  { href: '/hakkimizda', label: { tr: 'Hakkımızda', en: 'About' } },
] as const

const CORE_NAV_HREFS = new Set(['/urun', '/cozumler', '/fiyatlandirma', '/sonuclar', '/guven'])

const HEADER_COPY = {
  tr: {
    joinPatient: ENTRY_CTA.patientBook.short.tr,
    startTrialShort: ENTRY_CTA.clinicTrial.short.tr,
    demo: ENTRY_CTA.demoRequest.short.tr,
    demoFull: ENTRY_CTA.demoRequest.tr,
    openMenu: 'Gezinme menüsünü aç',
    closeMenu: 'Gezinme menüsünü kapat',
    login: ENTRY_CTA.clinicLogin.tr,
    loginShort: 'Giriş',
    more: 'Daha fazla',
    submenu: 'Alt menü',
  },
  en: {
    joinPatient: ENTRY_CTA.patientBook.short.en,
    startTrialShort: ENTRY_CTA.clinicTrial.short.en,
    demo: ENTRY_CTA.demoRequest.short.en,
    demoFull: ENTRY_CTA.demoRequest.en,
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    login: ENTRY_CTA.clinicLogin.en,
    loginShort: 'Sign in',
    more: 'More',
    submenu: 'Submenu',
  },
} as const

type SiteHeaderProps = {
  variant?: 'home' | 'site'
}

export function SiteHeader({ variant: _variant = 'home' }: SiteHeaderProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const reduceMotion = useReducedMotion()
  const submenuId = useId()
  const headerRef = useRef<HTMLElement>(null)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeParent, setActiveParent] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [spacerPx, setSpacerPx] = useState(72)

  const { language, setLanguage } = useLanguage()
  const copy = HEADER_COPY[language]

  const activeItem = PRIMARY_NAV.find((item) => item.href === activeParent)
  const submenuOpen = Boolean(activeItem?.children?.length)

  const coreItems = PRIMARY_NAV.filter((item) => CORE_NAV_HREFS.has(item.href))
  const overflowItems = PRIMARY_NAV.filter((item) => !CORE_NAV_HREFS.has(item.href))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setActiveParent(null)
    setMoreOpen(false)
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const measure = () => setSpacerPx(Math.ceil(el.getBoundingClientRect().height))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [submenuOpen, scrolled, mobileOpen])

  useEffect(() => {
    if (!submenuOpen && !moreOpen) return
    const onPointer = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('[data-site-header]')) return
      setActiveParent(null)
      setMoreOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveParent(null)
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [submenuOpen, moreOpen])

  const loginUrl = getLoginPath(language)
  const registerUrl = getRegisterPath(language)

  const toggleParent = (item: NavItem) => {
    if (!item.children?.length) {
      setActiveParent(null)
      return
    }
    setActiveParent((prev) => (prev === item.href ? null : item.href))
    setMoreOpen(false)
  }

  const renderDesktopItem = (item: NavItem, opts?: { className?: string }) => {
    const hasChildren = Boolean(item.children?.length)
    const isActive = activeParent === item.href
    const baseClass = cn(
      'inline-flex h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2 text-[13px] font-medium leading-none tracking-[-0.01em] transition 2xl:px-2.5 2xl:text-sm',
      isActive
        ? 'bg-[#0071E3]/10 text-[#0071E3]'
        : 'text-[#1D1D1F]/80 hover:bg-black/[0.03] hover:text-[#1D1D1F]',
      opts?.className,
    )

    if (hasChildren) {
      return (
        <button
          key={item.href}
          type="button"
          className={baseClass}
          aria-expanded={isActive}
          aria-controls={submenuId}
          onClick={() => toggleParent(item)}
        >
          {item.label[language]}
          <ChevronDown
            className={cn('size-3.5 opacity-60 transition-transform duration-200', isActive && 'rotate-180')}
            aria-hidden
          />
        </button>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={baseClass}
        onClick={() => setActiveParent(null)}
      >
        {item.label[language]}
      </Link>
    )
  }

  return (
    <>
      <header
        ref={headerRef}
        data-site-header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          scrolled ? 'pt-3' : 'pt-4',
        )}
      >
        <div className="mx-auto flex h-14 w-[min(1180px,calc(100vw-1.25rem))] items-center gap-2 overflow-hidden rounded-2xl border border-black/8 bg-white/76 px-3 shadow-glass-soft backdrop-blur-xl sm:px-4 xl:gap-3 xl:px-5">
          <Link
            href="/"
            aria-label="Asistan home"
            className="inline-flex h-10 shrink-0 items-center -translate-y-0.5"
            onClick={() => setActiveParent(null)}
          >
            <AsistanLogo variant="dark" size="md" priority />
          </Link>

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center xl:flex"
            aria-label="Ana menü"
          >
            <div className="flex max-w-full items-center gap-1 2xl:gap-2">
              {coreItems.map((item) => renderDesktopItem(item))}

              <div className="relative 2xl:hidden" data-header-more>
                <button
                  type="button"
                  aria-expanded={moreOpen}
                  aria-haspopup="menu"
                  className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg px-2 text-[13px] font-medium leading-none text-[#1D1D1F]/80 transition hover:bg-black/[0.03] hover:text-[#1D1D1F]"
                  onClick={() => {
                    setMoreOpen((state) => !state)
                    setActiveParent(null)
                  }}
                >
                  {copy.more}
                </button>
                {moreOpen ? (
                  <div
                    role="menu"
                    className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[12rem] rounded-xl border border-black/8 bg-white/95 p-1.5 shadow-lg backdrop-blur-xl"
                  >
                    {overflowItems.map((item) =>
                      item.children?.length ? (
                        <button
                          key={`more-${item.href}`}
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#1D1D1F]/85 hover:bg-black/5"
                          onClick={() => {
                            setMoreOpen(false)
                            toggleParent(item)
                          }}
                        >
                          {item.label[language]}
                          <ChevronDown className="size-3.5 opacity-50" aria-hidden />
                        </button>
                      ) : (
                        <Link
                          key={`more-${item.href}`}
                          role="menuitem"
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#1D1D1F]/85 hover:bg-black/5"
                        >
                          {item.label[language]}
                        </Link>
                      ),
                    )}
                  </div>
                ) : null}
              </div>

              {overflowItems.map((item) =>
                renderDesktopItem(item, { className: 'hidden 2xl:inline-flex' }),
              )}
            </div>
          </nav>

          <div className="ml-auto hidden shrink-0 items-center gap-1.5 xl:flex 2xl:gap-2">
            <div className="inline-flex h-9 items-center rounded-xl border border-black/10 bg-white/75 p-0.5 text-xs font-semibold backdrop-blur-md">
              <button
                type="button"
                aria-pressed={language === 'tr'}
                aria-label="Türkçe dilini seç"
                className={cn(
                  'inline-flex h-8 cursor-pointer items-center rounded-lg px-2 leading-none transition',
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
                  'inline-flex h-8 cursor-pointer items-center rounded-lg px-2 leading-none transition',
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
            {isHome ? (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="hidden h-9 shrink-0 rounded-xl border-[#0071E3]/25 bg-white/75 px-2.5 text-[13px] font-semibold leading-none text-[#1D1D1F] hover:bg-[#EEF6FF] lg:inline-flex 2xl:px-3 2xl:text-sm"
                >
                  <Link href={registerUrl}>{copy.startTrialShort}</Link>
                </Button>
                <Button
                  asChild
                  className="h-9 shrink-0 rounded-xl bg-[#0071E3] px-3 text-[13px] font-semibold leading-none text-white hover:bg-[#0063C8] 2xl:text-sm"
                >
                  <Link href={DEMO_CONTACT_PATH}>{copy.demo}</Link>
                </Button>
              </>
            ) : (
              <Button
                asChild
                className="h-9 shrink-0 rounded-xl bg-[#0071E3] px-3 text-[13px] font-semibold leading-none text-white hover:bg-[#0063C8] 2xl:text-sm"
              >
                <Link href={registerUrl}>{copy.startTrialShort}</Link>
              </Button>
            )}
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? copy.closeMenu : copy.openMenu}
            aria-expanded={mobileOpen}
            className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white/75 xl:hidden"
            onClick={() => {
              setMobileOpen((state) => !state)
              setActiveParent(null)
            }}
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-[#1D1D1F]" />
            ) : (
              <Menu className="h-5 w-5 text-[#1D1D1F]" />
            )}
          </button>
        </div>

        {/* Animated secondary menu — only when active parent has children */}
        <AnimatePresence initial={false}>
          {submenuOpen && activeItem?.children ? (
            <motion.div
              id={submenuId}
              key={activeItem.href}
              role="navigation"
              aria-label={`${activeItem.label[language]} — ${copy.submenu}`}
              initial={
                reduceMotion
                  ? { opacity: 1, height: 'auto' }
                  : { opacity: 0, height: 0, y: -6 }
              }
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={
                reduceMotion
                  ? { opacity: 0, height: 0 }
                  : { opacity: 0, height: 0, y: -4 }
              }
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-2 w-[min(1180px,calc(100vw-1.25rem))] overflow-hidden"
            >
              <div className="rounded-2xl border border-black/8 bg-white/92 shadow-glass-soft backdrop-blur-xl">
                <ul className="flex gap-1 overflow-x-auto px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-3">
                  {activeItem.children.map((child) => (
                    <li key={child.href} className="shrink-0">
                      <Link
                        href={child.href}
                        onClick={() => setActiveParent(null)}
                        className="inline-flex min-h-10 items-center rounded-xl px-3 text-[13px] font-semibold text-[#5D6068] transition hover:bg-[#EEF6FF] hover:text-[#0071E3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/35"
                      >
                        {child.label[language]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {mobileOpen && (
            <FocusTrapPanel
              role="dialog"
              label="Mobil menü"
              onEscape={() => setMobileOpen(false)}
              className="mx-auto mt-2 w-[min(1180px,calc(100vw-1.25rem))] rounded-2xl border border-black/8 bg-white/84 p-3 shadow-glass backdrop-blur-xl xl:hidden"
            >
              <div className="mb-2 inline-flex h-10 items-center rounded-xl border border-black/10 bg-white/75 p-1 text-xs font-semibold">
                <button
                  type="button"
                  aria-pressed={language === 'tr'}
                  className={cn(
                    'cursor-pointer rounded-lg px-2.5 py-1 transition',
                    language === 'tr' ? 'bg-[#0071E3] text-white' : 'text-[#5F6370] hover:bg-black/5',
                  )}
                  onClick={() => {
                    setLanguage('tr')
                    setMobileOpen(false)
                  }}
                >
                  TR
                </button>
                <button
                  type="button"
                  aria-pressed={language === 'en'}
                  className={cn(
                    'cursor-pointer rounded-lg px-2.5 py-1 transition',
                    language === 'en' ? 'bg-[#0071E3] text-white' : 'text-[#5F6370] hover:bg-black/5',
                  )}
                  onClick={() => {
                    setLanguage('en')
                    setMobileOpen(false)
                  }}
                >
                  EN
                </button>
              </div>

              <div className="grid gap-1">
                {PRIMARY_NAV.map((item) => {
                  const expanded = mobileExpanded === item.href
                  if (item.children?.length) {
                    return (
                      <div key={`m-${item.href}`} className="rounded-xl">
                        <button
                          type="button"
                          aria-expanded={expanded}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[15px] font-medium text-[#1D1D1F]/85 hover:bg-black/5"
                          onClick={() =>
                            setMobileExpanded((prev) => (prev === item.href ? null : item.href))
                          }
                        >
                          {item.label[language]}
                          <ChevronDown
                            className={cn(
                              'size-4 opacity-50 transition-transform',
                              expanded && 'rotate-180',
                            )}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {expanded ? (
                            <motion.ul
                              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden pl-2"
                            >
                              {item.children.map((child) => (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block rounded-lg px-3 py-2 text-sm font-medium text-[#5D6068] hover:bg-[#EEF6FF] hover:text-[#0071E3]"
                                  >
                                    {child.label[language]}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    )
                  }
                  return (
                    <Link
                      key={`m-${item.href}`}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="tap-target rounded-xl px-3 py-2.5 text-[15px] font-medium text-[#1D1D1F]/85 hover:bg-black/5"
                    >
                      {item.label[language]}
                    </Link>
                  )
                })}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 border-t border-black/8 pt-3">
                <Button asChild variant="ghost" className="h-10 rounded-xl text-sm font-semibold">
                  <Link href={PATIENT_BOOK_PATH} onClick={() => setMobileOpen(false)}>
                    {copy.joinPatient}
                  </Link>
                </Button>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button asChild variant="outline" className="h-10 rounded-xl text-sm font-semibold">
                    <Link href={loginUrl} onClick={() => setMobileOpen(false)}>
                      {copy.login}
                    </Link>
                  </Button>
                  {isHome ? (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        className="h-10 rounded-xl border-[#0071E3]/25 text-sm font-semibold"
                      >
                        <Link href={registerUrl} onClick={() => setMobileOpen(false)}>
                          {copy.startTrialShort}
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="h-10 rounded-xl bg-[#0071E3] text-sm font-semibold text-white sm:col-span-2"
                      >
                        <Link href={DEMO_CONTACT_PATH} onClick={() => setMobileOpen(false)}>
                          {copy.demoFull}
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button
                      asChild
                      className="h-10 rounded-xl bg-[#0071E3] text-sm font-semibold text-white"
                    >
                      <Link href={registerUrl} onClick={() => setMobileOpen(false)}>
                        {copy.startTrialShort}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </FocusTrapPanel>
          )}
        </AnimatePresence>
      </header>

      {/* Pushes hero/content down as submenu opens */}
      <div
        aria-hidden
        className="transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ height: spacerPx }}
      />
    </>
  )
}
