import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return apiError('Unauthorized', 401)
  }

  const allowed = await checkRateLimit(
    `poll:notifications:${session.userId}`,
    RATE_LIMITS.poll.limit,
    RATE_LIMITS.poll.window
  )
  if (!allowed) {
    return apiError('Too many requests', 429)
  }

  const after = request.nextUrl.searchParams.get('after')
  const afterDate = after ? new Date(after) : new Date(0)
  if (Number.isNaN(afterDate.getTime())) {
    return apiError('Invalid after timestamp', 400)
  }

  const rows = await prisma.notification.findMany({
    where: {
      businessId: session.businessId,
      OR: [{ userId: session.userId }, { userId: null }],
      createdAt: { gt: afterDate },
      archivedAt: null,
    },
    orderBy: { createdAt: 'asc' },
    take: 20,
    select: {
      id: true,
      title: true,
      message: true,
      link: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    notifications: rows.map((r) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      link: r.link,
      createdAt: r.createdAt.toISOString(),
    })),
  })
}
