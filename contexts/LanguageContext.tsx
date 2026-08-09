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

/** Singleton context only — never store request language on globalThis (nested providers raced). */
type LangBridge = {
  context: React.Context<LanguageContextProps | undefined>
}

function getLangBridge(): LangBridge {
  const g = globalThis as typeof globalThis & { __asistanLangBridge?: LangBridge }
  if (!g.__asistanLangBridge) {
    g.__asistanLangBridge = {
      context: createContext<LanguageContextProps | undefined>(undefined),
    }
  }
  return g.__asistanLangBridge
}

const COOKIE_NAME = 'asistan-lang'
const LOCAL_STORAGE_KEY = 'asistan-lang'
const LanguageContext = getLangBridge().context

function pickTranslation<T>(translations: { tr: T; en: T }, lang: Language): T {
  return translations[lang] ?? translations.tr
}

export function LanguageProvider({
  children,
  initialLanguage = 'tr',
}: {
  children: React.ReactNode
  /** From server cookie so SSR matches first client paint. */
  initialLanguage?: Language
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)
  // Until mount sync finishes, always expose initialLanguage so hydrate matches SSR.
  const [hydrated, setHydrated] = useState(false)

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

  const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') return
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    const expires = '; expires=' + date.toUTCString()
    document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax'
  }

  useEffect(() => {
    const cookieLang = getCookie(COOKIE_NAME)
    if (cookieLang === 'tr' || cookieLang === 'en') {
      setLanguageState(cookieLang)
      setHydrated(true)
      return
    }

    const localLang = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (localLang === 'tr' || localLang === 'en') {
      setLanguageState(localLang)
      setCookie(COOKIE_NAME, localLang)
      setHydrated(true)
      return
    }

    setLanguageState('tr')
    localStorage.setItem(LOCAL_STORAGE_KEY, 'tr')
    setCookie(COOKIE_NAME, 'tr')
    setHydrated(true)
  }, [])

  const activeLanguage = hydrated ? language : initialLanguage

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = activeLanguage
  }, [activeLanguage])

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang)
    localStorage.setItem(LOCAL_STORAGE_KEY, newLang)
    setCookie(COOKIE_NAME, newLang)
  }

  const t = <T,>(translations: { tr: T; en: T }): T => {
    return pickTranslation(translations, activeLanguage)
  }

  return (
    <LanguageContext.Provider value={{ language: activeLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    // Split-chunk fallback: stable TR (never read mutable global request lang).
    return {
      language: 'tr' as Language,
      setLanguage: (_lang: Language) => undefined,
      t: <T,>(translations: { tr: T; en: T }): T => pickTranslation(translations, 'tr'),
    }
  }
  return context
}
