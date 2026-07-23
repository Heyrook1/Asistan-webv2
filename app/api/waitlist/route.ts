import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { apiSuccess, apiError, apiValidationError } from '@/lib/api-response'
import * as Sentry from '@sentry/nextjs'

const waitlistSchema = z.object({
  email: z.string().trim().email().max(254),
})

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // 5 signups / hour / IP (lead spam guard)
    if (!(await checkRateLimit(`waitlist:${ip}`, 5, '1 h'))) {
      return apiError('Too many requests. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED')
    }

    const body = await request.json().catch(() => null)
    const parsed = waitlistSchema.safeParse(body)
    if (!parsed.success) {
      return apiValidationError('Geçerli bir e-posta adresi girin', parsed.error.issues, 400)
    }

    const normalizedEmail = parsed.data.email.toLowerCase()

    // Duplicate opt-ins are silently accepted (no error surfaced to the visitor).
    await prisma.waitlist.upsert({
      where: { email: normalizedEmail },
      create: { email: normalizedEmail },
      update: {},
    })

    return apiSuccess({ success: true })
  } catch (error) {
    console.error('Waitlist error:', error)
    Sentry.captureException(error)
    return apiError(
      error instanceof Error ? error.message : 'Server error',
      500,
      'INTERNAL_SERVER_ERROR'
    )
  }
}
