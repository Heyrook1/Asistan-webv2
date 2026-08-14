// Server-side counterpart to contexts/LanguageContext's useLanguage().
//
// `t()` there lives in a *client* React context, so async Server Components
// cannot call it — which is why /client server components ended up with
// hardcoded Turkish. Locale is already persisted as the `asistan-lang` cookie
// (see LanguageProvider), so the server can read the same value.
import { cookies } from 'next/headers'

import { normalizeAuthLanguage, type AuthLanguage } from '@/lib/auth-routes'

export type ServerLanguage = AuthLanguage

/** Shape of the bound `t` helper, for passing down to child server components. */
export type Translate = <T>(translations: { tr: T; en: T }) => T

/** Same pair shape as the client `t({ tr, en })`. */
export function pickLanguage<T>(translations: { tr: T; en: T }, language: ServerLanguage): T {
  return translations[language] ?? translations.tr
}

/**
 * Read the request locale and return a bound `t`, mirroring `useLanguage()`.
 * Reading cookies opts the caller into dynamic rendering.
 */
export async function getServerLanguage(): Promise<{
  language: ServerLanguage
  t: Translate
}> {
  const cookieStore = await cookies()
  const language = normalizeAuthLanguage(cookieStore.get('asistan-lang')?.value)
  return {
    language,
    t: (translations) => pickLanguage(translations, language),
  }
}
