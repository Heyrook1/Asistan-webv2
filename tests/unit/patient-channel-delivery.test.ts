import { describe, expect, it } from 'vitest'

import {
  providerDeliveryRate,
  summarizePatientChannelResults,
  type ChannelAttemptResult,
} from '@/lib/notifications/channel-delivery'

function attempt(
  partial: Pick<ChannelAttemptResult, 'channel' | 'status'> &
    Partial<ChannelAttemptResult>,
): ChannelAttemptResult {
  const ok = partial.status === 'sent'
  return {
    ok,
    status: partial.status,
    channel: partial.channel,
    provider: partial.provider ?? `${partial.channel}-webhook`,
    ...(ok
      ? { externalId: partial.externalId ?? 'ext-1' }
      : { error: partial.error ?? 'fail' }),
  }
}

describe('patient channel delivery summary (A1)', () => {
  it('labels gönderildi / yapılandırılmadı / hata per channel', () => {
    const summary = summarizePatientChannelResults([
      attempt({ channel: 'sms', status: 'sent' }),
      attempt({ channel: 'whatsapp', status: 'not_configured' }),
      attempt({ channel: 'email', status: 'error', error: '500' }),
    ])
    expect(summary.outcome).toBe('sent')
    expect(summary.sent).toBe(1)
    expect(summary.notConfigured).toBe(1)
    expect(summary.errors).toBe(1)
    expect(summary.label).toContain('SMS gönderildi')
    expect(summary.label).toContain('WhatsApp yapılandırılmadı')
    expect(summary.label).toContain('e-posta hata')
  })

  it('outcome is not_configured when all webhooks missing', () => {
    const summary = summarizePatientChannelResults([
      attempt({ channel: 'sms', status: 'not_configured' }),
      attempt({ channel: 'whatsapp', status: 'not_configured' }),
    ])
    expect(summary.outcome).toBe('not_configured')
    expect(summary.label).toMatch(/yapılandırılmadı/)
  })

  it('outcome is error when configured providers fail', () => {
    const summary = summarizePatientChannelResults([
      attempt({ channel: 'sms', status: 'error' }),
      attempt({ channel: 'whatsapp', status: 'error' }),
    ])
    expect(summary.outcome).toBe('error')
  })

  it('skips when no contact / no attempts', () => {
    const summary = summarizePatientChannelResults([])
    expect(summary.outcome).toBe('skipped')
    expect(summary.label).toMatch(/iletişim bilgisi yok/)
  })

  it('providerDeliveryRate ignores not_configured and meets ≥80% bar when 4/5 sent', () => {
    const results = [
      attempt({ channel: 'sms', status: 'sent' }),
      attempt({ channel: 'whatsapp', status: 'sent' }),
      attempt({ channel: 'email', status: 'sent' }),
      attempt({ channel: 'sms', status: 'sent' }),
      attempt({ channel: 'whatsapp', status: 'error' }),
      attempt({ channel: 'email', status: 'not_configured' }),
    ]
    const rate = providerDeliveryRate(results)
    expect(rate).toBeCloseTo(0.8)
    expect(rate!).toBeGreaterThanOrEqual(0.8)
  })

  it('providerDeliveryRate is null when only not_configured', () => {
    expect(
      providerDeliveryRate([attempt({ channel: 'sms', status: 'not_configured' })]),
    ).toBeNull()
  })
})
