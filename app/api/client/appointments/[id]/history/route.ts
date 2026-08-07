import { NextResponse, type NextRequest } from 'next/server'
import { apiError, parsePathId } from '@/lib/api-response'
import { requireClientAuth } from '@/lib/client-marketplace/auth'
import { listClientAppointmentHistory } from '@/lib/client-marketplace/appointment-history'
import { rateLimitClientMutation } from '@/lib/client-marketplace/mutation-rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireClientAuth(request)
  if (!auth) {
    return apiError('Unauthorized', 401)
  }

  if (!(await rateLimitClientMutation(request, 'history', auth.clientUser.id, 60))) {
    return apiError('Too many requests', 429)
  }

  const id = parsePathId((await context.params).id)
  if (!id) {
    return apiError('Gecersiz randevu kimligi', 400)
  }

  const result = await listClientAppointmentHistory({
    clientUserId: auth.clientUser.id,
    appointmentId: id,
  })

  if (!result.ok) {
    return apiError(result.error, 404)
  }

  return NextResponse.json({
    ok: true,
    data: { events: result.events },
    events: result.events,
  })
}
