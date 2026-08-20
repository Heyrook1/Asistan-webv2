import 'server-only'

import { catalogPrisma } from '@/lib/prisma-owner'
import {
  sendAppointmentReminder,
  type ReminderChannel,
  type ReminderPayload,
} from '@/lib/notifications/channels'
import { recordPatientChannelAttempts } from '@/lib/notifications/channel-delivery-store'

const MAX_ATTEMPTS = 6

/** Prisma client may lag behind schema until `prisma generate` (dev lock on Windows). */
type OutboxRow = {
  id: string
  businessId: string
  appointmentId: string | null
  patientId: string | null
  channel: string
  kind: string
  payload: unknown
  attempts: number
}

type OutboxDelegate = {
  create: (args: { data: Record<string, unknown> }) => Promise<unknown>
  findMany: (args: Record<string, unknown>) => Promise<OutboxRow[]>
  update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>
}

/** Owner/catalog — cron drains cross-tenant; asistan_app needs GUC per row. */
function outboxDelegate(): OutboxDelegate | null {
  const client = catalogPrisma() as unknown as { notificationOutbox?: OutboxDelegate }
  return client.notificationOutbox ?? null
}

function backoffMs(attempts: number): number {
  const minutes = Math.min(32, Math.pow(2, Math.max(0, attempts - 1)))
  return minutes * 60_000
}

export async function enqueueFailedChannelSend(input: {
  businessId: string
  appointmentId?: string
  patientId?: string
  channel: ReminderChannel
  kind: string
  payload: ReminderPayload
  lastError: string
}): Promise<void> {
  const outbox = outboxDelegate()
  if (!outbox) return
  try {
    await outbox.create({
      data: {
        businessId: input.businessId,
        appointmentId: input.appointmentId ?? null,
        patientId: input.patientId ?? null,
        channel: input.channel,
        kind: input.kind,
        payload: input.payload as object,
        status: 'pending',
        attempts: 0,
        nextAttemptAt: new Date(Date.now() + backoffMs(1)),
        lastError: input.lastError.slice(0, 500),
      },
    })
  } catch {
    // Soft-fail — never block booking/cancel on outbox write
  }
}

export async function processNotificationOutbox(limit = 40): Promise<{
  processed: number
  sent: number
  failed: number
  dead: number
}> {
  const outbox = outboxDelegate()
  if (!outbox) {
    return { processed: 0, sent: 0, failed: 0, dead: 0 }
  }

  const now = new Date()

  const rows: OutboxRow[] | null = await outbox
    .findMany({
      where: {
        status: 'pending',
        nextAttemptAt: { lte: now },
      },
      orderBy: { nextAttemptAt: 'asc' },
      take: limit,
    })
    .catch(() => null)
  if (!rows) {
    return { processed: 0, sent: 0, failed: 0, dead: 0 }
  }

  let sent = 0
  let failed = 0
  let dead = 0

  for (const row of rows) {
    const payload = row.payload as ReminderPayload
    const channel = row.channel as ReminderChannel
    let result
    try {
      result = await sendAppointmentReminder(channel, payload)
    } catch (error) {
      result = {
        ok: false as const,
        status: 'error' as const,
        provider: channel,
        channel,
        error: error instanceof Error ? error.message : 'outbox send failed',
      }
    }

    await recordPatientChannelAttempts({
      businessId: row.businessId,
      appointmentId: row.appointmentId ?? undefined,
      kind: row.kind,
      results: [result],
    })

    const nextAttempts = row.attempts + 1
    if (result.ok) {
      sent += 1
      await outbox.update({
        where: { id: row.id },
        data: {
          status: 'sent',
          attempts: nextAttempts,
          lastError: null,
        },
      })
      continue
    }

    if (result.status === 'not_configured' || nextAttempts >= MAX_ATTEMPTS) {
      dead += 1
      await outbox.update({
        where: { id: row.id },
        data: {
          status: 'dead',
          attempts: nextAttempts,
          lastError: result.error.slice(0, 500),
        },
      })
      continue
    }

    failed += 1
    await outbox.update({
      where: { id: row.id },
      data: {
        status: 'pending',
        attempts: nextAttempts,
        nextAttemptAt: new Date(Date.now() + backoffMs(nextAttempts + 1)),
        lastError: result.error.slice(0, 500),
      },
    })
  }

  return { processed: rows.length, sent, failed, dead }
}
