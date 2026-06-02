import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireClientAuth } from '@/lib/client-marketplace/auth'
import { createReviewForClient, createReviewSchema, getDoctorReviewSummary } from '@/lib/client-marketplace/reviews'

export const dynamic = 'force-dynamic'

const listSchema = z.object({
  doctorId: z.string().uuid().optional(),
  businessId: z.string().uuid().optional(),
})

export async function GET(request: NextRequest) {
  const parsed = listSchema.safeParse({
    doctorId: request.nextUrl.searchParams.get('doctorId') ?? undefined,
    businessId: request.nextUrl.searchParams.get('businessId') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Gecersiz yorum sorgusu' }, { status: 400 })
  }

  if (parsed.data.doctorId) {
    const summary = await getDoctorReviewSummary(parsed.data.doctorId)
    return NextResponse.json(summary)
  }

  if (parsed.data.businessId) {
    const rows = await prisma.review.findMany({
      where: { businessId: parsed.data.businessId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        clientUser: { select: { fullName: true } },
        staff: { select: { id: true, fullName: true } },
      },
      take: 50,
    })

    return NextResponse.json({
      reviews: rows.map((row) => ({
        id: row.id,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.createdAt.toISOString(),
        clientName: row.clientUser.fullName,
        doctor: row.staff,
      })),
    })
  }

  return NextResponse.json({ reviews: [] })
}

export async function POST(request: NextRequest) {
  const auth = await requireClientAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = createReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Gecersiz yorum formu', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const result = await createReviewForClient({
    payload: parsed.data,
    clientUserId: auth.clientUser.id,
  })

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result)
}

