import { describe, it, expect } from 'vitest'

import {
  BRAND_PRODUCTS,
  FORBIDDEN_PRODUCT_ALIASES,
  MASTERBRAND,
  brandTagline,
  bookingProductFullName,
  copyrightLine,
  patientChromeName,
  productName,
  productRole,
  socialLinks,
} from '@/lib/brand/masterbrand'

describe('lib/brand/masterbrand', () => {
  it('locks three-layer architecture', () => {
    expect(productName('company', 'tr')).toBe('Asistan')
    expect(productName('health', 'tr')).toBe('Asistan Health')
    expect(productName('booking', 'tr')).toBe('Asistan Rezervasyon')
    expect(productName('booking', 'en')).toBe('Asistan Booking')
    expect(Object.keys(BRAND_PRODUCTS)).toHaveLength(3)
  })

  it('uses Asistan for patient chrome; full booking name for about/onboarding', () => {
    expect(patientChromeName('tr')).toBe('Asistan')
    expect(patientChromeName('en')).toBe('Asistan')
    expect(bookingProductFullName('tr')).toBe('Asistan Rezervasyon')
    expect(bookingProductFullName('en')).toBe('Asistan Booking')
  })

  it('locks patient hero copy', () => {
    expect(brandTagline('bookingHero', 'tr')).toBe(
      'Doğru kliniği bulun. Randevunuzu kolayca alın.',
    )
    expect(brandTagline('booking', 'tr')).toMatch(/KKTC/)
    expect(brandTagline('booking', 'tr')).toMatch(/müsaitli/)
    expect(brandTagline('booking', 'tr')).toMatch(/karşılaştırın/)
  })

  it('keeps Health as clinic B2B and Booking as patient surface', () => {
    expect(productRole('health', 'tr')).toMatch(/Klinik B2B/i)
    expect(productRole('booking', 'tr')).toMatch(/Hasta/i)
    expect(BRAND_PRODUCTS.health.surfaces).toContain('/dashboard')
    expect(BRAND_PRODUCTS.booking.surfaces).toContain('/client')
    expect(BRAND_PRODUCTS.booking.surfaces).toContain('web-mobile')
    expect(BRAND_PRODUCTS.booking.surfaces).toContain('/r')
  })

  it('lists forbidden alias names', () => {
    expect(FORBIDDEN_PRODUCT_ALIASES).toContain('Asistan Client')
    expect(FORBIDDEN_PRODUCT_ALIASES).toContain('Asistan Mobile')
    expect(copyrightLine(2026, 'tr')).toContain('Asistan Health')
  })

  it('exposes real Instagram handle, not generic social roots', () => {
    expect(MASTERBRAND.social.instagram).toContain('instagram.com/asistan.kktc')
    expect(MASTERBRAND.social.instagram).not.toBe('https://instagram.com')
    expect(MASTERBRAND.regionalHost).toBe('kktc.asistan.online')
    expect(MASTERBRAND.og.width).toBe(1200)
    expect(MASTERBRAND.og.height).toBe(630)
    expect(
      socialLinks().every((l) => !l.href.endsWith('instagram.com') && !l.href.endsWith('linkedin.com')),
    ).toBe(true)
  })
})
