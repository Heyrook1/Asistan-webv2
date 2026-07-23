import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as Sentry from '@sentry/nextjs'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

interface HealthStatus {
  ok: boolean
  timestamp: string
  checks: {
    database: 'healthy' | 'degraded' | 'unhealthy'
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<HealthStatus | { error: string }>> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  // Public probe — keep cheap but rate-limited (recon / DB hammer).
  const allowed = await checkRateLimit(
    `health:${ip}`,
    Math.min(RATE_LIMITS.api.limit, 30),
    RATE_LIMITS.api.window
  )
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const timestamp = new Date().toISOString()

  try {
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json(
      {
        ok: true,
        timestamp,
        checks: {
          database: 'healthy',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[health] Database check failed:', error)
    Sentry.captureException(error, {
      tags: { component: 'health-check' },
    })

    return NextResponse.json(
      {
        ok: false,
        timestamp,
        checks: {
          database: 'unhealthy',
        },
      },
      { status: 503 }
    )
  }
}
