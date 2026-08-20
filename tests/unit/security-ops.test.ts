import { describe, expect, it } from 'vitest'

import { parseWindowMs, RATE_LIMITS } from '@/lib/security/rate-window'
import {
  LEGACY_SNAKE_RLS_TABLES,
  RLS_ECOSYSTEM_DENY_TABLES,
  RLS_PARITY_GAP_TABLES,
  listRequiredRlsTableNames,
} from '@/lib/security/rls-inventory'

describe('rate-limit window parsing', () => {
  it('parses s/m/h windows', () => {
    expect(parseWindowMs('30 s')).toBe(30_000)
    expect(parseWindowMs('1 m')).toBe(60_000)
    expect(parseWindowMs('15 m')).toBe(15 * 60_000)
    expect(parseWindowMs('1 h')).toBe(3_600_000)
  })

  it('exposes public default presets', () => {
    expect(RATE_LIMITS.public.limit).toBe(10)
    expect(RATE_LIMITS.public.window).toBe('1 m')
  })
})

describe('rls inventory', () => {
  it('requires baseline + parity tables', () => {
    const names = listRequiredRlsTableNames()
    expect(names).toContain('Business')
    expect(names).toContain('CalendarConnection')
    expect(names).toContain('IntakeResponse')
    expect(names).toContain('MembershipPayment')
    expect(names.length).toBeGreaterThan(30)
  })

  it('keeps legacy snake_case out of required PascalCase set', () => {
    const required = new Set(listRequiredRlsTableNames())
    for (const legacy of LEGACY_SNAKE_RLS_TABLES) {
      expect(required.has(legacy)).toBe(false)
    }
  })

  it('lists parity gaps that the SQL migration must close', () => {
    expect(RLS_PARITY_GAP_TABLES).toContain('Waitlist')
    expect(RLS_PARITY_GAP_TABLES).toContain('AuditLog')
  })

  it('requires ecosystem Person tables with deny-default RLS', () => {
    const names = listRequiredRlsTableNames()
    expect(RLS_ECOSYSTEM_DENY_TABLES).toContain('Person')
    expect(RLS_ECOSYSTEM_DENY_TABLES).toContain('PersonIdentityMatch')
    expect(RLS_ECOSYSTEM_DENY_TABLES).toContain('BookingIdempotency')
    expect(names).toContain('Person')
    expect(names).toContain('BookingIdempotency')
  })
})
