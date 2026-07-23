'use client'

import { LanguageProvider, type Language } from '@/contexts/LanguageContext'

/** Keeps /client islands on the same LanguageContext instance as their consumers. */
export function ClientLanguageBoundary({
  children,
  initialLanguage = 'tr',
}: {
  children: React.ReactNode
  initialLanguage?: Language
}) {
  return <LanguageProvider initialLanguage={initialLanguage}>{children}</LanguageProvider>
}
