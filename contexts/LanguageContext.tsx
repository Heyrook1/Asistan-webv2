// contexts/LanguageContext.tsx
'use client'

import { useLanguage as useLanguageHook, Language as LangType } from '@/hooks/useLanguage'
import { LandingLocaleProvider } from '@/components/sections/landing-locale'

export type Language = LangType

export const LanguageProvider = LandingLocaleProvider

export const useLanguage = useLanguageHook
