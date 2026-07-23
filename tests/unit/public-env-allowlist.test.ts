import { describe, expect, it } from 'vitest'

import {
  findPublicEnvViolations,
  NEXT_PUBLIC_ALLOWLIST,
} from '@/lib/security/public-env-allowlist'

describe('public-env-allowlist', () => {
  it('accepts known public keys', () => {
    expect(
      findPublicEnvViolations([
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY',
        'NEXT_PUBLIC_SENTRY_DSN',
      ])
    ).toEqual([])
  })

  it('rejects service role / private / pepper under NEXT_PUBLIC_', () => {
    const findings = findPublicEnvViolations([
      'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_WEB_PUSH_VAPID_PRIVATE_KEY',
      'NEXT_PUBLIC_PERSON_IDENTITY_PEPPER',
      'NEXT_PUBLIC_CRON_SECRET',
      'NEXT_PUBLIC_STRIPE_SECRET_KEY',
    ])
    expect(findings.length).toBeGreaterThanOrEqual(5)
    expect(findings.every((f) => f.key.startsWith('NEXT_PUBLIC_'))).toBe(true)
  })

  it('rejects unknown NEXT_PUBLIC_ keys even without forbidden substrings', () => {
    const findings = findPublicEnvViolations(['NEXT_PUBLIC_COOL_FEATURE_FLAG'])
    expect(findings).toEqual([
      { key: 'NEXT_PUBLIC_COOL_FEATURE_FLAG', reason: 'not-allowlisted' },
    ])
  })

  it('allowlist stays small and intentional', () => {
    expect(NEXT_PUBLIC_ALLOWLIST.size).toBeLessThanOrEqual(10)
    expect(NEXT_PUBLIC_ALLOWLIST.has('NEXT_PUBLIC_SUPABASE_ANON_KEY')).toBe(true)
    expect(NEXT_PUBLIC_ALLOWLIST.has('NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY')).toBe(true)
  })
})
