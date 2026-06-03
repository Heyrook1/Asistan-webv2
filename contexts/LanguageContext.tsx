// contexts/LanguageContext.tsx
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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('tr')

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
    // 1. Check Cookie first
    const cookieLang = getCookie(COOKIE_NAME)
    if (cookieLang === 'tr' || cookieLang === 'en') {
      setLanguageState(cookieLang)
      return
    }

    // 2. Check localStorage
    const localLang = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (localLang === 'tr' || localLang === 'en') {
      setLanguageState(localLang)
      setCookie(COOKIE_NAME, localLang)
      return
    }

    // 3. Check browser language
    if (typeof window !== 'undefined') {
      const browserLang = window.navigator.language.split('-')[0]
      const defaultLang: Language = browserLang === 'tr' ? 'tr' : 'en'
      setLanguageState(defaultLang)
      localStorage.setItem(LOCAL_STORAGE_KEY, defaultLang)
      setCookie(COOKIE_NAME, defaultLang)
    }
  }, [])

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
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
