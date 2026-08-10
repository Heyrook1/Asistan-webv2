import 'server-only'

import { catalogPrisma } from '@/lib/prisma-owner'
import {
  providerDeliveryRate,
  type ChannelAttemptResult,
  type ReminderChannel,
  type ChannelDeliveryStatus,
} from '@/lib/notifications/channel-delivery'

const OPS_GATE = 0.8

export async function recordPatientChannelAttempts(input: {
  businessId: string
  appointmentId?: string
  kind?: string
  results: ChannelAttemptResult[]
}) {
  if (input.results.length === 0) return
  const db = catalogPrisma()
  try {
    await db.patientChannelAttempt.createMany({
      data: input.results.map((r) => ({
        businessId: input.businessId,
        appointmentId: input.appointmentId ?? null,
        channel: r.channel,
        status: r.status,
        provider: r.provider,
        kind: input.kind ?? null,
      })),
    })
  } catch {
    // Soft-fail — never block booking/approve on metrics write
  }
}

export type BusinessChannelDeliveryStats = {
  windowHours: number
  attempted: number
  sent: number
  errors: number
  notConfigured: number
  rate: number | null
  meetsOpsGate: boolean | null
  lastSentAt: string | null
  lastErrorAt: string | null
  byChannel: Record<
    ReminderChannel,
    { sent: number; errors: number; notConfigured: number; lastAt: string | null }
  >
}

const EMPTY_CHANNEL = {
  sent: 0,
  errors: 0,
  notConfigured: 0,
  lastAt: null as string | null,
}

export async function getBusinessChannelDeliveryStats(
  businessId: string,
  windowHours = 24
): Promise<BusinessChannelDeliveryStats> {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000)
  const db = catalogPrisma()
  let rows: Array<{ channel: string; status: string; provider: string | null; createdAt: Date }>
  try {
    rows = await db.patientChannelAttempt.findMany({
      where: { businessId, createdAt: { gte: since } },
      select: { channel: true, status: true, provider: true, createdAt: true },
      take: 2000,
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    // Table may not be migrated yet — return empty stats (no fake %)
    return {
      windowHours,
      attempted: 0,
      sent: 0,
      errors: 0,
      notConfigured: 0,
      rate: null,
      meetsOpsGate: null,
      lastSentAt: null,
      lastErrorAt: null,
      byChannel: { sms: { ...EMPTY_CHANNEL }, whatsapp: { ...EMPTY_CHANNEL }, email: { ...EMPTY_CHANNEL } },
    }
  }

  const results: ChannelAttemptResult[] = rows.map((r) => ({
    ok: r.status === 'sent',
    status: r.status as ChannelDeliveryStatus,
    channel: r.channel as ReminderChannel,
    provider: r.provider ?? r.channel,
  }))

  const byChannel: BusinessChannelDeliveryStats['byChannel'] = {
    sms: { ...EMPTY_CHANNEL },
    whatsapp: { ...EMPTY_CHANNEL },
    email: { ...EMPTY_CHANNEL },
  }
  let lastSentAt: string | null = null
  let lastErrorAt: string | null = null
  for (const row of rows) {
    const ch = row.channel as ReminderChannel
    if (!(ch in byChannel)) continue
    const bucket = byChannel[ch]
    if (!bucket.lastAt) bucket.lastAt = row.createdAt.toISOString()
    if (row.status === 'sent') {
      bucket.sent += 1
      if (!lastSentAt) lastSentAt = row.createdAt.toISOString()
    } else if (row.status === 'error') {
      bucket.errors += 1
      if (!lastErrorAt) lastErrorAt = row.createdAt.toISOString()
    } else if (row.status === 'not_configured') {
      bucket.notConfigured += 1
    }
  }

  const rate = providerDeliveryRate(results)
  return {
    windowHours,
    attempted: results.filter((r) => r.status !== 'not_configured').length,
    sent: results.filter((r) => r.status === 'sent').length,
    errors: results.filter((r) => r.status === 'error').length,
    notConfigured: results.filter((r) => r.status === 'not_configured').length,
    rate,
    meetsOpsGate: rate == null ? null : rate >= OPS_GATE,
    lastSentAt,
    lastErrorAt,
    byChannel,
  }
}
