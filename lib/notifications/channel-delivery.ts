/**
 * Pure delivery status helpers for patient SMS / WhatsApp / email.
 * No server-only — safe for unit tests and client toast formatting.
 */

export type ReminderChannel = 'email' | 'sms' | 'whatsapp'

export type ChannelDeliveryStatus = 'sent' | 'not_configured' | 'error'

export type ChannelAttemptResult = {
  ok: boolean
  status: ChannelDeliveryStatus
  channel: ReminderChannel
  provider: string
  externalId?: string
  error?: string
}

export type PatientChannelOutcome = 'sent' | 'not_configured' | 'error' | 'skipped'

export type PatientChannelSummary = {
  attempts: number
  sent: number
  notConfigured: number
  errors: number
  outcome: PatientChannelOutcome
  /** Short TR line for toast / notification message */
  label: string
  /** Per-channel status for structured UI */
  byChannel: Array<{ channel: ReminderChannel; status: ChannelDeliveryStatus }>
}

const CHANNEL_TR: Record<ReminderChannel, string> = {
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  email: 'e-posta',
}

const STATUS_TR: Record<ChannelDeliveryStatus, string> = {
  sent: 'gönderildi',
  not_configured: 'yapılandırılmadı',
  error: 'hata',
}

export function summarizePatientChannelResults(
  results: ChannelAttemptResult[],
): PatientChannelSummary {
  const byChannel = results.map((r) => ({ channel: r.channel, status: r.status }))
  const sent = results.filter((r) => r.status === 'sent').length
  const notConfigured = results.filter((r) => r.status === 'not_configured').length
  const errors = results.filter((r) => r.status === 'error').length
  const attempts = results.length

  if (attempts === 0) {
    return {
      attempts: 0,
      sent: 0,
      notConfigured: 0,
      errors: 0,
      outcome: 'skipped',
      label: 'Hasta bildirimi: iletişim bilgisi yok',
      byChannel: [],
    }
  }

  let outcome: PatientChannelOutcome
  if (sent > 0) outcome = 'sent'
  else if (errors > 0) outcome = 'error'
  else outcome = 'not_configured'

  const parts = byChannel.map(
    (row) => `${CHANNEL_TR[row.channel]} ${STATUS_TR[row.status]}`,
  )

  return {
    attempts,
    sent,
    notConfigured,
    errors,
    outcome,
    label: `Hasta bildirimi: ${parts.join(' · ')}`,
    byChannel,
  }
}

/** Delivery rate among attempts that were actually sent to a provider (excludes not_configured). */
export function providerDeliveryRate(results: ChannelAttemptResult[]): number | null {
  const attempted = results.filter((r) => r.status !== 'not_configured')
  if (attempted.length === 0) return null
  const sent = attempted.filter((r) => r.status === 'sent').length
  return sent / attempted.length
}
