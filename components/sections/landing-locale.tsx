'use client'

import React, { type ReactNode } from 'react'
import { useLanguage, type Language } from '@/contexts/LanguageContext'

export type LandingLocale = Language

export function LandingLocaleProvider({ children }: { children: ReactNode }) {
  // Now a transparent wrapper, since LanguageProvider is placed at root layout level
  return <>{children}</>
}

export function useLandingLocale() {
  const { language, setLanguage } = useLanguage()
  return {
    locale: language as LandingLocale,
    setLocale: setLanguage as React.Dispatch<React.SetStateAction<LandingLocale>>,
  }
}
