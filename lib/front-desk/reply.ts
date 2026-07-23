import 'server-only'

import { env } from '@/lib/env'
import type { ReminderResult } from '@/lib/notifications/channels'

/**
 * Free-text WhatsApp reply via the same outbound webhook adapter.
 * Provider must accept { channel: 'whatsapp', payload: { kind: 'front_desk_reply', ... } }.
 */
export async function sendWhatsAppFrontDeskReply(input: {
  businessId: string
  to: string
  text: string
}): Promise<ReminderResult> {
  const webhookUrl = env.WHATSAPP_PROVIDER_WEBHOOK_URL
  if (!webhookUrl) {
    return {
      ok: false,
      status: 'not_configured',
      provider: 'whatsapp-webhook',
      channel: 'whatsapp',
      error: 'whatsapp reminder provider is not configured',
    }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(env.NOTIFICATION_PROVIDER_TOKEN
          ? { authorization: `Bearer ${env.NOTIFICATION_PROVIDER_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        channel: 'whatsapp',
        payload: {
          businessId: input.businessId,
          to: input.to,
          kind: 'front_desk_reply',
          text: input.text,
          locale: 'tr',
        },
      }),
    })

    if (!response.ok) {
      return {
        ok: false,
        status: 'error',
        provider: 'whatsapp-webhook',
        channel: 'whatsapp',
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
      provider: 'whatsapp-webhook',
      channel: 'whatsapp',
      externalId: data.externalId ?? data.id,
    }
  } catch (error) {
    return {
      ok: false,
      status: 'error',
      provider: 'whatsapp-webhook',
      channel: 'whatsapp',
      error: error instanceof Error ? error.message : 'whatsapp reply failed',
    }
  }
}
