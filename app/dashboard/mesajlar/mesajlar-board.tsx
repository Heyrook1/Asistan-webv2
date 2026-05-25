'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCheck,
  MessageCircle,
  Paperclip,
  Plus,
  Search,
  Send,
  SmilePlus,
  UserCircle2,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import { cn } from '@/lib/utils'
import { formatTimeAgo } from '@/lib/format'
import { ROLE_LABELS } from '@/lib/rbac'
import type { TeamRole } from '@prisma/client'
import type { ConversationSummary } from '@/lib/queries'
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

type Teammate = {
  userId: string
  fullName: string
  role: TeamRole
  color: string
}

type ThreadMessage = {
  id: string
  conversationId: string
  senderUserId: string
  body: string
  createdAt: string
  sender: { id: string; fullName: string; avatarUrl: string | null }
  attachments: { id: string; fileName: string; fileType: string; fileSize: number; fileUrl: string }[]
  reactions: { id: string; emoji: string; userId: string; user: { id: string; fullName: string } }[]
}

type ThreadData = {
  id: string
  isGroup: boolean
  title: string | null
  participants: { userId: string; user: { id: string; fullName: string; avatarUrl: string | null } }[]
  messages: ThreadMessage[]
}

type Props = {
  session: { userId: string; fullName: string }
  businessId: string
  conversations: ConversationSummary[]
  activeConversationId: string | null
  teammates: Teammate[]
  thread: ThreadData | null
}

export function MesajlarBoard({
  session,
  businessId,
  conversations,
  activeConversationId,
  teammates,
  thread,
}: Props) {
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

  const partner = thread?.participants.find((p) => p.userId !== session.userId)?.user ?? null
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
          {/* Conversation rail */}
          <aside
            className={cn(
              'flex flex-col border-r bg-white',
              activeConversationId && 'hidden lg:flex'
            )}
          >
            <div className="border-b p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Sohbet ara…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {filteredConversations.length === 0 ? (
                <RailEmpty onCompose={() => setComposeOpen(true)} />
              ) : (
                <ul className="divide-y divide-border/40">
                  {filteredConversations.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => {
                          router.push(`/dashboard/mesajlar?conversation=${c.id}`)
                        }}
                        className={cn(
                          'flex w-full items-start gap-3 px-3 py-3 text-left transition hover:bg-dashboard-surface',
                          activeConversationId === c.id && 'bg-brand-teal/[0.06]'
                        )}
                      >
                        <UserAvatar fullName={c.partner?.fullName ?? c.title ?? '?'} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-brand-ink">
                              {c.partner?.fullName ?? c.title ?? 'Sohbet'}
                            </p>
                            {c.lastMessageAt && (
                              <span className="shrink-0 text-[10px] text-muted-foreground">
                                {formatTimeAgo(c.lastMessageAt)}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2">
                            <p
                              className={cn(
                                'min-w-0 flex-1 truncate text-xs',
                                c.unreadCount > 0
                                  ? 'font-semibold text-brand-ink'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {c.lastMessage?.senderUserId === session.userId && 'Siz: '}
                              {c.lastMessage?.body ?? 'Henüz mesaj yok'}
                            </p>
                            {c.unreadCount > 0 && (
                              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-danger px-1.5 text-[10px] font-bold text-white">
                                {c.unreadCount > 9 ? '9+' : c.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </aside>

          {/* Thread */}
          <section className="flex min-w-0 flex-col bg-dashboard-bg/40">
            {!thread ? (
              <ThreadEmpty onCompose={() => setComposeOpen(true)} />
            ) : (
              <>
                <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/mesajlar')}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-dashboard-surface lg:hidden"
                    aria-label="Sohbet listesine dön"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <UserAvatar fullName={partner?.fullName ?? thread.title ?? '?'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">
                      {partner?.fullName ?? thread.title ?? 'Sohbet'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {thread.isGroup ? 'Grup sohbeti' : 'Bire bir mesaj'}
                    </p>
                  </div>
                  {thread.isGroup && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMembersOpen(true)}
                      className="gap-1"
                    >
                      <UserPlus className="h-4 w-4" />
                      Üyeler
                    </Button>
                  )}
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
                  {allMessages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <MessageCircle className="mb-2 h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium text-brand-ink">
                        Henüz mesaj yok
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        İlk mesajı göndererek konuşmayı başlatın.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {allMessages.map((m, i) => {
                        const mine = m.senderUserId === session.userId
                        const prev = allMessages[i - 1]
                        const showSender = !prev || prev.senderUserId !== m.senderUserId
                        return (
                          <li
                            key={m.id}
                            className={cn(
                              'flex items-end gap-2',
                              mine ? 'flex-row-reverse' : 'flex-row'
                            )}
                          >
                            {!mine && showSender ? (
                              <UserAvatar fullName={m.sender.fullName} size="sm" />
                            ) : (
                              <span className="h-7 w-7 shrink-0" />
                            )}
                            <div
                              className={cn(
                                'max-w-[70%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm',
                                mine
                                  ? 'rounded-br-sm bg-brand-teal text-white'
                                  : 'rounded-bl-sm bg-white text-brand-ink'
                              )}
                            >
                              {showSender && !mine && (
                                <p className="mb-0.5 text-[10px] font-semibold text-brand-teal">
                                  {m.sender.fullName}
                                </p>
                              )}
                              {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                              {m.attachments.length > 0 && (
                                <div className={cn('mt-2 space-y-1', !m.body && 'mt-0')}>
                                  {m.attachments.map((a) => (
                                    <a
                                      key={a.id}
                                      href={a.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={cn(
                                        'flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs',
                                        mine ? 'bg-white/15 text-white' : 'bg-dashboard-bg text-brand-ink'
                                      )}
                                    >
                                      <Paperclip className="h-3.5 w-3.5" />
                                      <span className="min-w-0 flex-1 truncate">{a.fileName}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                              <p
                                className={cn(
                                  'mt-1 text-[10px]',
                                  mine ? 'text-white/70' : 'text-muted-foreground'
                                )}
                              >
                                {formatTimeAgo(m.createdAt)}
                                {mine && <CheckCheck className="ml-1 inline h-3 w-3" />}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-1">
                                {m.reactions.map((r) => (
                                  <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => handleToggleReaction(m.id, r.emoji)}
                                    className={cn(
                                      'rounded-full px-1.5 py-0.5 text-[11px]',
                                      r.userId === session.userId
                                        ? 'bg-white/25'
                                        : mine
                                          ? 'bg-white/10'
                                          : 'bg-emerald-50'
                                    )}
                                    title={r.user.fullName}
                                  >
                                    {r.emoji}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => handleToggleReaction(m.id, '👍')}
                                  className={cn('rounded-full p-0.5', mine ? 'text-white/80' : 'text-muted-foreground')}
                                  title="Tepki ekle"
                                >
                                  <SmilePlus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>

                <div className="border-t bg-white p-3">
                  {attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {attachments.map((file, index) => (
                        <button
                          key={`${file.name}-${index}`}
                          type="button"
                          onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                          className="inline-flex max-w-[220px] items-center gap-1 rounded-full bg-dashboard-bg px-2 py-1 text-xs text-brand-ink"
                          title="Kaldır"
                        >
                          <Paperclip className="h-3 w-3" />
                          <span className="truncate">{file.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <label className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border text-muted-foreground hover:bg-dashboard-surface" title="Dosya ekle">
                      <Paperclip className="h-4 w-4" />
                      <input
                        id="chat-attachment"
                        name="attachments"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={(event) => {
                          const files = Array.from(event.target.files ?? []).slice(0, 5)
                          setAttachments((prev) => [...prev, ...files].slice(0, 5))
                          event.target.value = ''
                        }}
                      />
                    </label>
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend()
                        }
                      }}
                      placeholder="Mesajınızı yazın… (Enter ile gönder, Shift+Enter ile yeni satır)"
                      className="min-h-[44px] flex-1 resize-none"
                      rows={1}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={pending || (!draft.trim() && attachments.length === 0)}
                      className="h-11 bg-brand-teal text-white hover:bg-brand-teal-hover"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </Card>

      <Sheet open={composeOpen} onOpenChange={setComposeOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="border-b pb-3">
            <SheetTitle className="text-brand-ink">Yeni sohbet</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={!groupMode ? 'default' : 'outline'} onClick={() => setGroupMode(false)} className={!groupMode ? 'bg-brand-teal text-white hover:bg-brand-teal-hover' : ''}>
                <UserCircle2 className="mr-1.5 h-4 w-4" />
                Bire bir
              </Button>
              <Button type="button" variant={groupMode ? 'default' : 'outline'} onClick={() => setGroupMode(true)} className={groupMode ? 'bg-brand-teal text-white hover:bg-brand-teal-hover' : ''}>
                <Users className="mr-1.5 h-4 w-4" />
                Grup
              </Button>
            </div>
            {groupMode && <Input value={groupTitle} onChange={(e) => setGroupTitle(e.target.value)} placeholder="Grup adı" />}
            <p className="text-xs text-muted-foreground">
              Sohbet başlatmak istediğiniz ekip üyesini seçin.
            </p>
            {teammates.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-white p-6 text-center">
                <UserCircle2 className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium text-brand-ink">Ekipte başka kullanıcı yok</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ekip ayarlarından bir üye davet edip aktive ettikten sonra sohbet başlatabilirsiniz.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/40 rounded-2xl border bg-white">
                {teammates.map((t) => (
                  <li key={t.userId}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!groupMode) {
                          handleStartConversation(t.userId)
                          return
                        }
                        setGroupUsers((prev) =>
                          prev.includes(t.userId)
                            ? prev.filter((id) => id !== t.userId)
                            : [...prev, t.userId]
                        )
                      }}
                      disabled={pending}
                      className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-dashboard-surface disabled:opacity-60"
                    >
                      <UserAvatar fullName={t.fullName} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-ink">{t.fullName}</p>
                        <p className="text-[11px] text-muted-foreground">{ROLE_LABELS[t.role]}</p>
                      </div>
                      {groupMode && (
                        <span
                          className={cn(
                            'h-5 w-5 rounded-full border',
                            groupUsers.includes(t.userId) && 'border-brand-teal bg-brand-teal'
                          )}
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {groupMode && teammates.length > 0 && (
              <Button
                type="button"
                disabled={pending || !groupTitle.trim() || groupUsers.length === 0}
                onClick={handleCreateGroup}
                className="w-full bg-brand-teal text-white hover:bg-brand-teal-hover"
              >
                Grup Sohbeti Oluştur
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={membersOpen} onOpenChange={setMembersOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="border-b pb-3">
            <SheetTitle className="text-brand-ink">Grup üyeleri</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Aktif üyeler</p>
              <ul className="divide-y divide-border/40 rounded-2xl border bg-white">
                {(thread?.participants ?? []).map((p) => (
                  <li key={p.userId} className="flex items-center gap-3 px-3 py-3">
                    <UserAvatar fullName={p.user.fullName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">{p.user.fullName}</p>
                    </div>
                    {p.userId !== session.userId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() => handleRemoveGroupMember(p.userId)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-brand-danger-strong"
                        title="Gruptan çıkar"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Ekle</p>
              {addableTeammates.length === 0 ? (
                <p className="rounded-2xl border border-dashed bg-white p-4 text-sm text-muted-foreground">
                  Eklenebilecek başka ekip üyesi yok.
                </p>
              ) : (
                <ul className="divide-y divide-border/40 rounded-2xl border bg-white">
                  {addableTeammates.map((t) => (
                    <li key={t.userId}>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleAddGroupMember(t.userId)}
                        className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-dashboard-surface disabled:opacity-60"
                      >
                        <UserAvatar fullName={t.fullName} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-brand-ink">{t.fullName}</p>
                          <p className="text-[11px] text-muted-foreground">{ROLE_LABELS[t.role]}</p>
                        </div>
                        <UserPlus className="h-4 w-4 text-brand-teal" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function UserAvatar({ fullName, size = 'md' }: { fullName: string; size?: 'sm' | 'md' }) {
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return (
    <Avatar className={cn(size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-10 w-10')}>
      <AvatarFallback
        className="font-bold text-white"
        style={{ background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-cyan))' }}
      >
        {initials || '?'}
      </AvatarFallback>
    </Avatar>
  )
}

function RailEmpty({ onCompose }: { onCompose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <MessageCircle className="mb-3 h-8 w-8 text-muted-foreground/60" />
      <p className="text-sm font-semibold text-brand-ink">Henüz sohbetiniz yok</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        Sağ üstteki "Yeni Sohbet" düğmesi ile ekip arkadaşınıza ilk mesajı gönderin.
      </p>
      <Button variant="outline" size="sm" onClick={onCompose} className="mt-3">
        Yeni Sohbet
      </Button>
    </div>
  )
}

function ThreadEmpty({ onCompose }: { onCompose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-teal/10 text-brand-teal">
        <MessageCircle className="h-6 w-6" />
      </div>
      <p className="text-base font-semibold text-brand-ink">Bir sohbet seçin</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Soldaki listeden bir sohbet açın veya yeni bir tane başlatın.
      </p>
      <Button onClick={onCompose} className="mt-4 bg-brand-teal text-white hover:bg-brand-teal-hover">
        <Plus className="mr-1.5 h-4 w-4" />
        Yeni Sohbet
      </Button>
    </div>
  )
}
