import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireClientAuth } from '@/lib/client-marketplace/auth'
import { createClientBooking, createClientBookingSchema } from '@/lib/client-marketplace/bookings'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const auth = await requireClientAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = createClientBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Gecersiz randevu formu',
        issues: parsed.error.issues,
      },
      { status: 400 }
    )
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
