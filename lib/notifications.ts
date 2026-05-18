import 'server-only'

import { env } from '@/lib/env'

export type ReminderChannel = 'email' | 'sms' | 'whatsapp'

export type ReminderPayload = {
  businessId: string
  appointmentId: string
  patientId: string
  to: string
  patientName: string
  serviceName: string
  startsAt: string
  locale?: string
}

export type ReminderResult =
  | { ok: true; provider: string; channel: ReminderChannel; externalId?: string }
  | { ok: false; provider: string; channel: ReminderChannel; error: string }

type ProviderConfig = {
  name: string
  webhookUrl?: string
}

function providerFor(channel: ReminderChannel): ProviderConfig {
  switch (channel) {
    case 'email':
      return { name: 'email-webhook', webhookUrl: env.EMAIL_PROVIDER_WEBHOOK_URL }
    case 'sms':
      return { name: 'sms-webhook', webhookUrl: env.SMS_PROVIDER_WEBHOOK_URL }
    case 'whatsapp':
      return { name: 'whatsapp-webhook', webhookUrl: env.WHATSAPP_PROVIDER_WEBHOOK_URL }
  }
}

export async function sendAppointmentReminder(
  channel: ReminderChannel,
  payload: ReminderPayload
): Promise<ReminderResult> {
  const provider = providerFor(channel)
  if (!provider.webhookUrl) {
    return {
      ok: false,
      provider: provider.name,
      channel,
      error: `${channel} reminder provider is not configured`,
    }
  }

  const response = await fetch(provider.webhookUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(env.NOTIFICATION_PROVIDER_TOKEN
        ? { authorization: `Bearer ${env.NOTIFICATION_PROVIDER_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({ channel, payload }),
  })

  if (!response.ok) {
    return {
      ok: false,
      provider: provider.name,
      channel,
      error: `Provider responded with ${response.status}`,
    }
  }

  const data = (await response.json().catch(() => ({}))) as { id?: string; externalId?: string }
  return {
    ok: true,
    provider: provider.name,
    channel,
    externalId: data.externalId ?? data.id,
  }
}
