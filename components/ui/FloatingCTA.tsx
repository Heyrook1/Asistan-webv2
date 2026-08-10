// components/ui/FloatingCTA.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/hooks/useLanguage'
import { productName } from '@/lib/brand/masterbrand'
import { DEMO_CONTACT_PATH, ENTRY_CTA } from '@/lib/entry-routes'

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

type FloatingCTAProps = {
  /** B2B landing: demo-only chip — no patient PWA dual CTA competing with hero. */
  variant?: 'default' | 'b2b'
}

export function FloatingCTA({ variant = 'default' }: FloatingCTAProps) {
  const pathname = usePathname()
  const { t, language } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [atPageEnd, setAtPageEnd] = useState(false)

  const blocked = isAppShellPath(pathname)
  const brandName =
    variant === 'b2b'
      ? productName('health', language === 'en' ? 'en' : 'tr')
      : productName('booking', language === 'en' ? 'en' : 'tr')

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
          key="floating-b2b-cta"
          role="complementary"
          aria-label={brandName}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          className="pointer-events-auto fixed bottom-5 right-4 z-[90] sm:bottom-6 sm:right-6"
        >
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#0B1220] px-4 text-sm font-semibold text-white no-underline shadow-lg"
            >
              <LayoutDashboard className="size-3.5 text-[#0071E3]" aria-hidden />
              {dashboardLabel}
            </Link>
          ) : (
            <Link
              href={DEMO_CONTACT_PATH}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#0071E3] px-4 text-sm font-bold text-white no-underline shadow-[0_12px_28px_rgba(0,113,227,0.35)]"
            >
              {demoLabel}
              <ArrowRight className="size-3.5 opacity-90" aria-hidden />
            </Link>
          )}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
