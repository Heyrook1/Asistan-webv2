import 'server-only'

import {
  GOOGLE_AUTH_URL,
  GOOGLE_FREEBUSY_SCOPE,
  GOOGLE_FREEBUSY_URL,
  GOOGLE_TOKEN_URL,
  GOOGLE_USERINFO_URL,
  getGoogleCalendarClientConfig,
  googleCalendarCallbackUrl,
} from '@/lib/calendar/config'
import { encryptSecret, decryptSecret } from '@/lib/calendar/crypto'

type TokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  scope?: string
}

export function buildGoogleAuthUrl(input: {
  origin: string
  state: string
}) {
  const { clientId } = getGoogleCalendarClientConfig()
  if (!clientId) throw new Error('GOOGLE_CALENDAR_CLIENT_ID missing')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleCalendarCallbackUrl(input.origin),
    response_type: 'code',
    scope: GOOGLE_FREEBUSY_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state: input.state,
  })
  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

async function postToken(body: Record<string, string>): Promise<TokenResponse> {
  const { clientId, clientSecret } = getGoogleCalendarClientConfig()
  if (!clientId || !clientSecret) throw new Error('Google Calendar OAuth is not configured')

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      ...body,
    }).toString(),
  })

  const json = (await res.json()) as TokenResponse & { error?: string; error_description?: string }
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description || json.error || 'Google token exchange failed')
  }
  return json
}

export async function exchangeGoogleAuthCode(input: { code: string; origin: string }) {
  return postToken({
    code: input.code,
    grant_type: 'authorization_code',
    redirect_uri: googleCalendarCallbackUrl(input.origin),
  })
}

export async function refreshGoogleAccessToken(refreshToken: string) {
  return postToken({
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })
}

export async function fetchGoogleAccountEmail(accessToken: string) {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  const json = (await res.json()) as { email?: string }
  return json.email ?? null
}

export type FreeBusySlot = { start: string; end: string }

export async function fetchGoogleFreeBusy(input: {
  accessToken: string
  calendarId: string
  timeMin: string
  timeMax: string
}): Promise<FreeBusySlot[]> {
  const res = await fetch(GOOGLE_FREEBUSY_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${input.accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      timeMin: input.timeMin,
      timeMax: input.timeMax,
      items: [{ id: input.calendarId }],
    }),
  })

  const json = (await res.json()) as {
    error?: { message?: string }
    calendars?: Record<string, { busy?: FreeBusySlot[]; errors?: Array<{ reason?: string }> }>
  }

  if (!res.ok) {
    throw new Error(json.error?.message || 'Google FreeBusy request failed')
  }

  const calendar = json.calendars?.[input.calendarId]
  if (calendar?.errors?.length) {
    throw new Error(calendar.errors.map((e) => e.reason).filter(Boolean).join(', ') || 'Calendar FreeBusy error')
  }

  return calendar?.busy ?? []
}

export function packTokens(tokens: { accessToken: string; refreshToken: string; expiresAt: Date | null }) {
  return {
    accessTokenEncrypted: encryptSecret(tokens.accessToken),
    refreshTokenEncrypted: encryptSecret(tokens.refreshToken),
    tokenExpiresAt: tokens.expiresAt,
  }
}

export function unpackTokens(row: {
  accessTokenEncrypted: string
  refreshTokenEncrypted: string
}) {
  return {
    accessToken: decryptSecret(row.accessTokenEncrypted),
    refreshToken: decryptSecret(row.refreshTokenEncrypted),
  }
}
