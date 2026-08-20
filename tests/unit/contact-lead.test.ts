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

  it('accepts a first-contact lead without phone or a detailed message', () => {
    const parsed = contactLeadSchema.safeParse({ ...valid, phone: '', message: '' })
    expect(parsed.success).toBe(true)
  })

  it('rejects an invalid phone number when one is provided', () => {
    const parsed = contactLeadSchema.safeParse({ ...valid, phone: 'kısa' })
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
