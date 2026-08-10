import { describe, expect, it } from 'vitest'

import {
  applyResponseSecurityHeaders,
  buildContentSecurityPolicy,
  isNonceEligiblePath,
} from '@/lib/security/response-headers'
import { scrubSentryEvent } from '@/lib/security/sentry-scrub'

describe('response security headers', () => {
  it('blocks framing by other origins on normal pages', () => {
    const response = { headers: new Headers() }
    applyResponseSecurityHeaders(response, {
      pathname: '/dashboard',
      isDevelopment: false,
    })

    expect(response.headers.get('x-frame-options')).toBe('SAMEORIGIN')
    expect(response.headers.get('content-security-policy')).toContain(
      "frame-ancestors 'self'"
    )
  })

  it('allows HTTPS clinic sites to embed only the explicit booking surface', () => {
    const response = { headers: new Headers() }
    applyResponseSecurityHeaders(response, {
      pathname: '/book/demo-klinik',
      embedParam: '1',
      isDevelopment: false,
    })

    expect(response.headers.get('x-frame-options')).toBeNull()
    expect(response.headers.get('content-security-policy')).toContain(
      'frame-ancestors https:'
    )
  })

  it('does not allow an embed query to weaken unrelated routes', () => {
    const policy = buildContentSecurityPolicy({
      pathname: '/dashboard',
      embedParam: '1',
      isDevelopment: false,
    })
    expect(policy).toContain("frame-ancestors 'self'")
    expect(policy).not.toContain("'unsafe-eval'")
  })

  it('nonce policy drops unsafe-inline for scripts on dynamic PHI surfaces', () => {
    const policy = buildContentSecurityPolicy({
      pathname: '/dashboard/hastalar',
      isDevelopment: false,
      nonce: 'test-nonce-123',
    })

    expect(policy).toContain("script-src 'self' 'nonce-test-nonce-123' 'strict-dynamic'")
    expect(policy).not.toMatch(/script-src[^;]*'unsafe-inline'/)
    // Inline style attributes (React SSR) still require unsafe-inline for styles.
    expect(policy).toMatch(/style-src[^;]*'unsafe-inline'/)
  })

  it('development ignores nonce so HMR / React Refresh keeps working', () => {
    const policy = buildContentSecurityPolicy({
      pathname: '/dashboard',
      isDevelopment: true,
      nonce: 'dev-nonce',
    })

    expect(policy).not.toContain('dev-nonce')
    expect(policy).toMatch(/script-src[^;]*'unsafe-inline'/)
    expect(policy).toContain("'unsafe-eval'")
  })

  it('without a nonce the production policy keeps the legacy script-src', () => {
    const policy = buildContentSecurityPolicy({
      pathname: '/dashboard',
      isDevelopment: false,
    })
    expect(policy).toMatch(/script-src 'self' 'unsafe-inline'/)
    expect(policy).not.toContain('strict-dynamic')
  })

  it('nonce eligibility covers dynamic surfaces only (static pages stay lax)', () => {
    expect(isNonceEligiblePath('/dashboard')).toBe(true)
    expect(isNonceEligiblePath('/dashboard/hastalar/abc')).toBe(true)
    expect(isNonceEligiblePath('/client')).toBe(true)
    expect(isNonceEligiblePath('/client/clinics')).toBe(true)
    expect(isNonceEligiblePath('/book/demo-klinik')).toBe(true)
    expect(isNonceEligiblePath('/intake/token123')).toBe(true)
    // Statically prerendered marketing/auth pages must not get a nonce policy.
    expect(isNonceEligiblePath('/')).toBe(false)
    expect(isNonceEligiblePath('/urun')).toBe(false)
    expect(isNonceEligiblePath('/tr/giris')).toBe(false)
  })

  it('nonce flows through applyResponseSecurityHeaders', () => {
    const response = { headers: new Headers() }
    applyResponseSecurityHeaders(response, {
      pathname: '/dashboard',
      isDevelopment: false,
      nonce: 'abc123',
    })
    expect(response.headers.get('content-security-policy')).toContain("'nonce-abc123'")
  })

  it('production CSP baseline documents poweredByHeader off', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const config = fs.readFileSync(path.join(process.cwd(), 'next.config.mjs'), 'utf8')
    expect(config).toContain('Content-Security-Policy')
    expect(config).toContain('X-Frame-Options')
    expect(config).toContain("frame-ancestors 'self'")
    expect(config).toContain('poweredByHeader: false')
    expect(config).toContain('geolocation=()')
    expect(config).not.toContain('allowedDevOrigins')
    expect(config).not.toMatch(/unoptimized\s*:\s*true/)
    expect(config).not.toContain('192.168.')
  })
})

describe('Sentry PHI scrubbing', () => {
  it('removes query, body, cookies, auth headers, and direct user identifiers', () => {
    const event = scrubSentryEvent({
      request: {
        url: 'https://kktc.asistan.online/api/patient?id=123',
        query_string: 'id=123',
        data: { identityNumber: 'sensitive' },
        cookies: 'session=sensitive',
        headers: {
          authorization: 'Bearer sensitive',
          'content-type': 'application/json',
        },
      },
      user: {
        id: 'user-1',
        email: 'patient@example.com',
        ip_address: '127.0.0.1',
      },
    })

    expect(event.request?.url).toBe('https://kktc.asistan.online/api/patient')
    expect(event.request?.query_string).toBeUndefined()
    expect(event.request?.data).toBeUndefined()
    expect(event.request?.cookies).toBeUndefined()
    expect(event.request?.headers).toEqual({ 'content-type': 'application/json' })
    expect(event.user).toEqual({ id: 'user-1' })
  })
})
