/**
 * Product funnel instrumentation (trial → book → reminder delivered → deposit).
 * Writes AuditLog rows with action prefix `funnel.` — no PHI in metadata.
 */
import 'server-only'

import { writeAuditLog } from '@/lib/audit'
import { log } from '@/lib/observability/logger'

export type FunnelStep =
  | 'book_requested'
  | 'book_confirmed'
  | 'reminder_attempted'
  | 'reminder_delivered'
  | 'reminder_failed'
  | 'deposit_pending'
  | 'deposit_paid'
  | 'deposit_failed'

export type FunnelEventInput = {
  step: FunnelStep
  businessId?: string | null
  appointmentId?: string | null
  /** Opaque provider/channel code — never phone/email */
  channel?: string | null
  ok?: boolean
  metadata?: Record<string, string | number | boolean | null | undefined>
}

export function trackFunnelEvent(input: FunnelEventInput): void {
  const action = `funnel.${input.step}`
  log.info(action, {
    businessId: input.businessId ?? undefined,
    appointmentId: input.appointmentId ?? undefined,
    channel: input.channel ?? undefined,
    ok: input.ok,
  })

  void writeAuditLog({
    businessId: input.businessId ?? null,
    actorUserId: null,
    action,
    entityType: input.appointmentId ? 'Appointment' : 'Funnel',
    entityId: input.appointmentId ?? null,
    summary: action,
    metadata: {
      channel: input.channel ?? null,
      ok: input.ok ?? null,
      ...(input.metadata ?? {}),
    },
  }).catch(() => null)
}
