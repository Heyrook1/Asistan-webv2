import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireClientAuth } from '@/lib/client-marketplace/auth'
import { cancelClientAppointment } from '@/lib/client-marketplace/appointment-lifecycle'

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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const body = await request.json().catch(() => ({}))
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz istek', issues: parsed.error.issues }, { status: 400 })
  }

  const result = await cancelClientAppointment({
    clientUserId: auth.clientUser.id,
    appointmentId: id,
    reason: parsed.data.reason,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 })
  }

  revalidatePath('/dashboard/ajanda')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
  revalidatePath('/dashboard/bildirimler')

  return NextResponse.json({ ok: true })
}
