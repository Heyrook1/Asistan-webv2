'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type IncomingMessage = {
  id: string
  conversationId: string
  senderUserId: string
  body: string
  createdAt: string
}

type Options = {
  /** When set, the stream only fires `onIncoming` for messages on this
   *  conversation. The polling watermark is per-conversation. */
  conversationId?: string
  /** Used to skip messages sent by the caller (we already render them). */
  selfUserId: string
  pollMs?: number
  latestCreatedAt?: string | null
  onIncoming?: (m: IncomingMessage) => void
  onThreadChanged?: () => void
}

/**
 * Realtime + polling stream for messages. Mirrors the notification stream so
 * the two pieces stay swappable.
 */
export function useMessageStream({
  conversationId,
  selfUserId,
  pollMs = 8_000,
  latestCreatedAt,
  onIncoming,
  onThreadChanged,
}: Options) {
  const router = useRouter()
  const onIncomingRef = useRef(onIncoming)
  const onThreadChangedRef = useRef(onThreadChanged)
  onIncomingRef.current = onIncoming
  onThreadChangedRef.current = onThreadChanged

  const watermarkRef = useRef<string>(latestCreatedAt ?? new Date(0).toISOString())
  useEffect(() => {
    if (latestCreatedAt && latestCreatedAt > watermarkRef.current) {
      watermarkRef.current = latestCreatedAt
    }
  }, [latestCreatedAt])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    try {
      const supabase = createClient()
      const filter = conversationId ? `conversationId=eq.${conversationId}` : undefined
      const channel = supabase
        .channel(`messages:${conversationId ?? 'all'}:${selfUserId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'Message', filter },
          (payload) => {
            const row = payload.new as IncomingMessage | undefined
            if (!row) return
            if (row.senderUserId === selfUserId) return
            if (row.createdAt > watermarkRef.current) {
              watermarkRef.current = row.createdAt
              onIncomingRef.current?.(row)
            }
            router.refresh()
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'MessageReaction' },
          () => {
            onThreadChangedRef.current?.()
            router.refresh()
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'ConversationParticipant' },
          () => {
            onThreadChangedRef.current?.()
            router.refresh()
          }
        )
        .subscribe()
      unsubscribe = () => {
        supabase.removeChannel(channel)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[useMessageStream] realtime unavailable:', error)
      }
    }

    async function poll() {
      if (document.visibilityState !== 'visible') return
      const url = new URL('/api/messages/since', window.location.origin)
      url.searchParams.set('after', watermarkRef.current)
      if (conversationId) url.searchParams.set('conversationId', conversationId)
      try {
        const res = await fetch(url.toString(), { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { messages: IncomingMessage[] }
        if (data.messages.length === 0) return
        let triggered = false
        for (const m of data.messages) {
          if (m.createdAt > watermarkRef.current) watermarkRef.current = m.createdAt
          if (m.senderUserId !== selfUserId) {
            triggered = true
            onIncomingRef.current?.(m)
          }
        }
        if (triggered) router.refresh()
      } catch {
        /* network blip */
      }
    }

    const interval = window.setInterval(poll, pollMs)
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
  }, [conversationId, selfUserId, pollMs, router])
}
