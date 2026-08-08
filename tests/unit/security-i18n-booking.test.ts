import { describe, it, expect } from 'vitest'

import {
  getLoginPath,
  getRegisterPath,
  normalizeAuthLanguage,
} from '@/lib/auth-routes'
import {
  buildAllowedOrigins,
  isAllowedOrigin,
  isDevNetworkOrigin,
  parseOriginList,
} from '@/lib/cors'
import { createClientBookingSchema } from '@/lib/client-marketplace/booking-schema'
import { parseSystemAdminEmails } from '@/lib/system-admin-emails'
import { guideWordCount, GUIDES } from '@/lib/resources/guides'
import type { SessionContext } from '@/lib/rbac'
import { TeamRole } from '@prisma/client'

/** Mirrors lib/session isSystemAdmin without pulling server-only session module. */
function isSystemAdmin(
  session: SessionContext | null,
  emails = parseSystemAdminEmails(process.env.SYSTEM_ADMIN_EMAILS)
) {
  if (!session) return false
  if (emails.size > 0) {
    return emails.has(session.email.toLowerCase())
  }
  return session.role === TeamRole.SUPER_ADMIN
}

describe('auth routes (localized)', () => {
  it('normalizes language and builds login/register paths', () => {
    expect(normalizeAuthLanguage('en')).toBe('en')
    expect(normalizeAuthLanguage('tr')).toBe('tr')
    expect(normalizeAuthLanguage(undefined)).toBe('tr')
    expect(getLoginPath('tr')).toBe('/tr/giris')
    expect(getLoginPath('en')).toBe('/en/login')
    expect(getRegisterPath('tr')).toBe('/tr/kayit')
    expect(getRegisterPath('en')).toBe('/en/register')
  })
})

describe('CORS allowlist (/api/client)', () => {
  it('parses origin lists and includes localhost defaults', () => {
    expect(parseOriginList(' https://app.example.com , http://localhost:3000 ')).toEqual([
      'https://app.example.com',
      'http://localhost:3000',
    ])
    const allowed = buildAllowedOrigins({ clientApi: 'https://mobile.asistan.online' })
    expect(allowed.has('http://localhost:8081')).toBe(true)
    expect(allowed.has('https://mobile.asistan.online')).toBe(true)
  })

  it('blocks unknown origins in production', () => {
    const allowed = buildAllowedOrigins({ clientApi: 'https://mobile.asistan.online' })
    expect(isAllowedOrigin('https://evil.example', allowed, 'production')).toBe(false)
    expect(isAllowedOrigin('https://mobile.asistan.online', allowed, 'production')).toBe(true)
    expect(isDevNetworkOrigin('http://192.168.1.10:8081', 'production')).toBe(false)
    expect(isDevNetworkOrigin('http://192.168.1.10:8081', 'development')).toBe(true)
  })
})

describe('SYSTEM_ADMIN_EMAILS', () => {
  it('parses allowlist emails', () => {
    expect([...parseSystemAdminEmails(' Admin@Asistan.online , other@x.com ')]).toEqual([
      'admin@asistan.online',
      'other@x.com',
    ])
    expect(parseSystemAdminEmails('').size).toBe(0)
  })

  it('isSystemAdmin uses allowlist when set', () => {
    const prev = process.env.SYSTEM_ADMIN_EMAILS
    process.env.SYSTEM_ADMIN_EMAILS = 'ops@asistan.online'
    const session = {
      userId: 'u1',
      email: 'ops@asistan.online',
      fullName: 'Ops',
      businessId: 'b1',
      businessName: 'Biz',
      role: 'SEKRETER',
      permissions: [],
      isOwner: false,
      staffMemberId: null,
    } as SessionContext
    expect(isSystemAdmin(session)).toBe(true)
    expect(isSystemAdmin({ ...session, email: 'other@x.com' })).toBe(false)
    process.env.SYSTEM_ADMIN_EMAILS = prev
  })
})

describe('client booking schema', () => {
  it('accepts KKTC identity', () => {
    const parsed = createClientBookingSchema.safeParse({
      businessId: '11111111-1111-4111-8111-111111111111',
      doctorId: '22222222-2222-4222-8222-222222222222',
      serviceId: '33333333-3333-4333-8333-333333333333',
      date: '2026-07-20',
      startTime: '10:30',
      fullName: 'Ayşe Yılmaz',
      phone: '+905551112233',
      identityDocumentType: 'KKTC',
      identityNumber: '1234567890',
    })
    expect(parsed.success).toBe(true)
  })

  it('accepts tourist passport (numeric or alphanumeric)', () => {
    expect(
      createClientBookingSchema.safeParse({
        businessId: '11111111-1111-4111-8111-111111111111',
        doctorId: '22222222-2222-4222-8222-222222222222',
        serviceId: '33333333-3333-4333-8333-333333333333',
        date: '2026-07-20',
        startTime: '10:30',
        fullName: 'John Smith',
        phone: '+447700900123',
        identityDocumentType: 'PASSPORT',
        identityNumber: '512345678',
        nationality: 'GB',
      }).success,
    ).toBe(true)
  })

  it('rejects missing identity number', () => {
    expect(
      createClientBookingSchema.safeParse({
        businessId: '11111111-1111-4111-8111-111111111111',
        doctorId: '22222222-2222-4222-8222-222222222222',
        serviceId: '33333333-3333-4333-8333-333333333333',
        date: '2026-07-20',
        startTime: '10:30',
        fullName: 'Ayşe Yılmaz',
        phone: '+905551112233',
      }).success
    ).toBe(false)
  })

  it('rejects invalid date/time and short name', () => {
    expect(
      createClientBookingSchema.safeParse({
        businessId: '11111111-1111-4111-8111-111111111111',
        doctorId: '22222222-2222-4222-8222-222222222222',
        serviceId: '33333333-3333-4333-8333-333333333333',
        date: '20/07/2026',
        startTime: '10:30',
        fullName: 'Ayşe Yılmaz',
        phone: '+905551112233',
        identityDocumentType: 'KKTC',
        identityNumber: '1234567890',
      }).success
    ).toBe(false)

    expect(
      createClientBookingSchema.safeParse({
        businessId: '11111111-1111-4111-8111-111111111111',
        doctorId: '22222222-2222-4222-8222-222222222222',
        serviceId: '33333333-3333-4333-8333-333333333333',
        date: '2026-07-20',
        startTime: '25:00',
        fullName: 'A',
        phone: '123',
        identityDocumentType: 'KKTC',
        identityNumber: '1234567890',
      }).success
    ).toBe(false)
  })
})

describe('SEO substance (guides)', () => {
  it('each guide has intro + enough words for indexing', () => {
    for (const guide of GUIDES) {
      expect(guide.intro.length).toBeGreaterThanOrEqual(2)
      expect(guide.sections.length).toBeGreaterThanOrEqual(4)
      expect(guideWordCount(guide)).toBeGreaterThanOrEqual(250)
    }
  })
})
