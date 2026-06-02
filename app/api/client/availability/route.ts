import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getAvailableSlots } from '@/lib/client-marketplace/availability'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  doctorId: z.string().uuid(),
  serviceId: z.string().uuid(),
  businessId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  locationId: z.string().uuid().optional(),
})

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const parsed = querySchema.safeParse({
    doctorId: params.get('doctorId'),
    serviceId: params.get('serviceId'),
    businessId: params.get('businessId'),
    date: params.get('date'),
    locationId: params.get('locationId') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Gecersiz slot sorgusu', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const slots = await getAvailableSlots(parsed.data)
  return NextResponse.json({ slots })
}

