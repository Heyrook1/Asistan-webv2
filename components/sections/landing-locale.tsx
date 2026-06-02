'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'

export type LandingLocale = 'tr' | 'en'

interface LandingLocaleContextValue {
  locale: LandingLocale
  setLocale: Dispatch<SetStateAction<LandingLocale>>
}

const STORAGE_KEY = 'asistan-landing-locale'

const LandingLocaleContext = createContext<LandingLocaleContextValue | null>(null)

export function LandingLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<LandingLocale>('tr')

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'tr' || stored === 'en') {
      setLocale(stored)
      return
    }

    window.localStorage.setItem(STORAGE_KEY, 'tr')
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale)
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale],
  )

  return (
    <LandingLocaleContext.Provider value={value}>
      {children}
    </LandingLocaleContext.Provider>
  )
}

export function useLandingLocale() {
  const context = useContext(LandingLocaleContext)

  if (!context) {
    throw new Error('useLandingLocale must be used inside LandingLocaleProvider')
  }

  return context
}

