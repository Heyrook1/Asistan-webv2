/**
 * Clinic-facing integration status (no env/docs/runbook language).
 */

export type IntegrationLinkStatus = 'connected' | 'disconnected' | 'error'

export function resolveChannelLinkStatus(input: {
  configured: boolean
  errors: number
  sent: number
}): IntegrationLinkStatus {
  if (!input.configured) return 'disconnected'
  if (input.errors > 0 && input.sent === 0) return 'error'
  if (input.errors > 0) return 'error'
  return 'connected'
}

export const INTEGRATION_STATUS_LABEL: Record<IntegrationLinkStatus, string> = {
  connected: 'Bağlı',
  disconnected: 'Bağlı değil',
  error: 'Hata',
}

/** Strings that must not appear on clinic settings / product UI. */
export const CLINIC_INTEGRATION_FORBIDDEN_PATTERNS: RegExp[] = [
  /SMS_PROVIDER_WEBHOOK_URL/i,
  /WHATSAPP_PROVIDER_WEBHOOK_URL/i,
  /EMAIL_PROVIDER_WEBHOOK_URL/i,
  /NOTIFICATION_PROVIDER_TOKEN/i,
  /GOOGLE_CALENDAR_CLIENT_(ID|SECRET)/i,
  /CALENDAR_TOKEN_ENCRYPTION_KEY/i,
  /ASISTAN_FLAG_CALENDAR_SYNC/i,
  /KKTC_EFATURA_\*/i,
  /sunucu env/i,
  /\bOAuth\b/i,
  /yenileme jetonu/i,
  /Microsoft Graph/i,
  /busy-block/i,
  /production MVP/i,
  /docs\/patient-outbound-channels/i,
  /\bHTTP\s*ACK\b/i,
  /\bDLR\b/,
  /POST\s+\/api\/webhooks/i,
]

export function looksLikeClinicIntegrationRunbookLeak(text: string): boolean {
  return CLINIC_INTEGRATION_FORBIDDEN_PATTERNS.some((re) => re.test(text))
}
