'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type IncomingNotification = {
  id: string
  title: string
  message: string
  link?: string | null
  createdAt: string
}

type Options = {
  businessId: string
  userId: string
  pollMs?: number
  /** ISO timestamp of the newest notification the page already has. Anything
   *  newer that appears via polling or realtime is treated as "new" and
   *  triggers the foreground hooks (toast, OS notification, sound). */
  latestCreatedAt?: string | null
  /** Fires when a new row appears. */
  onIncoming?: (n: IncomingNotification) => void
}

/**
 * Streams notification updates into the page.
 *
 * Order of operations:
 * 1. Subscribes to Supabase realtime (`postgres_changes` on `Notification`).
 *    If the publication doesn't include the table, this is a no-op and the
 *    polling loop covers it.
 * 2. Polls every `pollMs` ms (default 15s). Uses `latestCreatedAt` as the
 *    high-water mark and asks the server for newer rows — when any come
 *    back, fires `onIncoming` for each and refreshes the route so the rest
 *    of the page picks up the new state.
 * 3. Refreshes on visibility/focus.
 */
export function useNotificationStream({
  businessId,
  userId,
  pollMs = 15_000,
  latestCreatedAt,
  onIncoming,
}: Options) {
  const router = useRouter()
  const onIncomingRef = useRef(onIncoming)
  onIncomingRef.current = onIncoming

  const watermarkRef = useRef<string>(latestCreatedAt ?? new Date(0).toISOString())
  useEffect(() => {
    if (!latestCreatedAt) return
    if (latestCreatedAt > watermarkRef.current) watermarkRef.current = latestCreatedAt
  }, [latestCreatedAt])

  useEffect(() => {
    // ── Realtime channel (best-effort) ─────────────────────────────────────
    let unsubscribe: (() => void) | undefined
    try {
      const supabase = createClient()
      const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'Notification',
            filter: `userId=eq.${userId}`,
          },
          (payload) => {
            const row = payload.new as {
              id?: string
              title?: string
              message?: string
              link?: string | null
              createdAt?: string
              businessId?: string
            }
            if (row?.businessId && row.businessId !== businessId) return
            if (row?.id && row.title && row.message && row.createdAt) {
              if (row.createdAt > watermarkRef.current) {
                watermarkRef.current = row.createdAt
                onIncomingRef.current?.({
                  id: row.id,
                  title: row.title,
                  message: row.message,
                  link: row.link ?? null,
                  createdAt: row.createdAt,
                })
              }
            }
            router.refresh()
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'Notification',
            filter: `userId=eq.${userId}`,
          },
          () => router.refresh()
        )
        .subscribe()

      unsubscribe = () => {
        supabase.removeChannel(channel)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[useNotificationStream] realtime channel unavailable:', error)
      }
    }

    // ── Polling (also drives foreground notifications) ─────────────────────
    let unauthorized = false
    let interval = 0

    async function poll() {
      if (unauthorized || document.visibilityState !== 'visible') return
      try {
        const res = await fetch(
          `/api/notifications/since?after=${encodeURIComponent(watermarkRef.current)}`,
          { cache: 'no-store', credentials: 'same-origin' },
        )
        if (res.status === 401) {
          unauthorized = true
          if (interval) window.clearInterval(interval)
          router.replace('/auth/login?reason=session-expired')
          return
        }
        if (!res.ok) return
        const data = (await res.json()) as { notifications: IncomingNotification[] }
        if (data.notifications.length > 0) {
          for (const n of data.notifications) {
            if (n.createdAt > watermarkRef.current) watermarkRef.current = n.createdAt
            onIncomingRef.current?.(n)
          }
          router.refresh()
        }
      } catch {
        // Network blip — try again next tick.
      }
    }

    interval = window.setInterval(poll, pollMs)

    function onFocus() {
      if (document.visibilityState === 'visible') {
        poll()
        router.refresh()
      }
    }
    document.addEventListener('visibilitychange', onFocus)
    window.addEventListener('focus', onFocus)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onFocus)
      window.removeEventListener('focus', onFocus)
      unsubscribe?.()
    }
  }, [businessId, userId, pollMs, router])
}
