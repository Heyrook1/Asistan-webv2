import { describe, expect, it } from 'vitest'

import {
  isPublicTestClinic,
  isTestClinicName,
  isTestClinicSlug,
} from '@/lib/client-marketplace/public-clinic-filter'

describe('public clinic filter', () => {
  it('detects *-asistan-test slugs', () => {
    expect(isTestClinicSlug('lefkosa-asistan-test')).toBe(true)
    expect(isTestClinicSlug('girne-asistan-test')).toBe(true)
    expect(isTestClinicSlug('lefkosa-dis-klinigi')).toBe(false)
  })

  it('detects test display names with Turkish characters', () => {
    expect(isTestClinicName('Lefkoşa Asistan Test Kliniği')).toBe(true)
    expect(isTestClinicName('Girne Asistan Test Klinigi')).toBe(true)
    expect(isTestClinicName('Lefkoşa Diş Kliniği')).toBe(false)
  })

  it('combines slug and name', () => {
    expect(isPublicTestClinic({ slug: 'x-asistan-test', name: 'Real Name' })).toBe(true)
    expect(isPublicTestClinic({ slug: 'real-clinic', name: 'Asistan Test Kliniği' })).toBe(true)
    expect(isPublicTestClinic({ slug: 'real-clinic', name: 'Real Clinic' })).toBe(false)
  })
})
