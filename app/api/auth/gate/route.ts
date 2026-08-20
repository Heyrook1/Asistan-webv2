import { type NextRequest } from 'next/server'
import { apiError, apiSuccess } from '@/lib/api-response'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * Pre-auth gate for password login / register / forgot attempts.
 * Client calls this before supabase.auth — advisory rate limit + register consent check.
 */
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anon'

  let action = 'login'
  let acceptedTerms = false
  try {
    const body = (await request.json()) as {
      action?: string
      acceptedTerms?: boolean
    }
    if (body.action === 'register' || body.action === 'login' || body.action === 'forgot') {
      action = body.action
    }
    acceptedTerms = body.acceptedTerms === true
  } catch {
    // ignore empty body — still rate-limit by IP
  }

  if (action === 'register' && !acceptedTerms) {
    return apiError(
      'Devam etmek için gizlilik ve kullanım koşullarını kabul edin.',
      400,
      'TERMS_REQUIRED',
    )
  }

  const allowed = await checkRateLimit(
    `auth:${action}:${ip}`,
    RATE_LIMITS.auth.limit,
    RATE_LIMITS.auth.window
  )
  if (!allowed) {
    return apiError('Çok fazla deneme. 15 dakika sonra tekrar deneyin.', 429)
  }

  return apiSuccess({ ok: true })
}
