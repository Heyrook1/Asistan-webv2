import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import {
  authorizeWhatsAppWebhook,
  clinicBoundWebhookToken,
  parseWhatsAppInboundTokenMap,
} from '@/lib/security/whatsapp-webhook-auth'

describe('clinicBoundWebhookToken', () => {
  it('is stable and slug-case-insensitive', () => {
    const a = clinicBoundWebhookToken('master', 'Demo-Clinic')
    const b = clinicBoundWebhookToken('master', 'demo-clinic')
    expect(a).toBe(b)
    expect(a).toHaveLength(64)
  })
})

describe('parseWhatsAppInboundTokenMap', () => {
  it('parses csv and json', () => {
    expect(parseWhatsAppInboundTokenMap('alpha:tok-a,beta:tok-b').get('alpha')).toBe('tok-a')
    expect(parseWhatsAppInboundTokenMap('{"alpha":"tok-a"}').get('alpha')).toBe('tok-a')
  })
})

describe('authorizeWhatsAppWebhook (BUG-001)', () => {
  const body = '{"from":"905331112233","text":"randevu"}'

  it('returns 503 when no secrets configured (fail-closed)', () => {
    expect(
      authorizeWhatsAppWebhook({
        rawBody: body,
        signatureHeader: null,
        authorizationHeader: null,
        webhookTokenHeader: null,
        slug: 'demo',
      })
    ).toEqual({ ok: false, status: 503, message: 'WhatsApp webhook not configured' })
  })

  it('returns 401 for unsigned POST when Meta secret is configured', () => {
    expect(
      authorizeWhatsAppWebhook({
        rawBody: body,
        signatureHeader: null,
        authorizationHeader: null,
        webhookTokenHeader: null,
        slug: 'demo',
        appSecret: 'app-secret',
      })
    ).toEqual({ ok: false, status: 401, message: 'Unauthorized' })
  })

  it('accepts valid Meta X-Hub-Signature-256', () => {
    const digest = createHmac('sha256', 'app-secret').update(body, 'utf8').digest('hex')
    expect(
      authorizeWhatsAppWebhook({
        rawBody: body,
        signatureHeader: `sha256=${digest}`,
        authorizationHeader: null,
        webhookTokenHeader: null,
        slug: 'demo',
        appSecret: 'app-secret',
      })
    ).toEqual({ ok: true, mode: 'meta-hmac' })
  })

  it('rejects raw global bearer alone (no slug binding)', () => {
    expect(
      authorizeWhatsAppWebhook({
        rawBody: body,
        signatureHeader: null,
        authorizationHeader: 'Bearer global-token',
        webhookTokenHeader: null,
        slug: 'any-clinic',
        providerToken: 'global-token',
      })
    ).toEqual({ ok: false, status: 401, message: 'Unauthorized' })
  })

  it('accepts slug-bound HMAC bearer', () => {
    const bound = clinicBoundWebhookToken('global-token', 'demo-clinic')
    expect(
      authorizeWhatsAppWebhook({
        rawBody: body,
        signatureHeader: null,
        authorizationHeader: `Bearer ${bound}`,
        webhookTokenHeader: null,
        slug: 'demo-clinic',
        providerToken: 'global-token',
      })
    ).toEqual({ ok: true, mode: 'slug-token' })
  })

  it('returns 403 when inbound token belongs to a different slug', () => {
    expect(
      authorizeWhatsAppWebhook({
        rawBody: body,
        signatureHeader: null,
        authorizationHeader: 'Bearer tok-alpha',
        webhookTokenHeader: null,
        slug: 'beta',
        inboundTokensRaw: 'alpha:tok-alpha,beta:tok-beta',
      })
    ).toEqual({ ok: false, status: 403, message: 'Slug does not match webhook token' })
  })

  it('returns 403 when x-asistan-clinic-slug disagrees with query slug', () => {
    const bound = clinicBoundWebhookToken('global-token', 'alpha')
    expect(
      authorizeWhatsAppWebhook({
        rawBody: body,
        signatureHeader: null,
        authorizationHeader: `Bearer ${bound}`,
        webhookTokenHeader: null,
        boundSlugHeader: 'alpha',
        slug: 'beta',
        providerToken: 'global-token',
      })
    ).toEqual({ ok: false, status: 403, message: 'Slug does not match webhook token' })
  })

  it('does not fall open from failed Meta signature to unbound bearer', () => {
    expect(
      authorizeWhatsAppWebhook({
        rawBody: body,
        signatureHeader: 'sha256=deadbeef',
        authorizationHeader: 'Bearer global-token',
        webhookTokenHeader: null,
        slug: 'demo',
        appSecret: 'app-secret',
        providerToken: 'global-token',
      })
    ).toEqual({ ok: false, status: 401, message: 'Unauthorized' })
  })
})
