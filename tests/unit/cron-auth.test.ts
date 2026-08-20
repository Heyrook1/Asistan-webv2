import { describe, expect, it, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

import { authorizeCronRequest } from '@/lib/security/cron-auth'

describe('authorizeCronRequest (BUG-002)', () => {
  // NODE_ENV is readonly under current @types/node, so assigning it directly is
  // a type error. vi.stubEnv handles the write and restores everything here.
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns 503 when CRON_SECRET is unset — including non-prod (fail-closed)', () => {
    vi.stubEnv('CRON_SECRET', undefined)
    vi.stubEnv('NODE_ENV', 'development')
    const req = new NextRequest('http://localhost/api/cron/appointment-reminders')
    expect(authorizeCronRequest(req)).toEqual({
      ok: false,
      status: 503,
      message: 'CRON_SECRET not configured',
    })
  })

  it('returns 503 when CRON_SECRET is whitespace-only', () => {
    vi.stubEnv('CRON_SECRET', '   ')
    vi.stubEnv('NODE_ENV', 'test')
    const req = new NextRequest('http://localhost/api/cron/google-calendar-sync')
    expect(authorizeCronRequest(req)).toEqual({
      ok: false,
      status: 503,
      message: 'CRON_SECRET not configured',
    })
  })

  it('returns 401 when Bearer does not match', () => {
    vi.stubEnv('CRON_SECRET', 'cron-secret')
    const req = new NextRequest('http://localhost/api/cron/appointment-reminders', {
      headers: { authorization: 'Bearer wrong' },
    })
    expect(authorizeCronRequest(req)).toEqual({
      ok: false,
      status: 401,
      message: 'Unauthorized',
    })
  })

  it('allows matching Bearer token', () => {
    vi.stubEnv('CRON_SECRET', 'cron-secret')
    const req = new NextRequest('http://localhost/api/cron/appointment-reminders', {
      headers: { authorization: 'Bearer cron-secret' },
    })
    expect(authorizeCronRequest(req)).toEqual({ ok: true })
  })
})
