/**
 * Live booking availability canary — fail-closed on INFRA, warn on clinic config.
 *
 *   curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
 *     "$APP_URL/api/cron/booking-canary"
 */
import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import * as Sentry from '@sentry/nextjs'
import { runBookingCanary } from '@/lib/ops/booking-canary'
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

  let allowed = true
  try {
    allowed = await checkRateLimit('cron:booking-canary', 12, '1 m')
  } catch (rateLimitError) {
    console.error('[cron/booking-canary] rate-limit skipped', rateLimitError)
  }
  if (!allowed) {
    return apiError('Too many requests', 429)
  }

  try {
    const report = await runWithTenantBypassAsync('cron:booking-canary', () =>
      runBookingCanary({ sampleSize: 5, horizonDays: 7 }),
    )

    if (!report.ok) {
      Sentry.captureMessage('Booking canary INFRA failure', {
        level: 'error',
        tags: { component: 'booking-canary' },
        extra: {
          infraFailures: report.infraFailures,
          clinics: report.clinics.filter(
            (c) => c.status === 'infra' || c.status === 'empty_catalog',
          ),
        },
      })
      return NextResponse.json(report, { status: 503 })
    }

    if (report.configOnly > 0) {
      Sentry.captureMessage('Booking canary config warnings', {
        level: 'warning',
        tags: { component: 'booking-canary' },
        extra: {
          configOnly: report.configOnly,
          clinics: report.clinics.filter((c) => c.status === 'config'),
        },
      })
    }

    return NextResponse.json(report, { status: 200 })
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'booking-canary' },
    })
    return apiError(
      error instanceof Error ? error.message : 'Booking canary failed',
      500,
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
