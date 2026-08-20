import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { log, sanitizeLogFields } from '@/lib/observability/logger'
import { scrubSentryEvent } from '@/lib/security/sentry-scrub'
import { logPhiAccess } from '@/lib/observability/phi-access'

describe('observability logger', () => {
  const lines: string[] = []
  let infoSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    lines.length = 0
    infoSpy = vi.spyOn(console, 'log').mockImplementation((line: unknown) => {
      lines.push(String(line))
    })
  })

  afterEach(() => {
    infoSpy.mockRestore()
  })

  it('emits JSON and strips PHI field names', () => {
    log.info('phi.access', {
      action: 'patient.view',
      phone: '+905551112233',
      fullName: 'Ayşe',
      entityId: 'pat-1',
      hitCount: 1,
    })
    expect(lines.length).toBe(1)
    const parsed = JSON.parse(lines[0])
    expect(parsed.msg).toBe('phi.access')
    expect(parsed.entityId).toBe('pat-1')
    expect(parsed.hitCount).toBe(1)
    expect(parsed.phone).toBeUndefined()
    expect(parsed.fullName).toBeUndefined()
    expect(parsed.service).toBe('asistan-web')
  })

  it('sanitizeLogFields drops blocked keys', () => {
    expect(
      sanitizeLogFields({
        phone: '1',
        query: 'secret',
        entityId: 'x',
      })
    ).toEqual({ entityId: 'x' })
  })
})

describe('sentry scrub', () => {
  it('strips query string, body, cookies, and sensitive headers', () => {
    const event = scrubSentryEvent({
      request: {
        url: 'https://app.example/dashboard/hastalar?q=0555',
        query_string: 'q=0555',
        data: { phone: '0555' },
        cookies: { session: 'x' },
        headers: {
          Authorization: 'Bearer secret',
          'content-type': 'application/json',
        },
      },
      user: { id: 'u-1', email: 'a@b.com', username: 'ayse' },
      extra: { phone: '0555', entityId: 'pat-1' },
    })
    expect(event.request?.url).toBe('https://app.example/dashboard/hastalar')
    expect(event.request?.query_string).toBeUndefined()
    expect(event.request?.data).toBeUndefined()
    expect(event.request?.cookies).toBeUndefined()
    expect(event.request?.headers?.Authorization).toBeUndefined()
    expect(event.request?.headers?.['content-type']).toBe('application/json')
    expect(event.user).toEqual({ id: 'u-1' })
    expect(event.extra).toEqual({ entityId: 'pat-1' })
  })
})

describe('phi access helper', () => {
  it('writes structured phi.access log without PHI fields', () => {
    const lines: string[] = []
    const spy = vi.spyOn(console, 'log').mockImplementation((line: unknown) => {
      lines.push(String(line))
    })
    logPhiAccess({
      businessId: 'biz-1',
      actorUserId: 'user-1',
      action: 'patient.view',
      entityId: 'pat-1',
      metadata: { fileCount: 2, source: 'test' },
    })
    spy.mockRestore()
    expect(lines.some((l) => l.includes('"msg":"phi.access"'))).toBe(true)
    expect(lines.join('')).not.toContain('0555')
  })
})
