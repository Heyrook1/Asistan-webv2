import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  buildClinicSeoDescription,
  buildClinicSeoTitle,
  buildMedicalClinicJsonLd,
  isClinicPubliclyIndexable,
  isProductionSeoEnvironment,
} from '@/lib/seo/clinic-seo'

describe('clinic SEO helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('builds unique title with city and specialty', () => {
    expect(
      buildClinicSeoTitle({
        name: 'Asistan Diş Kliniği',
        slug: 'asistan-dis',
        city: 'Girne',
        specialtySummary: ['Dermatoloji'],
      }),
    ).toBe('Girne Asistan Diş Kliniği — Dermatoloji Randevusu')
  })

  it('avoids duplicating city when already in the name', () => {
    expect(
      buildClinicSeoTitle({
        name: 'Girne Skin Clinic',
        slug: 'girne-skin',
        city: 'Girne',
        specialtySummary: ['Dermatoloji'],
      }),
    ).toBe('Girne Skin Clinic — Dermatoloji Randevusu')
  })

  it('falls back when specialty is missing', () => {
    expect(
      buildClinicSeoTitle({
        name: 'Lefkoşa Klinik',
        slug: 'lefkosa-klinik',
        city: 'Lefkoşa',
      }),
    ).toBe('Lefkoşa Klinik — Online Randevu')
  })

  it('builds a capped unique description', () => {
    const description = buildClinicSeoDescription({
      name: 'Girne Klinik',
      slug: 'girne-klinik',
      city: 'Girne',
      specialtySummary: ['Dermatoloji'],
    })
    expect(description).toContain('Girne Klinik')
    expect(description).toContain('Dermatoloji')
    expect(description.length).toBeLessThanOrEqual(160)
  })

  it('never indexes test clinics in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('CLIENT_SHOW_TEST_CLINICS', 'true')
    expect(isProductionSeoEnvironment()).toBe(true)
    expect(
      isClinicPubliclyIndexable({
        slug: 'girne-asistan-test',
        name: 'Girne Asistan Test Kliniği',
      }),
    ).toBe(false)
  })

  it('never indexes demo clinics', () => {
    expect(
      isClinicPubliclyIndexable({
        slug: 'real-clinic',
        name: 'Real Clinic',
        isDemo: true,
      }),
    ).toBe(false)
  })

  it('indexes active real clinics', () => {
    expect(
      isClinicPubliclyIndexable({
        slug: 'lefkosa-dis',
        name: 'Lefkoşa Diş',
        isDemo: false,
        isActive: true,
      }),
    ).toBe(true)
  })

  it('emits MedicalClinic JSON-LD with Physician employees', () => {
    const jsonLd = buildMedicalClinicJsonLd({
      name: 'Girne Klinik',
      slug: 'girne-klinik',
      city: 'Girne',
      address: 'Atatürk Cad. 1',
      phone: '+90 392 000 00 00',
      specialtySummary: ['Dermatoloji'],
      doctors: [{ fullName: 'Dr. Ayşe', specialty: 'Dermatoloji' }],
      openingHours: [
        { weekday: 1, windows: [{ startTime: '09:00', endTime: '17:00' }] },
      ],
    })

    expect(jsonLd['@type']).toBe('MedicalClinic')
    expect(jsonLd.telephone).toBe('+90 392 000 00 00')
    expect(jsonLd.employee).toEqual([
      expect.objectContaining({
        '@type': 'Physician',
        name: 'Dr. Ayşe',
        medicalSpecialty: 'Dermatoloji',
      }),
    ])
    expect(jsonLd.openingHoursSpecification).toEqual([
      expect.objectContaining({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'https://schema.org/Monday',
        opens: '09:00',
        closes: '17:00',
      }),
    ])
  })
})
