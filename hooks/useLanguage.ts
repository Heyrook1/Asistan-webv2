// hooks/useLanguage.ts
'use client'

import { useLanguage as useLangContext, Language as LangType } from '@/contexts/LanguageContext'

export type Language = LangType

export function useLanguage() {
  return useLangContext()
}
