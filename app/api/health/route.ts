import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as Sentry from '@sentry/nextjs'

export const dynamic = 'force-dynamic'

interface HealthStatus {
  ok: boolean
  timestamp: string
  checks: {
    database: 'healthy' | 'degraded' | 'unhealthy'
    uptime: number
  }
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const timestamp = new Date().toISOString()

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json(
      {
        ok: true,
        timestamp,
        checks: {
          database: 'healthy',
          uptime: process.uptime(),
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
          uptime: process.uptime(),
        },
      },
      { status: 503 }
    )
  }
}
