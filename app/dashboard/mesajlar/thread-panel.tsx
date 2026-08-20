'use client'

import type { RefObject } from 'react'
import {
  ArrowLeft,
  CheckCheck,
  MessageCircle,
  Paperclip,
  Plus,
  Send,
  SmilePlus,
  UserPlus,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatTimeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

import type { ThreadData, ThreadMessage } from './mesajlar-types'
import { UserAvatar } from './mesajlar-user-avatar'

type ThreadPanelProps = {
  thread: ThreadData | null
  selfUserId: string
  messages: ThreadMessage[]
  scrollRef: RefObject<HTMLDivElement | null>
  draft: string
  onDraftChange: (value: string) => void
  attachments: File[]
  onAttachmentsChange: (files: File[] | ((prev: File[]) => File[])) => void
  pending: boolean
  onSend: () => void
  onToggleReaction: (messageId: string, emoji: string) => void
  onBack: () => void
  onOpenMembers: () => void
  onCompose: () => void
}

export function ThreadPanel({
  thread,
  selfUserId,
  messages,
  scrollRef,
  draft,
  onDraftChange,
  attachments,
  onAttachmentsChange,
  pending,
  onSend,
  onToggleReaction,
  onBack,
  onOpenMembers,
  onCompose,
}: ThreadPanelProps) {
  const partner = thread?.participants.find((p) => p.userId !== selfUserId)?.user ?? null

  return (
    <section className="flex min-w-0 flex-col bg-dashboard-bg/40">
      {!thread ? (
        <ThreadEmpty onCompose={onCompose} />
      ) : (
        <>
          <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
            <button
              type="button"
              onClick={onBack}
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
                onClick={onOpenMembers}
                className="gap-1"
              >
                <UserPlus className="h-4 w-4" />
                Üyeler
              </Button>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
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
                {messages.map((m, i) => {
                  const mine = m.senderUserId === selfUserId
                  const prev = messages[i - 1]
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
                              onClick={() => onToggleReaction(m.id, r.emoji)}
                              className={cn(
                                'rounded-full px-1.5 py-0.5 text-[11px]',
                                r.userId === selfUserId
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
                            onClick={() => onToggleReaction(m.id, '👍')}
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
                    onClick={() => onAttachmentsChange((prev) => prev.filter((_, i) => i !== index))}
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
                    onAttachmentsChange((prev) => [...prev, ...files].slice(0, 5))
                    event.target.value = ''
                  }}
                />
              </label>
              <Textarea
                value={draft}
                onChange={(e) => onDraftChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    onSend()
                  }
                }}
                placeholder="Mesajınızı yazın… (Enter ile gönder, Shift+Enter ile yeni satır)"
                className="min-h-[44px] flex-1 resize-none"
                rows={1}
              />
              <Button
                onClick={onSend}
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
  )
}

export function ThreadEmpty({ onCompose }: { onCompose: () => void }) {
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
