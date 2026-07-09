import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { apiSuccess, apiError } from '@/lib/api-response'
import * as Sentry from '@sentry/nextjs'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 signups per hour per IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = `waitlist:${ip}`
    
    if (!await checkRateLimit(rateLimitKey)) {
      return apiError('Too many requests. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED')
    }

    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return apiError('Invalid email address', 400, 'INVALID_EMAIL')
    }

    // Dynamic table creation to ensure PostgreSQL has the table even if schema-level prisma migrations are blocked by policies on unrelated tables
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Waitlist" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Insert into the waitlist table
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Waitlist" ("id", "email", "createdAt")
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT ("email") DO NOTHING;
    `, crypto.randomUUID(), email)

    return apiSuccess({ success: true })
  } catch (error: any) {
    console.error('Waitlist error:', error)
    Sentry.captureException(error)
    return apiError(error.message || 'Server error', 500, 'INTERNAL_SERVER_ERROR')
  }
}
