import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import * as Sentry from '@sentry/nextjs'
import { getPublicIntakeByToken, submitPublicIntake } from '@/lib/public-intake/submit'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Ctx = { params: Promise<{ token: string }> }

export async function GET(request: NextRequest, context: Ctx) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  const allowed = await checkRateLimit(`intake-get:${ip}`, RATE_LIMITS.public.limit, RATE_LIMITS.public.window)
  if (!allowed) return apiError('Çok fazla istek', 429)

  const { token } = await context.params
  const result = await getPublicIntakeByToken(token)
  if (!result.ok) {
    const status = result.error === 'not_found' ? 404 : 410
    return apiError(result.error, status)
  }
  return NextResponse.json(result)
}

export async function POST(request: NextRequest, context: Ctx) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  const allowed = await checkRateLimit(`intake-post:${ip}`, 6, '1 m')
  if (!allowed) {
    return apiError('Çok fazla deneme. Biraz sonra tekrar deneyin.', 429)
  }

  try {
    const { token } = await context.params
    const body = await request.json().catch(() => null)
    const answers = body && typeof body === 'object' ? (body as { answers?: unknown }).answers : null
    const result = await submitPublicIntake(token, answers)
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 })
    }
    return NextResponse.json(result)
  } catch (error) {
    Sentry.captureException(error)
    return apiError('Form gönderilemedi', 500)
  }
}
