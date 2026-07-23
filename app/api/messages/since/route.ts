import { NextResponse, type NextRequest } from 'next/server'
import { apiError } from '@/lib/api-response'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { isTeamMessagingEnabled } from '@/lib/messaging/policy'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return apiError('Unauthorized', 401)
  }

  if (!isTeamMessagingEnabled()) {
    return NextResponse.json({ messages: [], disabled: true })
  }

  const after = request.nextUrl.searchParams.get('after')
  const conversationId = request.nextUrl.searchParams.get('conversationId')
  const afterDate = after ? new Date(after) : new Date(0)
  if (Number.isNaN(afterDate.getTime())) {
    return apiError('Invalid after timestamp', 400)
  }

  // Constrain to conversations the caller participates in (server-side ACL).
  const myConversationIds = await prisma.conversationParticipant.findMany({
    where: { userId: session.userId, isActive: true },
    select: { conversationId: true },
  })
  const allowed = new Set(myConversationIds.map((c) => c.conversationId))
  if (conversationId && !allowed.has(conversationId)) {
    return NextResponse.json({ messages: [] })
  }

  const rows = await prisma.message.findMany({
    where: {
      conversationId: conversationId
        ? conversationId
        : { in: Array.from(allowed) },
      createdAt: { gt: afterDate },
      deletedAt: null,
    },
    orderBy: { createdAt: 'asc' },
    take: 50,
    select: {
      id: true,
      conversationId: true,
      senderUserId: true,
      body: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    messages: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  })
}
