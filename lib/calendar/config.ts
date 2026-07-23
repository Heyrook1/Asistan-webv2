import 'server-only'

import { isFeatureEnabled } from '@/lib/feature-flags'

export const GOOGLE_FREEBUSY_SCOPE = 'https://www.googleapis.com/auth/calendar.freebusy'
export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const GOOGLE_FREEBUSY_URL = 'https://www.googleapis.com/calendar/v3/freeBusy'
export const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

/** Rolling sync horizon for busy imports (days ahead from today). */
export const CALENDAR_SYNC_DAYS_AHEAD = 28

export function getGoogleCalendarClientConfig() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim()
  const encryptionKey = process.env.CALENDAR_TOKEN_ENCRYPTION_KEY?.trim()
  return { clientId, clientSecret, encryptionKey }
}

export function isGoogleCalendarSyncConfigured() {
  const { clientId, clientSecret, encryptionKey } = getGoogleCalendarClientConfig()
  return Boolean(clientId && clientSecret && encryptionKey)
}

/** Product gate: flag on by default when credentials exist; override with ASISTAN_FLAG_CALENDAR_SYNC. */
export function isGoogleCalendarSyncEnabled() {
  if (!isGoogleCalendarSyncConfigured()) return false
  return isFeatureEnabled('calendarSync')
}

export function resolveAppOrigin(requestUrl: string, headers: Headers): string {
  const configured =
    process.env.GOOGLE_CALENDAR_REDIRECT_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')

  const forwardedHost = headers.get('x-forwarded-host')
  const host = forwardedHost || headers.get('host')
  if (host) {
    const proto = headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
    return `${proto}://${host}`
  }

  return new URL(requestUrl).origin
}

export function googleCalendarCallbackUrl(origin: string) {
  return `${origin.replace(/\/$/, '')}/api/integrations/google-calendar/callback`
}
