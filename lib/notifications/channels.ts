import 'server-only'

import { env } from '@/lib/env'
import type {
  ChannelDeliveryStatus,
  ReminderChannel,
} from '@/lib/notifications/channel-delivery'

export type { ReminderChannel }

export type ReminderPayload = {
  businessId: string
  appointmentId: string
  patientId: string
  to: string
  patientName: string
  serviceName: string
  startsAt: string
  locale?: string
  /** confirm | cancel | reminder_* — provider templates may branch on this */
  kind?: string
  clinicName?: string
}

export type ReminderResult =
  | {
      ok: true
      status: 'sent'
      provider: string
      channel: ReminderChannel
      externalId?: string
    }
  | {
      ok: false
      status: 'not_configured' | 'error'
      provider: string
      channel: ReminderChannel
      error: string
    }

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

export function getPatientOutboundChannelConfig(): {
  sms: boolean
  whatsapp: boolean
  email: boolean
  anyConfigured: boolean
} {
  const sms = Boolean(env.SMS_PROVIDER_WEBHOOK_URL)
  const whatsapp = Boolean(env.WHATSAPP_PROVIDER_WEBHOOK_URL)
  const email = Boolean(env.EMAIL_PROVIDER_WEBHOOK_URL)
  return { sms, whatsapp, email, anyConfigured: sms || whatsapp || email }
}

export async function sendAppointmentReminder(
  channel: ReminderChannel,
  payload: ReminderPayload
): Promise<ReminderResult> {
  const provider = providerFor(channel)
  if (!provider.webhookUrl) {
    return {
      ok: false,
      status: 'not_configured',
      provider: provider.name,
      channel,
      error: `${channel} reminder provider is not configured`,
    }
  }

  try {
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
        status: 'error' satisfies ChannelDeliveryStatus,
        provider: provider.name,
        channel,
        error: `Provider responded with ${response.status}`,
      }
    }

    const data = (await response.json().catch(() => ({}))) as {
      id?: string
      externalId?: string
    }
    return {
      ok: true,
      status: 'sent',
      provider: provider.name,
      channel,
      externalId: data.externalId ?? data.id,
    }
  } catch (error) {
    return {
      ok: false,
      status: 'error',
      provider: provider.name,
      channel,
      error: error instanceof Error ? error.message : 'channel send failed',
    }
  }
}
