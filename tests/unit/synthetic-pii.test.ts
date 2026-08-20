import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  DEMO_CLINIC_PHONE,
  DEMO_EMAIL_DOMAIN,
  assertNoForbiddenDemoPii,
  demoEmail,
  demoIdentityDocument,
  demoPersonPhone,
  demoTestLabel,
  isReservedDemoPhone,
  looksLikeForbiddenDemoPii,
} from '@/lib/demo/synthetic-pii'

const DEMO_CONTACT_SURFACES = [
  'prisma/seed.ts',
  'scripts/setup-live-test-scenario.mjs',
  'scripts/ensure-demo-role-accounts.mjs',
  'scripts/ensure-kktc-test-clinics.mjs',
  'scripts/ensure-test-user.mjs',
] as const

/** Cleanup / migration literals may list old domains; they must not be assigned as live contacts. */
const ALLOWED_LEGACY_CLEANUP = [
  'mehmet@asistan.health',
  'elif@asistan.health',
  'demo@asistan.health',
  'owner@asistan.demo',
  'doktor@asistan.demo',
  'sekreter@asistan.demo',
  'personel@asistan.demo',
  'superadmin@asistan.demo',
]

describe('synthetic demo PII (P1-09)', () => {
  it('builds example.com emails and reserved phones', () => {
    expect(demoEmail('Demo.Owner')).toBe(`demo.owner@${DEMO_EMAIL_DOMAIN}`)
    expect(demoPersonPhone(1)).toBe('+90 555 010 0001')
    expect(demoPersonPhone(99)).toBe('+90 555 010 0099')
    expect(isReservedDemoPhone(DEMO_CLINIC_PHONE)).toBe(true)
    expect(demoIdentityDocument(4)).toBe('TEST-ID-0004')
    expect(demoTestLabel('Ahmet')).toBe('Ahmet (TEST)')
    expect(demoTestLabel('Zeynep (TEST)')).toBe('Zeynep (TEST)')
  })

  it('rejects real-looking contact patterns', () => {
    expect(looksLikeForbiddenDemoPii('0533 111 22 33')).toBe(true)
    expect(looksLikeForbiddenDemoPii('ahmet@ornek.mail')).toBe(true)
    expect(looksLikeForbiddenDemoPii('demo@asistan.health')).toBe(true)
    expect(looksLikeForbiddenDemoPii('+90 392 555 0100')).toBe(true)
    expect(looksLikeForbiddenDemoPii('+90 555 900 0001')).toBe(true)
    expect(looksLikeForbiddenDemoPii(DEMO_CLINIC_PHONE)).toBe(false)
    expect(looksLikeForbiddenDemoPii(demoEmail('hasta01.test'))).toBe(false)
    expect(() => assertNoForbiddenDemoPii('x', 'a@ornek.com')).toThrow(/P1-09/)
  })

  it('demo seed/scripts do not assign real-looking phones or product-domain emails', () => {
    for (const rel of DEMO_CONTACT_SURFACES) {
      let src = readFileSync(join(process.cwd(), rel), 'utf8')
      for (const legacy of ALLOWED_LEGACY_CLEANUP) {
        src = src.split(legacy).join('')
      }

      expect(src, rel).not.toMatch(/\b053[0-9]\b/)
      expect(src, rel).not.toMatch(/@ornek\.(mail|com)\b/i)
      expect(src, rel).not.toMatch(/\+90\s*392\b/)
      expect(src, rel).not.toMatch(/\+90\s*212\b/)
      // Live contact assignments must use example.com (local@domain), not product domains.
      expect(src, rel).not.toMatch(/['"`][a-z0-9._+-]+@asistan\.(health|online|demo)['"`]/i)
    }
  })
})
