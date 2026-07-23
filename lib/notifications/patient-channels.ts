import 'server-only'

import {
  sendAppointmentReminder,
  getPatientOutboundChannelConfig,
  type ReminderChannel,
  type ReminderResult,
} from '@/lib/notifications/channels'
import {
  summarizePatientChannelResults,
  type PatientChannelSummary,
} from '@/lib/notifications/channel-delivery'
import { trackFunnelEvent } from '@/lib/observability/funnel'

export type PatientMessageKind =
  | 'confirm'
  | 'cancel'
  | 'reminder_24h'
  | 'reminder_2h'
  | 'slot_offer'

export type PatientMessageInput = {
  businessId: string
  appointmentId: string
  patientId: string
  patientName: string
  patientPhone?: string | null
  patientEmail?: string | null
  serviceName: string
  startsAt: string
  clinicName?: string
  kind: PatientMessageKind
}

export type { PatientChannelSummary }
export { getPatientOutboundChannelConfig, summarizePatientChannelResults }

/**
 * Best-effort patient outbound: SMS and/or WhatsApp when webhook env is set.
 * Never throws — booking/approve must succeed even if provider is down.
 */
export async function notifyPatientChannels(
  input: PatientMessageInput,
): Promise<ReminderResult[]> {
  const results: ReminderResult[] = []
  const channels: ReminderChannel[] = []
  if (input.patientPhone?.trim()) {
    channels.push('sms', 'whatsapp')
  }
  if (
    input.patientEmail?.trim() &&
    (input.kind === 'confirm' || input.kind === 'cancel')
  ) {
    channels.push('email')
  }

  const payloadBase = {
    businessId: input.businessId,
    appointmentId: input.appointmentId,
    patientId: input.patientId,
    patientName: input.patientName,
    serviceName: input.serviceName,
    startsAt: input.startsAt,
    locale: 'tr' as const,
    kind: input.kind,
    clinicName: input.clinicName,
  }

  for (const channel of channels) {
    const to =
      channel === 'email' ? input.patientEmail?.trim() : input.patientPhone?.trim()
    if (!to) continue
    try {
      results.push(
        await sendAppointmentReminder(channel, {
          ...payloadBase,
          to,
        }),
      )
    } catch (error) {
      results.push({
        ok: false,
        status: 'error',
        provider: channel,
        channel,
        error: error instanceof Error ? error.message : 'channel send failed',
      })
    }
  }

  // No phone/email/PII — ops can measure delivery without cleartext contact data.
  for (const result of results) {
    console.info('[patient-channel]', {
      appointmentId: input.appointmentId,
      businessId: input.businessId,
      kind: input.kind,
      channel: result.channel,
      provider: result.provider,
      status: result.status,
      ok: result.ok,
      ...(result.ok
        ? { externalId: result.externalId }
        : { error: result.error }),
    })
    trackFunnelEvent({
      step: result.ok ? 'reminder_delivered' : 'reminder_failed',
      businessId: input.businessId,
      appointmentId: input.appointmentId,
      channel: result.channel,
      ok: result.ok,
      metadata: {
        kind: input.kind,
        provider: result.provider,
        status: result.status,
      },
    })
  }

  if (results.length > 0) {
    const { recordPatientChannelAttempts } = await import(
      '@/lib/notifications/channel-delivery-store'
    )
    await recordPatientChannelAttempts({
      businessId: input.businessId,
      appointmentId: input.appointmentId,
      kind: input.kind,
      results,
    })
    trackFunnelEvent({
      step: 'reminder_attempted',
      businessId: input.businessId,
      appointmentId: input.appointmentId,
      ok: results.some((r) => r.ok),
      metadata: { kind: input.kind, attempts: results.length },
    })
  }

  return results
}

export function summarizeNotifyResults(results: ReminderResult[]): PatientChannelSummary {
  return summarizePatientChannelResults(results)
}

export function appointmentAjandaLink(appointmentId: string, status?: string) {
  const params = new URLSearchParams({ mode: 'liste', id: appointmentId })
  if (status) params.set('status', status)
  return `/dashboard/ajanda?${params.toString()}`
}
