import { NextResponse, type NextRequest } from 'next/server'
import { apiError, apiValidationError } from '@/lib/api-response'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireClientAuth } from '@/lib/client-marketplace/auth'
import { createReviewForClient, createReviewSchema, getDoctorReviewSummary } from '@/lib/client-marketplace/reviews'
import { rateLimitClientMutation } from '@/lib/client-marketplace/mutation-rate-limit'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const listSchema = z.object({
  doctorId: z.string().uuid().optional(),
  businessId: z.string().uuid().optional(),
})

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  const allowed = await checkRateLimit(`client-reviews:${ip}`, RATE_LIMITS.api.limit, RATE_LIMITS.api.window)
  if (!allowed) {
    return apiError('Çok fazla istek', 429)
  }

  const parsed = listSchema.safeParse({
    doctorId: request.nextUrl.searchParams.get('doctorId') ?? undefined,
    businessId: request.nextUrl.searchParams.get('businessId') ?? undefined,
  })

  if (!parsed.success) {
    return apiError('Gecersiz yorum sorgusu', 400)
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
    return apiError('Unauthorized', 401)
  }

  if (!(await rateLimitClientMutation(request, 'reviews', auth.clientUser.id, 10))) {
    return apiError('Too many requests', 429)
  }

  const body = await request.json().catch(() => null)
  const parsed = createReviewSchema.safeParse(body)
  if (!parsed.success) {
    return apiValidationError('Gecersiz yorum formu', parsed.error.issues, 400)
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

