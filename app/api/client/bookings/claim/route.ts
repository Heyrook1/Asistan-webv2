import { type NextRequest } from 'next/server'
import { apiError, apiSuccess } from '@/lib/api-response'
import { requireClientAuth } from '@/lib/client-marketplace/auth'
import { claimGuestBookingsForClientUser } from '@/lib/client-marketplace/claim-guest-bookings'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * POST /api/client/bookings/claim
 * Doğrulanmış oturumdaki e-posta/telefon ile misafir randevularını bağlar.
 */
export async function POST(request: NextRequest) {
  const auth = await requireClientAuth(request)
  if (!auth) return apiError('Unauthorized', 401)

  const allowed = await checkRateLimit(
    `client-claim:${auth.clientUser.id}`,
    Math.min(RATE_LIMITS.api.limit, 10),
    RATE_LIMITS.api.window,
  )
  if (!allowed) {
    return apiError('Çok fazla istek. Lütfen biraz sonra tekrar deneyin.', 429)
  }

  try {
    const result = await claimGuestBookingsForClientUser({
      clientUserId: auth.clientUser.id,
      email: auth.clientUser.email ?? auth.email,
      phone: auth.clientUser.phone,
    })
    return apiSuccess({
      claimed: result.claimed,
      appointmentIds: result.appointmentIds,
      message:
        result.claimed > 0
          ? `${result.claimed} misafir randevu hesabınıza bağlandı.`
          : 'Bağlanacak misafir randevu bulunamadı.',
    })
  } catch (error) {
    console.error('[api/client/bookings/claim]', error)
    return apiError('Randevu bağlama başarısız. Lütfen tekrar deneyin.', 500)
  }
}
