'use client'

import { MessageCircle, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ConversationSummary } from '@/lib/queries'
import { formatTimeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

import { UserAvatar } from './mesajlar-user-avatar'

type ConversationRailProps = {
  activeConversationId: string | null
  searchTerm: string
  onSearchChange: (value: string) => void
  conversations: ConversationSummary[]
  selfUserId: string
  onSelectConversation: (conversationId: string) => void
  onCompose: () => void
}

export function ConversationRail({
  activeConversationId,
  searchTerm,
  onSearchChange,
  conversations,
  selfUserId,
  onSelectConversation,
  onCompose,
}: ConversationRailProps) {
  return (
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <RailEmpty onCompose={onCompose} />
        ) : (
          <ul className="divide-y divide-border/40">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelectConversation(c.id)}
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
                        {c.lastMessage?.senderUserId === selfUserId && 'Siz: '}
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
  )
}

export function RailEmpty({ onCompose }: { onCompose: () => void }) {
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
