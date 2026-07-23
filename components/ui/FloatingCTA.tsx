// components/ui/FloatingCTA.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, LayoutDashboard, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/hooks/useLanguage'
import { getLoginPath } from '@/lib/auth-routes'
import { ENTRY_CTA, getClinicTrialPath } from '@/lib/entry-routes'

/** Defense in depth if mounted outside marketing shells. */
function isAppShellPath(pathname: string | null) {
  if (!pathname) return true
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const blocked = isAppShellPath(pathname)

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
      setIsVisible(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      subscription?.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [blocked])

  if (blocked) return null

  const trialLabel = t({
    tr: ENTRY_CTA.clinicTrial.short.tr,
    en: ENTRY_CTA.clinicTrial.short.en,
  })
  const loginLabel = t({
    tr: ENTRY_CTA.clinicLogin.tr,
    en: ENTRY_CTA.clinicLogin.en,
  })
  const dashboardLabel = t({
    tr: 'Klinik paneli',
    en: 'Clinic dashboard',
  })

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 pointer-events-auto"
        >
          {isLoggedIn ? (
            <Link href="/dashboard" className="no-underline">
              <div className="flex h-12 items-center gap-2 rounded-full border border-white/20 bg-brand-navy/90 px-5 text-sm font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-brand-navy hover:scale-105 active:scale-95 md:h-14 md:px-6 md:text-base">
                <LayoutDashboard className="size-4 text-brand-blue md:size-5" />
                <span>{dashboardLabel}</span>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-brand-navy/90 p-1.5 shadow-xl backdrop-blur-md">
              <Link
                href={getClinicTrialPath(language)}
                className="flex min-h-11 items-center gap-1.5 rounded-full bg-brand-blue px-4 text-sm font-semibold text-white no-underline transition hover:bg-brand-blue/90 active:scale-95 md:px-5 md:text-base"
              >
                <span>{trialLabel}</span>
                <ArrowRight className="size-4 shrink-0" />
              </Link>
              <Link
                href={getLoginPath(language)}
                className="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-white/85 no-underline transition hover:bg-white/10 hover:text-white active:scale-95 md:px-4"
              >
                <LogIn className="size-4 shrink-0 text-white/80" aria-hidden />
                <span>{loginLabel}</span>
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
