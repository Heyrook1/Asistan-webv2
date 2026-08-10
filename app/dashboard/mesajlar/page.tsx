import { requireSession } from '@/lib/session'
import { getConversationThread, getMyConversations } from '@/lib/queries'
import { prisma } from '@/lib/prisma'
import { isTeamMessagingEnabled } from '@/lib/messaging/policy'
import { MesajlarDeprecatedPanel } from '@/components/dashboard/mesajlar-deprecated-panel'
import { MesajlarBoard } from './mesajlar-board'
import { redirect } from 'next/navigation'
import { clinicAssignableStaffWhere } from '@/lib/security/platform-roles'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ conversation?: string; with?: string }>

export default async function MesajlarPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireSession()

  if (!isTeamMessagingEnabled()) {
    return <MesajlarDeprecatedPanel />
  }

  const params = await searchParams

  // Existing conversations for the rail.
  const conversations = await getMyConversations(session.businessId, session.userId)

  // Team members the caller can start a chat with (clinic roles only — never SUPER_ADMIN).
  const teammates = await prisma.teamMember.findMany({
    where: {
      ...clinicAssignableStaffWhere(session.businessId),
      userId: { not: null },
      NOT: { userId: session.userId },
    },
    orderBy: { fullName: 'asc' },
    select: { userId: true, fullName: true, role: true, color: true },
  })

  // Optional ?conversation=… selects a thread directly.
  let activeId = params.conversation ?? conversations[0]?.id ?? null
  // Optional ?with=<userId> kicks off a DM via the server (no client-side
  // creation) — keeps RLS/permission checks single-sourced.
  if (params.with && !activeId) {
    const target = teammates.find((t) => t.userId === params.with)
    if (target?.userId) {
      const existing = conversations.find((c) => c.partner?.id === target.userId)
      if (existing) {
        activeId = existing.id
      }
    }
  }

  const thread = activeId
    ? await getConversationThread(activeId, session.userId)
    : null

  if (params.with && !thread) {
    // Caller wants a new DM but no existing conversation. Send them to a
    // bootstrap intent route the client can act on.
    redirect(`/dashboard/mesajlar?bootstrap=${params.with}`)
  }

  return (
    <MesajlarBoard
      session={{ userId: session.userId, fullName: session.fullName }}
      businessId={session.businessId}
      conversations={conversations}
      activeConversationId={activeId}
      teammates={teammates
        .filter((t): t is typeof t & { userId: string } => Boolean(t.userId))
        .map((t) => ({
          userId: t.userId,
          fullName: t.fullName,
          role: t.role,
          color: t.color,
        }))}
      thread={
        thread
          ? {
              id: thread.conversation.id,
              isGroup: thread.conversation.isGroup,
              title: thread.conversation.title,
              participants: thread.conversation.participants.map((p) => ({
                userId: p.userId,
                user: p.user,
              })),
              messages: thread.messages.map((m) => ({
                id: m.id,
                conversationId: m.conversationId,
                senderUserId: m.senderUserId,
                body: m.body,
                createdAt: m.createdAt.toISOString(),
                sender: m.sender,
                attachments: m.attachments.map((a) => ({
                  id: a.id,
                  fileName: a.fileName,
                  fileType: a.fileType,
                  fileSize: a.fileSize,
                  fileUrl: a.fileUrl,
                })),
                reactions: m.reactions.map((r) => ({
                  id: r.id,
                  emoji: r.emoji,
                  userId: r.userId,
                  user: r.user,
                })),
              })),
            }
          : null
      }
    />
  )
}
