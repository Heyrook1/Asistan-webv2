/**
 * Browser-exposed env allowlist — anything else under NEXT_PUBLIC_ is a leak risk.
 * Used by `scripts/check-public-env-allowlist.mjs` and unit tests.
 */

/** Keys that may ship to the browser (Next inlines NEXT_PUBLIC_*). */
export const NEXT_PUBLIC_ALLOWLIST = new Set([
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY',
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_APP_VERSION',
  'NEXT_PUBLIC_SITE_URL',
])

/**
 * Substrings that must never appear in a NEXT_PUBLIC_* name
 * (defense in depth even if someone invents a new public key).
 */
export const NEXT_PUBLIC_FORBIDDEN_SUBSTRINGS = [
  'SERVICE_ROLE',
  'SECRET_KEY',
  'SECRET',
  'PRIVATE_KEY',
  'PRIVATE',
  'PASSWORD',
  'PEPPER',
  'CRON',
  'DATABASE',
  'MIGRATE',
  'WEBHOOK',
  'BEARER',
] as const

export type PublicEnvFinding = {
  key: string
  reason: 'not-allowlisted' | 'forbidden-substring'
  detail?: string
}

export function findPublicEnvViolations(keys: Iterable<string>): PublicEnvFinding[] {
  const findings: PublicEnvFinding[] = []
  for (const key of keys) {
    if (!key.startsWith('NEXT_PUBLIC_')) continue

    if (!NEXT_PUBLIC_ALLOWLIST.has(key)) {
      findings.push({ key, reason: 'not-allowlisted' })
    }

    const upper = key.toUpperCase()
    for (const fragment of NEXT_PUBLIC_FORBIDDEN_SUBSTRINGS) {
      // Allow ANON_KEY / PUBLISHABLE_KEY / VAPID_PUBLIC_KEY / SENTRY_DSN — none match these.
      if (upper.includes(fragment)) {
        findings.push({
          key,
          reason: 'forbidden-substring',
          detail: fragment,
        })
        break
      }
    }
  }
  return findings
}

/** Server-only counterparts that must stay non-public. */
export const SERVER_SECRET_ENV_HINTS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY',
  'WEB_PUSH_VAPID_PRIVATE_KEY',
  'CRON_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'WHATSAPP_APP_SECRET',
  'NOTIFICATION_PROVIDER_TOKEN',
  'PERSON_IDENTITY_PEPPER',
  'CALENDAR_TOKEN_ENCRYPTION_KEY',
  'GOOGLE_CALENDAR_CLIENT_SECRET',
  'DATABASE_URL',
  'DATABASE_URL_MIGRATE',
  'DIRECT_URL',
] as const
