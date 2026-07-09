// components/ui/FloatingCTA.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, LayoutDashboard, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/hooks/useLanguage'
import { getLoginPath } from '@/lib/auth-routes'

export function FloatingCTA() {
  const { t, language } = useLanguage()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    // Show/hide on scroll
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // initial check

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [supabase.auth])

  const text = t({
    tr: isLoggedIn ? 'Klinik Paneli' : 'Giriş Yap / Kaydol',
    en: isLoggedIn ? 'Dashboard' : 'Login / Sign Up',
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
