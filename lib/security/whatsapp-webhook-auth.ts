import { createHmac } from 'node:crypto'
import type { NextRequest } from 'next/server'

import { verifyBearerToken, verifyMetaHubSignature256 } from '@/lib/security/meta-webhook-signature'

export type WhatsAppWebhookAuthResult =
  | { ok: true; mode: 'meta-hmac' | 'slug-token' }
  | { ok: false; status: 401 | 403 | 503; message: string }

/**
 * Adapter bearer must be clinic-bound:
 * HMAC-SHA256(NOTIFICATION_PROVIDER_TOKEN, `whatsapp-inbound:{slug}`) hex
 * — never the raw global token alone (BUG-001).
 */
export function clinicBoundWebhookToken(masterToken: string, slug: string): string {
  return createHmac('sha256', masterToken)
    .update(`whatsapp-inbound:${slug.trim().toLowerCase()}`, 'utf8')
    .digest('hex')
}

/** `slug:token,slug2:token2` or JSON `{"slug":"token"}`. */
export function parseWhatsAppInboundTokenMap(raw: string | undefined | null): Map<string, string> {
  const map = new Map<string, string>()
  const text = raw?.trim()
  if (!text) return map

  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>
      for (const [slug, token] of Object.entries(parsed)) {
        if (typeof token === 'string' && token.trim() && slug.trim()) {
          map.set(slug.trim().toLowerCase(), token.trim())
        }
      }
    } catch {
      return map
    }
    return map
  }

  for (const part of text.split(',')) {
    const idx = part.indexOf(':')
    if (idx <= 0) continue
    const slug = part.slice(0, idx).trim().toLowerCase()
    const token = part.slice(idx + 1).trim()
    if (slug && token) map.set(slug, token)
  }
  return map
}

/**
 * Fail-closed WhatsApp inbound auth (BUG-001):
 * - No secrets → 503
 * - Meta: valid `X-Hub-Signature-256` with `WHATSAPP_APP_SECRET`
 * - Adapter: bearer must match **slug-bound** token (HMAC or `WHATSAPP_INBOUND_TOKENS`)
 * - Raw global `NOTIFICATION_PROVIDER_TOKEN` alone → 401
 * - Valid token for a different slug → 403
 */
export function authorizeWhatsAppWebhook(input: {
  rawBody: string
  signatureHeader: string | null | undefined
  authorizationHeader: string | null | undefined
  webhookTokenHeader: string | null | undefined
  slug: string
  appSecret?: string | null
  providerToken?: string | null
  inboundTokensRaw?: string | null
  /** Optional: adapter declares which slug the bearer was minted for (wrong → 403). */
  boundSlugHeader?: string | null
}): WhatsAppWebhookAuthResult {
  const appSecret = input.appSecret?.trim() || ''
  const providerToken = input.providerToken?.trim() || ''
  const inboundMap = parseWhatsAppInboundTokenMap(input.inboundTokensRaw)
  const slug = input.slug.trim().toLowerCase()

  if (!appSecret && !providerToken && inboundMap.size === 0) {
    return { ok: false, status: 503, message: 'WhatsApp webhook not configured' }
  }

  // Meta HMAC authenticates the provider; clinic slug still required by the route.
  if (appSecret && verifyMetaHubSignature256(input.rawBody, input.signatureHeader, appSecret)) {
    return { ok: true, mode: 'meta-hmac' }
  }

  if (!slug) {
    return { ok: false, status: 401, message: 'Unauthorized' }
  }

  const expectedForSlug = inboundMap.get(slug)
  const hmacForSlug = providerToken ? clinicBoundWebhookToken(providerToken, slug) : ''

  const matchesSlug =
    (Boolean(expectedForSlug) &&
      verifyBearerToken(input.authorizationHeader, input.webhookTokenHeader, expectedForSlug!)) ||
    (Boolean(hmacForSlug) &&
      verifyBearerToken(input.authorizationHeader, input.webhookTokenHeader, hmacForSlug))

  if (matchesSlug) {
    const boundHeader = input.boundSlugHeader?.trim().toLowerCase()
    if (boundHeader && boundHeader !== slug) {
      return { ok: false, status: 403, message: 'Slug does not match webhook token' }
    }
    return { ok: true, mode: 'slug-token' }
  }

  // Token valid for a different clinic in the static map → 403
  if (inboundMap.size > 0) {
    for (const [otherSlug, token] of inboundMap) {
      if (otherSlug === slug) continue
      if (verifyBearerToken(input.authorizationHeader, input.webhookTokenHeader, token)) {
        return { ok: false, status: 403, message: 'Slug does not match webhook token' }
      }
    }
  }

  const boundHeader = input.boundSlugHeader?.trim().toLowerCase()
  if (providerToken && boundHeader && boundHeader !== slug) {
    const hmacBound = clinicBoundWebhookToken(providerToken, boundHeader)
    if (verifyBearerToken(input.authorizationHeader, input.webhookTokenHeader, hmacBound)) {
      return { ok: false, status: 403, message: 'Slug does not match webhook token' }
    }
  }

  // Raw global token must never authorize arbitrary slugs.
  if (
    providerToken &&
    verifyBearerToken(input.authorizationHeader, input.webhookTokenHeader, providerToken)
  ) {
    return { ok: false, status: 401, message: 'Unauthorized' }
  }

  return { ok: false, status: 401, message: 'Unauthorized' }
}

export function authorizeWhatsAppWebhookRequest(
  request: NextRequest,
  rawBody: string,
  slug: string
): WhatsAppWebhookAuthResult {
  return authorizeWhatsAppWebhook({
    rawBody,
    signatureHeader: request.headers.get('x-hub-signature-256'),
    authorizationHeader: request.headers.get('authorization'),
    webhookTokenHeader: request.headers.get('x-webhook-token'),
    boundSlugHeader: request.headers.get('x-asistan-clinic-slug'),
    slug,
    appSecret: process.env.WHATSAPP_APP_SECRET,
    providerToken: process.env.NOTIFICATION_PROVIDER_TOKEN,
    inboundTokensRaw: process.env.WHATSAPP_INBOUND_TOKENS,
  })
}
