import type { TeamRole } from '@prisma/client'
import type { ConversationSummary } from '@/lib/queries'

export type Teammate = {
  userId: string
  fullName: string
  role: TeamRole
  color: string
}

export type ThreadMessage = {
  id: string
  conversationId: string
  senderUserId: string
  body: string
  createdAt: string
  sender: { id: string; fullName: string; avatarUrl: string | null }
  attachments: { id: string; fileName: string; fileType: string; fileSize: number; fileUrl: string }[]
  reactions: { id: string; emoji: string; userId: string; user: { id: string; fullName: string } }[]
}

export type ThreadData = {
  id: string
  isGroup: boolean
  title: string | null
  participants: { userId: string; user: { id: string; fullName: string; avatarUrl: string | null } }[]
  messages: ThreadMessage[]
}

export type MesajlarBoardProps = {
  session: { userId: string; fullName: string }
  businessId: string
  conversations: ConversationSummary[]
  activeConversationId: string | null
  teammates: Teammate[]
  thread: ThreadData | null
}
