export type AuthLanguage = 'tr' | 'en'

export function normalizeAuthLanguage(value: string | null | undefined): AuthLanguage {
  return value === 'en' ? 'en' : 'tr'
}

/** Canonical localized login path (no extra redirect hops). */
export function getLoginPath(language: AuthLanguage = 'tr'): string {
  return language === 'tr' ? '/tr/giris' : '/en/login'
}

/** Canonical localized registration path (no extra redirect hops). */
export function getRegisterPath(language: AuthLanguage = 'tr'): string {
  return language === 'tr' ? '/tr/kayit' : '/en/register'
}

/** Legacy aliases kept for backward compatibility; prefer getLoginPath/getRegisterPath. */
export const AUTH_LOGIN_ALIAS = '/auth/login'
export const AUTH_REGISTER_ALIAS = '/auth/sign-up'
