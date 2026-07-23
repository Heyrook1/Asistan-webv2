// Client-side locale (TR-first). No route-based next-intl by design:
// marketing/auth/client use LanguageProvider; clinic dashboard stays TR-only.
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Language = 'tr' | 'en'

interface LanguageContextProps {
  language: Language
  setLanguage: (lang: Language) => void
  t: <T>(translations: { tr: T; en: T }) => T
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

const COOKIE_NAME = 'asistan-lang'
const LOCAL_STORAGE_KEY = 'asistan-lang'

export function LanguageProvider({
  children,
  initialLanguage = 'tr',
}: {
  children: React.ReactNode
  /** From server cookie so SSR matches first client paint. */
  initialLanguage?: Language
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  // Get cookie helper
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null
    const nameEQ = name + '='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  // Set cookie helper
  const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') return
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    const expires = '; expires=' + date.toUTCString()
    document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax'
  }

  useEffect(() => {
    // Prefer cookie (already used for SSR). Only fall back to localStorage if cookie missing.
    const cookieLang = getCookie(COOKIE_NAME)
    if (cookieLang === 'tr' || cookieLang === 'en') {
      setLanguageState(cookieLang)
      return
    }

    const localLang = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (localLang === 'tr' || localLang === 'en') {
      setLanguageState(localLang)
      setCookie(COOKIE_NAME, localLang)
      return
    }

    setLanguageState('tr')
    localStorage.setItem(LOCAL_STORAGE_KEY, 'tr')
    setCookie(COOKIE_NAME, 'tr')
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = language
  }, [language])

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang)
    localStorage.setItem(LOCAL_STORAGE_KEY, newLang)
    setCookie(COOKIE_NAME, newLang)
  }

  const t = <T,>(translations: { tr: T; en: T }): T => {
    return translations[language]
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    // Turbopack HMR can duplicate this module so Provider ≠ consumer context.
    // Prefer TR fallback over crashing the patient shell.
    return {
      language: 'tr' as Language,
      setLanguage: (_lang: Language) => undefined,
      t: <T,>(translations: { tr: T; en: T }): T => translations.tr,
    }
  }
  return context
}
