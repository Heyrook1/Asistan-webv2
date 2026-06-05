import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const after = request.nextUrl.searchParams.get('after')
  const conversationId = request.nextUrl.searchParams.get('conversationId')
  const afterDate = after ? new Date(after) : new Date(0)
  if (Number.isNaN(afterDate.getTime())) {
    return NextResponse.json({ error: 'Invalid after timestamp' }, { status: 400 })
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
