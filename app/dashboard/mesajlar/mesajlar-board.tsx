'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  addGroupParticipants,
  createGroupConversation,
  getOrCreateDirectConversation,
  markConversationRead,
  removeGroupParticipant,
  sendMessage,
  toggleMessageReaction,
} from '@/lib/actions/messages'
import { useMessageStream } from '@/hooks/use-message-stream'
import { uploadMessageMedia } from '@/lib/storage'

import { ComposeConversationSheet } from './compose-conversation-sheet'
import { ConversationRail } from './conversation-rail'
import { GroupMembersSheet } from './group-members-sheet'
import type { MesajlarBoardProps, ThreadMessage } from './mesajlar-types'
import { ThreadPanel } from './thread-panel'

export function MesajlarBoard({
  session,
  businessId,
  conversations,
  activeConversationId,
  teammates,
  thread,
}: MesajlarBoardProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [groupMode, setGroupMode] = useState(false)
  const [groupTitle, setGroupTitle] = useState('')
  const [groupUsers, setGroupUsers] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [streamMessages, setStreamMessages] = useState<ThreadMessage[]>([])
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const participantUsers = useMemo(() => {
    const users = new Map<string, ThreadMessage['sender']>()
    for (const participant of thread?.participants ?? []) {
      users.set(participant.userId, participant.user)
    }
    return users
  }, [thread?.participants])

  // Realtime + polling for the open thread.
  const latestMsg = thread?.messages[thread.messages.length - 1]?.createdAt ?? null
  useMessageStream({
    conversationId: thread?.id,
    selfUserId: session.userId,
    latestCreatedAt: latestMsg,
    onIncoming: (message) => {
      const sender =
        participantUsers.get(message.senderUserId) ??
        ({
          id: message.senderUserId,
          fullName: 'Ekip üyesi',
          avatarUrl: null,
        } satisfies ThreadMessage['sender'])

      setStreamMessages((current) => {
        if (current.some((item) => item.id === message.id)) return current
        return [
          ...current,
          {
            ...message,
            sender,
            attachments: [],
            reactions: [],
          },
        ]
      })
      toast('Yeni mesaj geldi')
    },
    onThreadChanged: () => {
      router.refresh()
    },
  })

  // Reset transient stream cache when switching threads (server data refetches
  // via router.refresh so we don't double-render).
  useEffect(() => {
    setStreamMessages([])
  }, [thread?.id])

  // Mark thread as read once it's visible.
  useEffect(() => {
    if (!thread?.id) return
    const t = window.setTimeout(() => {
      markConversationRead({ conversationId: thread.id }).then((res) => {
        if (res.ok) router.refresh()
      })
    }, 400)
    return () => window.clearTimeout(t)
  }, [thread?.id, thread?.messages.length, router])

  // Auto-scroll to bottom when new messages arrive.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [thread?.messages.length, streamMessages.length])

  const allMessages = useMemo<ThreadMessage[]>(() => {
    const base = thread?.messages ?? []
    if (streamMessages.length === 0) return base
    const seen = new Set(base.map((m) => m.id))
    return [...base, ...streamMessages.filter((m) => !seen.has(m.id))]
  }, [thread?.messages, streamMessages])

  const filteredConversations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter(
      (c) =>
        c.partner?.fullName.toLowerCase().includes(q) ||
        c.lastMessage?.body.toLowerCase().includes(q) ||
        (c.title ?? '').toLowerCase().includes(q)
    )
  }, [conversations, searchTerm])

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0)

  function handleSend() {
    if (!thread || (!draft.trim() && attachments.length === 0)) return
    const body = draft.trim()
    const files = [...attachments]
    setDraft('')
    setAttachments([])
    startTransition(async () => {
      try {
        const uploaded = await Promise.all(
          files.map((file) => uploadMessageMedia(file, { businessId, conversationId: thread.id }))
        )
        const result = await sendMessage({ conversationId: thread.id, body, attachments: uploaded })
        if (!result.ok) {
          toast.error(result.error)
          setDraft(body)
          setAttachments(files)
          return
        }
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Dosya yüklenemedi')
        setDraft(body)
        setAttachments(files)
      }
    })
  }

  function handleToggleReaction(messageId: string, emoji: string) {
    startTransition(async () => {
      const result = await toggleMessageReaction({ messageId, emoji })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  function handleCreateGroup() {
    if (!groupTitle.trim() || groupUsers.length === 0) return
    startTransition(async () => {
      const result = await createGroupConversation({
        title: groupTitle.trim(),
        participantUserIds: groupUsers,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setComposeOpen(false)
      setGroupMode(false)
      setGroupTitle('')
      setGroupUsers([])
      router.push(`/dashboard/mesajlar?conversation=${result.data.conversationId}`)
      router.refresh()
    })
  }

  function handleAddGroupMember(userId: string) {
    if (!thread?.isGroup) return
    startTransition(async () => {
      const result = await addGroupParticipants({
        conversationId: thread.id,
        participantUserIds: [userId],
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Katılımcı eklendi')
      router.refresh()
    })
  }

  function handleRemoveGroupMember(userId: string) {
    if (!thread?.isGroup) return
    startTransition(async () => {
      const result = await removeGroupParticipant({ conversationId: thread.id, userId })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Katılımcı çıkarıldı')
      router.refresh()
    })
  }

  function handleStartConversation(userId: string) {
    startTransition(async () => {
      const result = await getOrCreateDirectConversation({ partnerUserId: userId })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setComposeOpen(false)
      router.push(`/dashboard/mesajlar?conversation=${result.data.conversationId}`)
      router.refresh()
    })
  }

  const activeParticipantIds = new Set(thread?.participants.map((p) => p.userId) ?? [])
  const addableTeammates = teammates.filter((t) => !activeParticipantIds.has(t.userId))

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Mesajlar</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Ekip arkadaşlarınızla doğrudan, gerçek zamanlı yazışın. Tüm mesajlar veritabanında saklanır.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {totalUnread > 0 && (
            <span className="rounded-full bg-brand-danger/10 px-2.5 py-1 text-xs font-semibold text-brand-danger-strong">
              {totalUnread} okunmamış
            </span>
          )}
          <Button
            onClick={() => setComposeOpen(true)}
            className="bg-brand-teal text-white hover:bg-brand-teal-hover"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Yeni Sohbet
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid h-[calc(100vh-260px)] min-h-[480px] grid-cols-1 lg:grid-cols-[320px_1fr]">
          <ConversationRail
            activeConversationId={activeConversationId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            conversations={filteredConversations}
            selfUserId={session.userId}
            onSelectConversation={(id) => router.push(`/dashboard/mesajlar?conversation=${id}`)}
            onCompose={() => setComposeOpen(true)}
          />

          <ThreadPanel
            thread={thread}
            selfUserId={session.userId}
            messages={allMessages}
            scrollRef={scrollRef}
            draft={draft}
            onDraftChange={setDraft}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            pending={pending}
            onSend={handleSend}
            onToggleReaction={handleToggleReaction}
            onBack={() => router.push('/dashboard/mesajlar')}
            onOpenMembers={() => setMembersOpen(true)}
            onCompose={() => setComposeOpen(true)}
          />
        </div>
      </Card>

      <ComposeConversationSheet
        open={composeOpen}
        onOpenChange={setComposeOpen}
        groupMode={groupMode}
        onGroupModeChange={setGroupMode}
        groupTitle={groupTitle}
        onGroupTitleChange={setGroupTitle}
        groupUsers={groupUsers}
        onGroupUsersChange={setGroupUsers}
        teammates={teammates}
        pending={pending}
        onStartConversation={handleStartConversation}
        onCreateGroup={handleCreateGroup}
      />

      <GroupMembersSheet
        open={membersOpen}
        onOpenChange={setMembersOpen}
        participants={thread?.participants ?? []}
        selfUserId={session.userId}
        addableTeammates={addableTeammates}
        pending={pending}
        onAddMember={handleAddGroupMember}
        onRemoveMember={handleRemoveGroupMember}
      />
    </div>
  )
}
