// components/ui/FloatingCTA.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, LayoutDashboard, Smartphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/hooks/useLanguage'
import { productName } from '@/lib/brand/masterbrand'
import {
  DEMO_CONTACT_PATH,
  ENTRY_CTA,
  PATIENT_BOOK_PATH,
} from '@/lib/entry-routes'

/** Defense in depth if mounted outside marketing shells. */
function isAppShellPath(pathname: string | null) {
  if (!pathname) return false
  if (
    pathname.startsWith('/client') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/book') ||
    pathname.startsWith('/intake') ||
    pathname.startsWith('/randevu') ||
    pathname.startsWith('/api')
  ) {
    return true
  }
  return /^\/(tr|en)\/(giris|kayit|login|register|auth)(\/|$)/.test(pathname)
}

export function FloatingCTA() {
  const pathname = usePathname()
  const { t, language } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [nearJourney, setNearJourney] = useState(false)
  const [atPageEnd, setAtPageEnd] = useState(false)

  const blocked = isAppShellPath(pathname)
  const bookingName = productName('booking', language === 'en' ? 'en' : 'tr')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (blocked) return

    let subscription: { unsubscribe: () => void } | undefined
    try {
      const supabase = createClient()
      void supabase.auth.getSession().then(({ data: { session } }) => {
        setIsLoggedIn(!!session)
      })
      subscription = supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session)
      }).data.subscription
    } catch {
      // Missing/invalid public Supabase env — keep CTA visible without session state.
    }

    const handleScroll = () => {
      const vh = window.innerHeight
      const doc = document.documentElement
      const nearBottom = window.scrollY + vh > doc.scrollHeight - 120
      setAtPageEnd(nearBottom)

      const journey = document.getElementById('uygulama')
      if (journey) {
        const rect = journey.getBoundingClientRect()
        setNearJourney(rect.top < vh * 0.8 && rect.bottom > vh * 0.15)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll()

    return () => {
      subscription?.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [blocked])

  if (blocked || !mounted) return null

  const show = !atPageEnd
  const actionLabel = nearJourney
    ? t({ tr: 'Uygulamayı aç', en: 'Open the app' })
    : t({
        tr: ENTRY_CTA.patientBook.short.tr,
        en: ENTRY_CTA.patientBook.short.en,
      })
  const demoLabel = t({
    tr: ENTRY_CTA.demoRequest.short.tr,
    en: ENTRY_CTA.demoRequest.short.en,
  })
  const dashboardLabel = t({
    tr: 'Klinik paneli',
    en: 'Clinic dashboard',
  })

  return (
    <AnimatePresence>
      {show ? (
        <motion.aside
          key="floating-rezervasyon-cta"
          role="complementary"
          aria-label={bookingName}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          className="pointer-events-auto fixed bottom-5 right-4 z-[90] sm:bottom-6 sm:right-6"
        >
          <div className="flex flex-col items-end gap-2">
            <Link
              href={PATIENT_BOOK_PATH}
              className="group block no-underline"
              aria-label={`${bookingName} — ${actionLabel}`}
            >
              <div className="flex items-center gap-3 rounded-2xl border-2 border-[#0071E3]/30 bg-white p-2 pr-3.5 shadow-[0_12px_40px_rgba(0,113,227,0.35)] ring-1 ring-black/5 transition group-hover:border-[#0071E3] group-hover:shadow-[0_16px_44px_rgba(0,113,227,0.45)] group-active:scale-[0.98]">
                <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#0071E3] text-white">
                  <Smartphone className="size-5" aria-hidden />
                  <span className="absolute bottom-1 right-1 size-2 rounded-full bg-emerald-400 ring-2 ring-white" />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#0071E3]">
                    {bookingName}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-sm font-extrabold text-[#1D1D1F]">
                    {actionLabel}
                    <ArrowRight
                      className="size-3.5 transition group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-0.5 block text-[10px] font-medium text-slate-500">
                    {t({ tr: 'Hasta mobil · PWA', en: 'Patient mobile · PWA' })}
                  </span>
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1.5">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#0B1220] px-3.5 text-xs font-semibold text-white no-underline shadow-lg"
                >
                  <LayoutDashboard className="size-3.5 text-[#0071E3]" aria-hidden />
                  {dashboardLabel}
                </Link>
              ) : (
                <Link
                  href={DEMO_CONTACT_PATH}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#0B1220] px-3.5 text-xs font-semibold text-white no-underline shadow-lg"
                >
                  {demoLabel}
                  <ArrowRight className="size-3.5 opacity-70" aria-hidden />
                </Link>
              )}
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
