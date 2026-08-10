import { describe, expect, it } from 'vitest'
import { contactLeadSchema } from '@/lib/marketing/contact-lead'

const valid = {
  name: 'Ayşe Yılmaz',
  email: 'ayse@klinik.com',
  phone: '+90 532 000 00 00',
  company: 'Demo Klinik',
  service_type: 'patient-booking' as const,
  message: 'Demo ve fiyatlandırma hakkında bilgi almak istiyorum.',
  privacyAccepted: true as const,
}

describe('contactLeadSchema', () => {
  it('accepts a complete valid lead', () => {
    const parsed = contactLeadSchema.safeParse(valid)
    expect(parsed.success).toBe(true)
  })

  it('rejects missing privacy consent', () => {
    const parsed = contactLeadSchema.safeParse({ ...valid, privacyAccepted: false })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.privacyAccepted?.length).toBeGreaterThan(0)
    }
  })

  it('rejects short messages', () => {
    const parsed = contactLeadSchema.safeParse({ ...valid, message: 'kısa' })
    expect(parsed.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const parsed = contactLeadSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(parsed.success).toBe(false)
  })

  it('allows empty company and optional service type', () => {
    const parsed = contactLeadSchema.safeParse({
      ...valid,
      company: '',
      service_type: undefined,
    })
    expect(parsed.success).toBe(true)
  })

  it('still validates when honeypot website is filled (caller must drop)', () => {
    const parsed = contactLeadSchema.safeParse({ ...valid, website: 'http://spam.example' })
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.website).toBe('http://spam.example')
  })
})
