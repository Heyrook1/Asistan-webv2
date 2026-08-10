'use client'

import { useEffect } from 'react'

import {
  markPwaEngagement,
  type PwaEngagementReason,
} from '@/lib/pwa/engagement'

/** Fire-and-forget engagement signal for deferred PWA install prompt. */
export function MarkPwaEngagement({ reason }: { reason: PwaEngagementReason }) {
  useEffect(() => {
    markPwaEngagement(reason)
  }, [reason])

  return null
}
