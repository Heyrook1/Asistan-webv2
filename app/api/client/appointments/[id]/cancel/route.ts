import { NextResponse, type NextRequest } from 'next/server'
import { apiError, apiValidationError, parsePathId } from '@/lib/api-response'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireClientAuth } from '@/lib/client-marketplace/auth'
import { cancelClientAppointment } from '@/lib/client-marketplace/appointment-lifecycle'
import { rateLimitClientMutation } from '@/lib/client-marketplace/mutation-rate-limit'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  reason: z.string().trim().max(500).optional(),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireClientAuth(request)
  if (!auth) {
    return apiError('Unauthorized', 401)
  }

  if (!(await rateLimitClientMutation(request, 'cancel', auth.clientUser.id, 15))) {
    return apiError('Too many requests', 429)
  }

  const id = parsePathId((await context.params).id)
  if (!id) {
    return apiError('Gecersiz randevu kimligi', 400)
  }
  const body = await request.json().catch(() => ({}))
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return apiValidationError('Gecersiz istek', parsed.error.issues, 400)
  }

  const result = await cancelClientAppointment({
    clientUserId: auth.clientUser.id,
    appointmentId: id,
    reason: parsed.data.reason,
  })

  if (!result.ok) {
    return apiError(result.error, 409)
  }

  revalidatePath('/dashboard/ajanda')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
  revalidatePath('/dashboard/bildirimler')

  return NextResponse.json({ ok: true })
}
