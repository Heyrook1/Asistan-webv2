import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { catalogPrisma } from '@/lib/prisma-owner'
import * as Sentry from '@sentry/nextjs'
import {
  checkRateLimit,
  RATE_LIMITS,
  getRateLimitBackendPreference,
  isUpstashRateLimitConfigured,
} from '@/lib/rate-limit'
import { isIdentityPepperConfigured } from '@/lib/identity/resolve'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type CheckState = 'healthy' | 'degraded' | 'unhealthy'

interface HealthStatus {
  ok: boolean
  timestamp: string
  checks: {
    database: CheckState
    catalog: CheckState
    identityPepper: CheckState
    /** asistan_app → SET LOCAL ROLE asistan_identity (Person / GPI book path). */
    identityRole: CheckState
    rateLimit: {
      backend: 'upstash' | 'memory'
      configured: boolean
      ok: boolean
    }
  }
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<HealthStatus | { error: string }>> {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  // Public probe — keep cheap but rate-limited (recon / DB hammer).
  let allowed = true
  try {
    allowed = await checkRateLimit(
      `health:${ip}`,
      Math.min(RATE_LIMITS.api.limit, 30),
      RATE_LIMITS.api.window
    )
  } catch (rateLimitError) {
    console.error('[health] rate-limit skipped', rateLimitError)
  }
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const timestamp = new Date().toISOString()
  const rateLimitBackend = getRateLimitBackendPreference()
  const rateLimitConfigured = isUpstashRateLimitConfigured()

  let database: CheckState = 'unhealthy'
  let catalog: CheckState = 'unhealthy'

  try {
    await prisma.$queryRaw`SELECT 1`
    database = 'healthy'
  } catch (error) {
    console.error('[health] Database check failed:', error)
    Sentry.captureException(error, {
      tags: { component: 'health-check', check: 'database' },
    })
  }

  try {
    // Owner/catalog client — booking discovery depends on this path under RLS.
    await catalogPrisma().business.findFirst({
      where: { isActive: true },
      select: { id: true },
    })
    catalog = 'healthy'
  } catch (error) {
    console.error('[health] Catalog check failed:', error)
    Sentry.captureException(error, {
      tags: { component: 'health-check', check: 'catalog' },
    })
  }

  const identityPepper: CheckState = isIdentityPepperConfigured()
    ? 'healthy'
    : process.env.NODE_ENV === 'production'
      ? 'unhealthy'
      : 'degraded'

  let identityRole: CheckState = 'unhealthy'
  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE asistan_identity`)
      await tx.$queryRaw`SELECT 1 FROM "Person" LIMIT 1`
      await tx.$executeRawUnsafe(`RESET ROLE`)
    })
    identityRole = 'healthy'
  } catch (error) {
    console.error('[health] identityRole check failed:', error)
    Sentry.captureException(error, {
      tags: { component: 'health-check', check: 'identityRole' },
    })
    identityRole = process.env.NODE_ENV === 'production' ? 'unhealthy' : 'degraded'
  }

  const ok =
    database === 'healthy' &&
    catalog === 'healthy' &&
    (identityPepper === 'healthy' || process.env.NODE_ENV !== 'production') &&
    (identityRole === 'healthy' || process.env.NODE_ENV !== 'production')

  return NextResponse.json(
    {
      ok,
      timestamp,
      checks: {
        database,
        catalog,
        identityPepper,
        identityRole,
        rateLimit: {
          backend: rateLimitBackend,
          configured: rateLimitConfigured,
          // Memory is OK for single-node EC2; Upstash preferred when scaled.
          ok: true,
        },
      },
    },
    { status: ok ? 200 : 503 }
  )
}
