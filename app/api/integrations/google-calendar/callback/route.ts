import { NextResponse, type NextRequest } from 'next/server'
import { CalendarProvider } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  isGoogleCalendarSyncEnabled,
  resolveAppOrigin,
} from '@/lib/calendar/config'
import { verifyOAuthState } from '@/lib/calendar/crypto'
import {
  exchangeGoogleAuthCode,
  fetchGoogleAccountEmail,
  packTokens,
} from '@/lib/calendar/google-oauth'
import { syncGoogleCalendarConnection } from '@/lib/calendar/sync'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type OAuthState = {
  staffId: string
  businessId: string
  userId: string
  exp: number
}

export async function GET(request: NextRequest) {
  const settingsUrl = new URL('/dashboard/ayarlar?tab=entegrasyonlar', request.url)

  if (!isGoogleCalendarSyncEnabled()) {
    settingsUrl.searchParams.set('calendar', 'disabled')
    return NextResponse.redirect(settingsUrl)
  }

  const errorParam = request.nextUrl.searchParams.get('error')
  if (errorParam) {
    settingsUrl.searchParams.set('calendar', 'denied')
    return NextResponse.redirect(settingsUrl)
  }

  const code = request.nextUrl.searchParams.get('code')
  const stateToken = request.nextUrl.searchParams.get('state')
  if (!code || !stateToken) {
    settingsUrl.searchParams.set('calendar', 'invalid')
    return NextResponse.redirect(settingsUrl)
  }

  try {
    const state = verifyOAuthState<OAuthState>(stateToken)
    const origin = resolveAppOrigin(request.url, request.headers)
    const tokens = await exchangeGoogleAuthCode({ code, origin })
    if (!tokens.refresh_token) {
      settingsUrl.searchParams.set('calendar', 'missing_refresh')
      return NextResponse.redirect(settingsUrl)
    }

    const expiresAt =
      typeof tokens.expires_in === 'number'
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : null
    const packed = packTokens({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
    })
    const accountEmail = await fetchGoogleAccountEmail(tokens.access_token)

    const staff = await prisma.teamMember.findFirst({
      where: {
        id: state.staffId,
        businessId: state.businessId,
        isActive: true,
      },
      select: { id: true },
    })
    if (!staff) {
      settingsUrl.searchParams.set('calendar', 'staff_missing')
      return NextResponse.redirect(settingsUrl)
    }

    const existing = await prisma.calendarConnection.findFirst({
      where: {
        businessId: state.businessId,
        staffId: state.staffId,
        provider: CalendarProvider.GOOGLE,
      },
      select: { id: true },
    })
    if (existing) {
      await prisma.calendarConnection.deleteMany({
        where: { id: existing.id, businessId: state.businessId },
      })
    }

    const connection = await prisma.calendarConnection.create({
      data: {
        businessId: state.businessId,
        staffId: state.staffId,
        provider: CalendarProvider.GOOGLE,
        calendarId: 'primary',
        accountEmail,
        accessTokenEncrypted: packed.accessTokenEncrypted,
        refreshTokenEncrypted: packed.refreshTokenEncrypted,
        tokenExpiresAt: packed.tokenExpiresAt,
        syncEnabled: true,
        connectedByUserId: state.userId,
      },
      select: { id: true },
    })

    await syncGoogleCalendarConnection(connection.id)

    settingsUrl.searchParams.set('calendar', 'connected')
    return NextResponse.redirect(settingsUrl)
  } catch {
    settingsUrl.searchParams.set('calendar', 'error')
    return NextResponse.redirect(settingsUrl)
  }
}
