export const SUPPORT_BUSINESS_COOKIE = 'asistan-support-business'

export function isSupportModeCookie(value: string | undefined | null) {
  return Boolean(value && /^[0-9a-f-]{36}$/i.test(value))
}
