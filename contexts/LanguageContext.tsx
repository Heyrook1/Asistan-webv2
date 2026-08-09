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

type LangBridge = {
  context: React.Context<LanguageContextProps | undefined>
  /** Last SSR/client Provider initialLanguage — used if context instance splits. */
  initialLanguage: Language
  language: Language
}

function getLangBridge(): LangBridge {
  const g = globalThis as typeof globalThis & { __asistanLangBridge?: LangBridge }
  if (!g.__asistanLangBridge) {
    g.__asistanLangBridge = {
      context: createContext<LanguageContextProps | undefined>(undefined),
      initialLanguage: 'tr',
      language: 'tr',
    }
  }
  return g.__asistanLangBridge
}

const COOKIE_NAME = 'asistan-lang'
const LOCAL_STORAGE_KEY = 'asistan-lang'
const LanguageContext = getLangBridge().context

export function LanguageProvider({
  children,
  initialLanguage = 'tr',
}: {
  children: React.ReactNode
  /** From server cookie so SSR matches first client paint. */
  initialLanguage?: Language
}) {
  const bridge = getLangBridge()
  bridge.initialLanguage = initialLanguage

  const [language, setLanguageState] = useState<Language>(initialLanguage)
  // Until mount sync finishes, always expose initialLanguage so hydrate matches SSR
  // even if a stale effect or split context tries to read ahead.
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
  bridge.language = activeLanguage

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
    return translations[activeLanguage]
  }

  return (
    <LanguageContext.Provider value={{ language: activeLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const bridge = getLangBridge()
  const context = useContext(LanguageContext)
  if (context === undefined) {
    // Split-chunk fallback: match Provider's SSR initialLanguage (never hardcode TR).
    const lang = bridge.initialLanguage
    return {
      language: lang,
      setLanguage: (_lang: Language) => undefined,
      t: <T,>(translations: { tr: T; en: T }): T => translations[lang],
    }
  }
  return context
}
