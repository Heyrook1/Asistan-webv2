/**
 * Appointment reminder + notification outbox drain cron — fail-closed.
 *
 *   curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
 *     "$APP_URL/api/cron/notification-outbox"
 */
import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import * as Sentry from '@sentry/nextjs'
import { processNotificationOutbox } from '@/lib/notifications/notification-outbox'
import { authorizeCronRequest } from '@/lib/security/cron-auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const auth = authorizeCronRequest(request)
  if (!auth.ok) {
    return apiError(auth.message, auth.status)
  }

  const allowed = await checkRateLimit('cron:notification-outbox', 12, '1 m')
  if (!allowed) {
    return apiError('Too many requests', 429)
  }

  try {
    const result = await runWithTenantBypassAsync('cron:notification-outbox', () =>
      processNotificationOutbox(),
    )
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    Sentry.captureException(error)
    return apiError(
      error instanceof Error ? error.message : 'Outbox drain failed',
      500,
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
