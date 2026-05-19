'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatTimeAgo } from '@/lib/format'
import { iconForSubtype } from '@/lib/notifications/icons'
import {
  NOTIFICATION_PRIORITY_COLORS,
  NOTIFICATION_PRIORITY_LABELS,
  type NotificationListItem,
} from '@/lib/notifications/types'
import {
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/actions/notifications'
import { useNotificationStream } from '@/hooks/use-notification-stream'

type Props = {
  businessId: string
  userId: string
  notifications: NotificationListItem[]
  unreadCount: number
  variant?: 'desktop' | 'mobile'
}

export function NotificationBell({
  businessId,
  userId,
  notifications,
  unreadCount,
  variant = 'desktop',
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [pulse, setPulse] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const latestCreatedAt = notifications[0]?.createdAt ?? null

  useNotificationStream({
    businessId,
    userId,
    latestCreatedAt,
    onIncoming: ({ title, message, link, id }) => {
      setPulse(true)
      window.setTimeout(() => setPulse(false), 3500)

      // Toast (in-app)
      toast(title, { description: message })

      // Subtle sound — guarded with try/catch because autoplay can be blocked.
      try {
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          void audioRef.current.play()
        }
      } catch {
        /* user-gesture not yet captured — silent fallback */
      }

      // OS-level notification (foreground push, works while the tab is open).
      // The service worker handles push events when the tab is closed.
      try {
        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted' &&
          document.visibilityState !== 'visible'
        ) {
          const n = new Notification(title, {
            body: message,
            icon: '/favicon.ico',
            tag: `asistan-${id}`,
          })
          n.onclick = () => {
            window.focus()
            if (link) window.location.assign(link)
            n.close()
          }
        }
      } catch {
        /* notifications unsupported */
      }
    },
  })

  const preview = useMemo(() => notifications.slice(0, 5), [notifications])
  const safeUnread = Math.max(0, unreadCount)

  function handleRead(id: string) {
    startTransition(async () => {
      const result = await markNotificationRead({ id })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Bildirim okundu')
      router.refresh()
    })
  }

  function handleReadAll() {
    startTransition(async () => {
      const result = await markAllNotificationsRead()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Tüm bildirimler okundu işaretlendi')
      router.refresh()
    })
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <audio ref={audioRef} preload="auto" src="/notification.wav" />
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Bildirimler"
          className={cn(
            'relative inline-flex items-center justify-center rounded-xl text-foreground/70 transition hover:bg-[#F7F8FB]',
            variant === 'desktop' ? 'h-10 w-10' : 'h-10 w-10'
          )}
        >
          <Bell
            className={cn(
              'h-[18px] w-[18px] transition-colors',
              pulse && 'text-[#12C8AD]'
            )}
          />
          {safeUnread > 0 && (
            <span
              className={cn(
                'absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF4D4F] px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white',
                (pulse || safeUnread > 0) && 'animate-pulse'
              )}
            >
              {safeUnread > 9 ? '9+' : safeUnread}
            </span>
          )}
          {pulse && (
            <span className="pointer-events-none absolute inset-0 rounded-xl bg-[#12C8AD]/15 animate-ping" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[360px] rounded-2xl border-border/40 p-0 shadow-xl"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#0C1D36]">Bildirimler</span>
            {safeUnread > 0 && (
              <Badge variant="secondary" className="bg-[#FF4D4F]/10 text-[#C22326] border-0 text-[10px]">
                {safeUnread} yeni
              </Badge>
            )}
          </div>
          {safeUnread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReadAll}
              disabled={pending}
              className="h-8 gap-1 px-2 text-xs text-[#12C8AD] hover:bg-[#12C8AD]/10 hover:text-[#0b7f6f]"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Tümünü okundu yap
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />

        {preview.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12C8AD]/10 text-[#0b7f6f]">
              <Bell className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-[#0C1D36]">Henüz bildiriminiz yok.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Size atanan randevular ve hasta kartı güncellemeleri burada görünecek.
            </p>
          </div>
        ) : (
          <ul className="max-h-[360px] overflow-y-auto divide-y divide-border/40">
            {preview.map((n) => {
              const Icon = iconForSubtype(n.subtype)
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!n.isRead) handleRead(n.id)
                      if (n.link) {
                        setOpen(false)
                        router.push(n.link)
                      }
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#F7F9FB]',
                      !n.isRead && 'bg-[#12C8AD]/[0.04]'
                    )}
                  >
                    <div
                      className={cn(
                        'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                        n.priority === 'URGENT'
                          ? 'bg-rose-100 text-rose-600'
                          : n.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-[#12C8AD]/10 text-[#0b7f6f]'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!n.isRead && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF4D4F]" />
                        )}
                        <p className="truncate text-sm font-semibold text-[#0C1D36]">
                          {n.title}
                        </p>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.message}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{formatTimeAgo(n.createdAt)}</span>
                        {n.actor && (
                          <>
                            <span>•</span>
                            <span className="truncate">{n.actor.fullName}</span>
                          </>
                        )}
                        {n.priority !== 'NORMAL' && (
                          <>
                            <span>•</span>
                            <span
                              className={cn(
                                'rounded-full border px-1.5 py-px',
                                NOTIFICATION_PRIORITY_COLORS[n.priority]
                              )}
                            >
                              {NOTIFICATION_PRIORITY_LABELS[n.priority]}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <DropdownMenuSeparator className="m-0" />
        <Link
          href="/dashboard/bildirimler"
          onClick={() => setOpen(false)}
          className="block px-4 py-3 text-center text-sm font-semibold text-[#12C8AD] transition hover:bg-[#12C8AD]/5"
        >
          Tüm Bildirimleri Gör →
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
