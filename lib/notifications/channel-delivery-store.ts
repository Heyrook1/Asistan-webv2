import 'server-only'

import { prisma } from '@/lib/prisma'
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
  try {
    await prisma.patientChannelAttempt.createMany({
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
}

export async function getBusinessChannelDeliveryStats(
  businessId: string,
  windowHours = 24
): Promise<BusinessChannelDeliveryStats> {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000)
  let rows: Array<{ channel: string; status: string; provider: string | null }> = []
  try {
    rows = await prisma.patientChannelAttempt.findMany({
      where: { businessId, createdAt: { gte: since } },
      select: { channel: true, status: true, provider: true },
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
    }
  }

  const results: ChannelAttemptResult[] = rows.map((r) => ({
    ok: r.status === 'sent',
    status: r.status as ChannelDeliveryStatus,
    channel: r.channel as ReminderChannel,
    provider: r.provider ?? r.channel,
  }))

  const rate = providerDeliveryRate(results)
  return {
    windowHours,
    attempted: results.filter((r) => r.status !== 'not_configured').length,
    sent: results.filter((r) => r.status === 'sent').length,
    errors: results.filter((r) => r.status === 'error').length,
    notConfigured: results.filter((r) => r.status === 'not_configured').length,
    rate,
    meetsOpsGate: rate == null ? null : rate >= OPS_GATE,
  }
}
