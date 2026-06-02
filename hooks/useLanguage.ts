// hooks/useLanguage.ts
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLandingLocale } from '@/components/sections/landing-locale'

export type Language = 'tr' | 'en'

export function useLanguage() {
  const pathname = usePathname() || ''
  const router = useRouter()
  const { locale, setLocale } = useLandingLocale()

  // source of truth is URL path on auth routes, otherwise local context state
  const isAuthPage = 
    pathname === '/tr/giris' || 
    pathname === '/en/login' || 
    pathname === '/tr/kayit' || 
    pathname === '/en/register' ||
    pathname.startsWith('/tr/auth/') ||
    pathname.startsWith('/en/auth/')

  const currentLang: Language = isAuthPage
    ? (pathname.startsWith('/en') ? 'en' : 'tr')
    : (locale as Language)

  const changeLanguage = (newLang: Language) => {
    if (newLang === currentLang) return

    // Update global state
    setLocale(newLang)

    // Route mapping for auth pages
    if (isAuthPage) {
      let newPath = pathname
      if (newLang === 'en') {
        if (pathname === '/tr/giris') {
          newPath = '/en/login'
        } else if (pathname === '/tr/kayit') {
          newPath = '/en/register'
        } else if (pathname.startsWith('/tr/auth/')) {
          newPath = pathname.replace(/^\/tr\/auth\//, '/en/auth/')
        }
      } else {
        if (pathname === '/en/login') {
          newPath = '/tr/giris'
        } else if (pathname === '/en/register') {
          newPath = '/tr/kayit'
        } else if (pathname.startsWith('/en/auth/')) {
          newPath = pathname.replace(/^\/en\/auth\//, '/tr/auth/')
        }
      }
      router.push(newPath)
    }
  }

  return {
    language: currentLang,
    setLanguage: changeLanguage,
    t: <T extends Record<Language, any>>(translations: T): T[Language] => {
      return translations[currentLang]
    }
  }
}
