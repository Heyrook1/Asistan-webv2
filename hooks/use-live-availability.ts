'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  extractAvailabilitySlots,
  readJsonResponse,
  userMessageFromUnknown,
} from '@/lib/http/read-json'

export type LiveAvailabilitySlot = { startTime: string; endTime: string }

const DEFAULT_POLL_MS = 15_000

const INFRA_MSG_TR =
  'Sistem geçici olarak müsait saatleri gösteremiyor. Lütfen yenileyin.'
const INFRA_MSG_EN =
  'We cannot show open times right now. Please refresh and try again.'

/**
 * Live clinic agenda slots — refetches on change, tab focus, and a quiet poll.
 * Source of truth: GET /api/client/availability (working hours + busy + blocks).
 */
export function useLiveAvailability(input: {
  businessId: string
  doctorId: string | null
  serviceId: string | null
  date: string | null
  locationId?: string | null
  /** When false, no fetch/poll (e.g. wizard not on time step). */
  enabled?: boolean
  pollMs?: number
  lang?: 'tr' | 'en'
}) {
  const {
    businessId,
    doctorId,
    serviceId,
    date,
    locationId = null,
    enabled = true,
    pollMs = DEFAULT_POLL_MS,
    lang = 'tr',
  } = input

  const [slots, setSlots] = useState<LiveAvailabilitySlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [degraded, setDegraded] = useState(false)
  const [emptyReason, setEmptyReason] = useState<string | null>(null)
  const [syncedAt, setSyncedAt] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)
  const requestSeq = useRef(0)

  const refresh = useCallback(() => setRetryToken((n) => n + 1), [])

  useEffect(() => {
    if (!enabled || !businessId || !doctorId || !serviceId || !date) {
      setSlots([])
      setError(null)
      setDegraded(false)
      setEmptyReason(null)
      setLoading(false)
      setSyncedAt(null)
      return
    }

    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | null = null

    async function load(mode: 'hard' | 'soft') {
      const seq = ++requestSeq.current
      if (mode === 'hard') {
        setLoading(true)
        setError(null)
        setSlots([])
      }

      const params = new URLSearchParams({
        businessId,
        doctorId: doctorId!,
        serviceId: serviceId!,
        date: date!,
      })
      if (locationId) params.set('locationId', locationId)

      try {
        const res = await fetch(`/api/client/availability?${params.toString()}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        })
        const { ok, data } = await readJsonResponse(res, { kind: 'availability' })
        const {
          slots: nextSlots,
          errorMessage,
          degraded: nextDegraded,
          emptyReason: nextReason,
        } = extractAvailabilitySlots(data)
        if (!ok) {
          throw new Error(
            errorMessage || 'Uygun saatler şu anda alınamıyor. Lütfen tekrar deneyin.',
          )
        }
        if (cancelled || seq !== requestSeq.current) return

        const body = data as { syncedAt?: unknown }
        const infra = nextDegraded || nextReason === 'INFRA'
        setSlots(nextSlots)
        setDegraded(infra)
        setEmptyReason(nextReason)
        setError(
          infra
            ? lang === 'en'
              ? INFRA_MSG_EN
              : INFRA_MSG_TR
            : null,
        )
        setSyncedAt(
          typeof body?.syncedAt === 'string' ? body.syncedAt : new Date().toISOString(),
        )
      } catch (err) {
        if (cancelled || seq !== requestSeq.current) return
        if (mode === 'hard') {
          setSlots([])
          setDegraded(true)
          setEmptyReason('INFRA')
          setError(
            userMessageFromUnknown(
              err,
              lang === 'en' ? INFRA_MSG_EN : INFRA_MSG_TR,
            ),
          )
        }
      } finally {
        if (!cancelled && seq === requestSeq.current && mode === 'hard') {
          setLoading(false)
        }
      }
    }

    void load('hard')

    intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      void load('soft')
    }, pollMs)

    function onVisibility() {
      if (document.visibilityState === 'visible') void load('soft')
    }
    function onFocus() {
      void load('soft')
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', onFocus)

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', onFocus)
    }
  }, [
    businessId,
    doctorId,
    serviceId,
    date,
    locationId,
    enabled,
    pollMs,
    retryToken,
    lang,
  ])

  return { slots, loading, error, degraded, emptyReason, syncedAt, refresh }
}
