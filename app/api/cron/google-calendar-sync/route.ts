/**
 * Google Calendar busy-block sync cron — fail-closed.
 *
 *   curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
 *     "$APP_URL/api/cron/google-calendar-sync"
 *
 * Missing `CRON_SECRET` → 503. Wrong Bearer → 401.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import * as Sentry from '@sentry/nextjs'
import { isGoogleCalendarSyncEnabled } from '@/lib/calendar/config'
import { syncAllGoogleCalendarConnections } from '@/lib/calendar/sync'
import { authorizeCronRequest } from '@/lib/security/cron-auth'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const auth = authorizeCronRequest(request)
  if (!auth.ok) {
    return apiError(auth.message, auth.status)
  }

  const allowed = await checkRateLimit('cron:google-calendar-sync', 6, '1 m')
  if (!allowed) {
    return apiError('Too many requests', 429)
  }

  if (!isGoogleCalendarSyncEnabled()) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'calendar sync disabled' })
  }

  try {
    const result = await syncAllGoogleCalendarConnections()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    Sentry.captureException(error)
    return apiError(
      error instanceof Error ? error.message : 'Calendar sync failed',
      500
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
