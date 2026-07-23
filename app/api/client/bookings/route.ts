import { NextResponse, type NextRequest } from 'next/server'
import { apiError, apiValidationError } from '@/lib/api-response'
import { revalidatePath } from 'next/cache'
import { requireClientAuth } from '@/lib/client-marketplace/auth'
import { createClientBooking, createClientBookingSchema } from '@/lib/client-marketplace/bookings'
import { rateLimitClientMutation } from '@/lib/client-marketplace/mutation-rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const auth = await requireClientAuth(request)
  if (!auth) {
    return apiError('Unauthorized', 401)
  }

  if (!(await rateLimitClientMutation(request, 'bookings', auth.clientUser.id, 15))) {
    return apiError('Too many requests', 429)
  }

  const body = await request.json().catch(() => null)
  const parsed = createClientBookingSchema.safeParse(body)
  if (!parsed.success) {
    return apiValidationError('Gecersiz randevu formu', parsed.error.issues, 400)
  }

  const result = await createClientBooking({
    payload: parsed.data,
    clientUserId: auth.clientUser.id,
    authUserId: auth.authUserId,
  })

  if (!result.ok) {
    return NextResponse.json(result, { status: 409 })
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/ajanda')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
  revalidatePath('/dashboard/bildirimler')

  return NextResponse.json(result)
}
