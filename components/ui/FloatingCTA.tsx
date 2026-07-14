// components/ui/FloatingCTA.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/hooks/useLanguage'
import { getLoginPath } from '@/lib/auth-routes'
import { ENTRY_CTA } from '@/lib/entry-routes'

/** Defense in depth if mounted outside marketing shells. */
function isAppShellPath(pathname: string | null) {
  if (!pathname) return true
  if (
    pathname.startsWith('/client') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/auth') ||
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
  const supabase = createClient()

  const blocked = isAppShellPath(pathname)

  useEffect(() => {
    if (blocked) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    const handleScroll = () => {
      setIsVisible(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [blocked, supabase.auth])

  if (blocked) return null

  const text = t({
    tr: isLoggedIn ? 'Klinik paneli' : ENTRY_CTA.clinicLogin.tr,
    en: isLoggedIn ? 'Clinic dashboard' : ENTRY_CTA.clinicLogin.en,
  })

  const href = isLoggedIn ? '/dashboard' : getLoginPath(language)

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
          <Link href={href} className="no-underline">
            <div className="flex h-12 items-center gap-2 rounded-full border border-white/20 bg-brand-navy/90 px-5 text-sm font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-brand-navy hover:scale-105 active:scale-95 md:h-14 md:px-6 md:text-base">
              {isLoggedIn ? (
                <LayoutDashboard className="size-4 md:size-5 text-brand-cyan" />
              ) : (
                <LogIn className="size-4 md:size-5 text-brand-cyan" />
              )}
              <span>{text}</span>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
