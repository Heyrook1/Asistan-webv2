import 'server-only'

import webpush from 'web-push'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

let configured = false

function ensureConfigured(): boolean {
  if (configured) return true
  if (!env.webPushVapidPublic || !env.webPushVapidPrivate) {
    return false
  }
  webpush.setVapidDetails(
    `mailto:${env.webPushContactEmail ?? 'admin@asistan.health'}`,
    env.webPushVapidPublic,
    env.webPushVapidPrivate
  )
  configured = true
  return true
}

type DispatchInput = {
  userIds: string[]
  payload: {
    id: string
    title: string
    body: string
    url?: string
    tag?: string
  }
}

/**
 * Sends a Web Push payload to every active subscription belonging to the given
 * users. Best-effort: failures don't throw. Stale subscriptions (410/404) are
 * pruned from the database.
 */
export async function dispatchPush({ userIds, payload }: DispatchInput): Promise<void> {
  if (userIds.length === 0) return
  if (!ensureConfigured()) return

  const subs = await prisma.pushSubscription.findMany({
    where: { userId: { in: userIds } },
  })
  if (subs.length === 0) return

  const body = JSON.stringify({
    id: payload.id,
    title: payload.title,
    body: payload.body,
    url: payload.url ?? '/dashboard/bildirimler',
    tag: payload.tag ?? `asistan-${payload.id}`,
  })

  const staleIds: string[] = []

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
          { TTL: 60 * 60 }
        )
        // Best-effort timestamp update — don't fail dispatch on a DB hiccup.
        prisma.pushSubscription
          .update({ where: { id: sub.id }, data: { lastUsedAt: new Date() } })
          .catch(() => {})
      } catch (error) {
        const status = (error as { statusCode?: number })?.statusCode
        if (status === 404 || status === 410) {
          staleIds.push(sub.id)
        } else if (process.env.NODE_ENV !== 'production') {
          console.warn('[push] dispatch failed for', sub.endpoint.slice(0, 60), error)
        }
      }
    })
  )

  if (staleIds.length) {
    await prisma.pushSubscription
      .deleteMany({ where: { id: { in: staleIds } } })
      .catch(() => {})
  }
}
