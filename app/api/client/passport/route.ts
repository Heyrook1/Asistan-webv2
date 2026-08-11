/**
 * GET /api/client/passport — oturumlu hasta sağlık özeti (pasaport).
 *
 * `requireClientAuth` + API rate-limit; veri `getClientPassport`.
 * Klinik panel session’ı ile karıştırma.
 */

import { type NextRequest } from 'next/server'
import { apiError, apiSuccess } from '@/lib/api-response'
import { requireClientAuth } from '@/lib/client-marketplace/auth'
import { getClientPassport } from '@/lib/passport'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  let auth
  try {
    auth = await requireClientAuth(request)
  } catch (error) {
    console.error('[api/client/passport] auth failed', error)
    return apiError('Pasaport oturumu hazırlanamadı', 503)
  }
  if (!auth) return apiError('Unauthorized', 401)

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    auth.clientUser.id

  const allowed = await checkRateLimit(
    `client-passport:${ip}`,
    RATE_LIMITS.api.limit,
    RATE_LIMITS.api.window
  )
  if (!allowed) return apiError('Too many requests', 429)

  try {
    const passport = await getClientPassport({
      clientUserId: auth.clientUser.id,
      fullName: auth.clientUser.fullName || auth.fullName,
      phone: auth.clientUser.phone,
      email: auth.clientUser.email ?? auth.email,
    })
    return apiSuccess(passport)
  } catch (error) {
    console.error('[api/client/passport] GET failed', error)
    return apiError('Pasaport yüklenemedi', 500)
  }
}
