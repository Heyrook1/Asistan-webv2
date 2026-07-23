import { describe, expect, it, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

import { authorizeCronRequest } from '@/lib/security/cron-auth'

describe('authorizeCronRequest (BUG-002)', () => {
  const prevSecret = process.env.CRON_SECRET
  const prevNodeEnv = process.env.NODE_ENV

  afterEach(() => {
    if (prevSecret === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = prevSecret
    if (prevNodeEnv === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = prevNodeEnv
  })

  it('returns 503 when CRON_SECRET is unset — including non-prod (fail-closed)', () => {
    delete process.env.CRON_SECRET
    process.env.NODE_ENV = 'development'
    const req = new NextRequest('http://localhost/api/cron/appointment-reminders')
    expect(authorizeCronRequest(req)).toEqual({
      ok: false,
      status: 503,
      message: 'CRON_SECRET not configured',
    })
  })

  it('returns 503 when CRON_SECRET is whitespace-only', () => {
    process.env.CRON_SECRET = '   '
    process.env.NODE_ENV = 'test'
    const req = new NextRequest('http://localhost/api/cron/google-calendar-sync')
    expect(authorizeCronRequest(req)).toEqual({
      ok: false,
      status: 503,
      message: 'CRON_SECRET not configured',
    })
  })

  it('returns 401 when Bearer does not match', () => {
    process.env.CRON_SECRET = 'cron-secret'
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
    process.env.CRON_SECRET = 'cron-secret'
    const req = new NextRequest('http://localhost/api/cron/appointment-reminders', {
      headers: { authorization: 'Bearer cron-secret' },
    })
    expect(authorizeCronRequest(req)).toEqual({ ok: true })
  })
})
