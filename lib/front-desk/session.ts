import 'server-only'

import { prisma } from '@/lib/prisma'
import {
  FRONT_DESK_SESSION_TTL_MS,
  emptyDraft,
  type FrontDeskDraft,
  type FrontDeskStep,
} from './types'

export async function loadFrontDeskSession(input: {
  businessId: string
  peerKey: string
  channel?: string
}) {
  const channel = input.channel ?? 'whatsapp'
  const now = new Date()
  const existing = await prisma.frontDeskSession.findUnique({
    where: {
      businessId_channel_peerKey: {
        businessId: input.businessId,
        channel,
        peerKey: input.peerKey,
      },
    },
  })

  if (existing && existing.expiresAt > now) {
    return {
      id: existing.id,
      step: existing.step as FrontDeskStep,
      draft: (existing.draft ?? {}) as FrontDeskDraft,
      lastInboundId: existing.lastInboundId,
    }
  }

  const expiresAt = new Date(now.getTime() + FRONT_DESK_SESSION_TTL_MS)
  const row = await prisma.frontDeskSession.upsert({
    where: {
      businessId_channel_peerKey: {
        businessId: input.businessId,
        channel,
        peerKey: input.peerKey,
      },
    },
    create: {
      businessId: input.businessId,
      channel,
      peerKey: input.peerKey,
      step: 'idle',
      draft: emptyDraft(),
      expiresAt,
    },
    update: {
      step: 'idle',
      draft: emptyDraft(),
      expiresAt,
      lastInboundId: null,
    },
  })

  return {
    id: row.id,
    step: 'idle' as FrontDeskStep,
    draft: emptyDraft(),
    lastInboundId: null as string | null,
  }
}

export async function saveFrontDeskSession(input: {
  businessId: string
  peerKey: string
  channel?: string
  step: FrontDeskStep
  draft: FrontDeskDraft
  lastInboundId?: string | null
}) {
  const channel = input.channel ?? 'whatsapp'
  const expiresAt = new Date(Date.now() + FRONT_DESK_SESSION_TTL_MS)
  await prisma.frontDeskSession.upsert({
    where: {
      businessId_channel_peerKey: {
        businessId: input.businessId,
        channel,
        peerKey: input.peerKey,
      },
    },
    create: {
      businessId: input.businessId,
      channel,
      peerKey: input.peerKey,
      step: input.step,
      draft: input.draft,
      lastInboundId: input.lastInboundId ?? null,
      expiresAt,
    },
    update: {
      step: input.step,
      draft: input.draft,
      lastInboundId: input.lastInboundId ?? undefined,
      expiresAt,
    },
  })
}
