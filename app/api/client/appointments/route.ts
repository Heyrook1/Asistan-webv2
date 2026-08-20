/**
 * GET /api/client/appointments — hasta randevu listesi (poll).
 *
 * `RATE_LIMITS.poll` ile sık yenileme sınırlanır; yalnız kendi ClientUser kayıtları.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import { requireClientAuth } from '@/lib/client-marketplace/auth'
import { listClientAppointments } from '@/lib/client-marketplace/appointments'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireClientAuth(request)
  if (!auth) {
    return apiError('Unauthorized', 401)
  }

  const allowed = await checkRateLimit(
    `poll:client-appointments:${auth.clientUser.id}`,
    RATE_LIMITS.poll.limit,
    RATE_LIMITS.poll.window
  )
  if (!allowed) {
    return apiError('Too many requests', 429)
  }

  const appointments = await listClientAppointments(auth.clientUser.id)
  return NextResponse.json({ appointments })
}
