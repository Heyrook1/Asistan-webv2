/**
 * Appointment reminder cron — fail-closed.
 *
 *   curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
 *     "$APP_URL/api/cron/appointment-reminders"
 *
 * Missing `CRON_SECRET` → 503. Wrong Bearer → 401.
 * Scans all clinics under `runWithTenantBypassAsync('cron:appointment-reminders')`.
 *
 * @see docs/security-ops.md (privilege ladder)
 * @see .github/workflows/cron.example.yml
 */
import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import * as Sentry from '@sentry/nextjs'
import { processAppointmentReminders } from '@/lib/client-marketplace/reminders'
import { authorizeCronRequest } from '@/lib/security/cron-auth'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const auth = authorizeCronRequest(request)
  if (!auth.ok) {
    return apiError(auth.message, auth.status)
  }

  // Auth'd but still bound — prevents accidental double-fire / scheduler storms.
  const allowed = await checkRateLimit('cron:appointment-reminders', 6, '1 m')
  if (!allowed) {
    return apiError('Too many requests', 429)
  }

  try {
    const result = await processAppointmentReminders()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    Sentry.captureException(error)
    return apiError(
      error instanceof Error ? error.message : 'Reminder job failed',
      500
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
