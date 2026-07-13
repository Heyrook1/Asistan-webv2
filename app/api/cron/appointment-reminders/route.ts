import { NextResponse, type NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { processAppointmentReminders } from '@/lib/client-marketplace/reminders'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function authorize(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    // Allow local/dev runs without a secret; require it when configured.
    return process.env.NODE_ENV !== 'production'
  }
  const header = request.headers.get('authorization')
  return header === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await processAppointmentReminders()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Reminder job failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
