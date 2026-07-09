import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { apiSuccess, apiError } from '@/lib/api-response'
import * as Sentry from '@sentry/nextjs'

const newsletterSchema = z.object({
  email: z
    .string({ required_error: 'E-posta zorunlu' })
    .email('Geçersiz e-posta adresi'),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 subscriptions per hour per IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = `newsletter:${ip}`
    
    if (!await checkRateLimit(rateLimitKey)) {
      return apiError('Too many requests. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED')
    }

    const body = await request.json()
    const result = newsletterSchema.safeParse(body)

    if (!result.success) {
      const message = result.error.flatten().fieldErrors.email?.[0] ?? 'Geçersiz e-posta'
      return apiError(message, 400, 'VALIDATION_ERROR')
    }

    const { email } = result.data

    // Ensure table exists without requiring a schema migration (mirrors waitlist pattern)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
        "id"        TEXT PRIMARY KEY,
        "email"     TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // ON CONFLICT DO NOTHING → duplicate subscriptions silently accepted (no error shown to user)
    await prisma.$executeRawUnsafe(
      `INSERT INTO "NewsletterSubscriber" ("id", "email", "createdAt")
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT ("email") DO NOTHING`,
      crypto.randomUUID(),
      email,
    )

    return apiSuccess({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası'
    console.error('[newsletter] error:', error)
    Sentry.captureException(error)
    return apiError(message, 500, 'INTERNAL_SERVER_ERROR')
  }
}
