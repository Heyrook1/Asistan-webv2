'use client'

import type { Language } from '@/contexts/LanguageContext'

/**
 * Pass-through — root layout already mounts LanguageProvider.
 * Nested providers shared a mutable globalThis bridge and caused React #418.
 */
export function ClientLanguageBoundary({
  children,
  initialLanguage: _initialLanguage = 'tr',
}: {
  children: React.ReactNode
  /** Kept for call-site compatibility; unused (root cookie wins). */
  initialLanguage?: Language
}) {
  return <>{children}</>
}
