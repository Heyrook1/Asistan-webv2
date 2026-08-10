import type { Metadata } from 'next'

import {
  isPublicTestClinic,
  shouldIncludeTestClinicsInPublicIndex,
} from '@/lib/client-marketplace/public-clinic-filter'
import { getPublicBookPath } from '@/lib/public-booking/paths'
import { absoluteUrl, withCanonical } from '@/lib/seo'

const SCHEMA_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export type ClinicSeoInput = {
  name: string
  slug: string
  description?: string | null
  city?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  logoUrl?: string | null
  locationLat?: number | null
  locationLng?: number | null
  specialtySummary?: string[]
  doctors?: Array<{
    fullName: string
    specialty?: string | null
  }>
  openingHours?: Array<{
    weekday: number
    windows: Array<{ startTime: string; endTime: string }>
  }>
  isDemo?: boolean
  isActive?: boolean
}

/** Production never indexes test clinics, even if CLIENT_SHOW_TEST_CLINICS is on. */
export function isProductionSeoEnvironment(): boolean {
  const vercel = process.env.VERCEL_ENV?.trim().toLowerCase()
  if (vercel === 'production') return true
  if (vercel === 'preview' || vercel === 'development') return false
  return process.env.NODE_ENV === 'production'
}

export function isClinicPubliclyIndexable(input: {
  slug?: string | null
  name?: string | null
  isDemo?: boolean | null
  isActive?: boolean | null
}): boolean {
  if (input.isActive === false) return false
  if (input.isDemo) return false
  if (isPublicTestClinic(input)) {
    if (isProductionSeoEnvironment()) return false
    return shouldIncludeTestClinicsInPublicIndex()
  }
  return true
}

function primarySpecialty(input: ClinicSeoInput): string | null {
  const fromSummary = input.specialtySummary?.map((s) => s.trim()).find(Boolean)
  if (fromSummary) return fromSummary
  const fromDoctor = input.doctors?.map((d) => d.specialty?.trim()).find(Boolean)
  return fromDoctor || null
}

/**
 * Page title segment (root template appends " | Asistan").
 * Example: "Girne Lefkoşa Diş — Dermatoloji Randevusu"
 */
export function buildClinicSeoTitle(input: ClinicSeoInput): string {
  const city = input.city?.trim() || ''
  const name = input.name.trim()
  const specialty = primarySpecialty(input)
  const head = city && !name.toLowerCase().includes(city.toLowerCase()) ? `${city} ${name}` : name
  if (specialty) return `${head} — ${specialty} Randevusu`
  return `${head} — Online Randevu`
}

export function buildClinicSeoDescription(input: ClinicSeoInput): string {
  const specialty = primarySpecialty(input)
  const city = input.city?.trim()
  const fromDb = input.description?.replace(/\s+/g, ' ').trim()
  if (fromDb && fromDb.length >= 40) {
    return fromDb.length > 160 ? `${fromDb.slice(0, 157).trim()}…` : fromDb
  }

  const parts: string[] = []
  parts.push(`${input.name.trim()} için online randevu.`)
  if (specialty) parts.push(`${specialty} hizmetleri.`)
  if (city) parts.push(`${city}, KKTC.`)
  parts.push('Asistan ile gerçek müsaitlikten randevu talebi gönderin.')
  const text = parts.join(' ')
  return text.length > 160 ? `${text.slice(0, 157).trim()}…` : text
}

export function clinicOgImage(input: Pick<ClinicSeoInput, 'logoUrl' | 'name'>): {
  url: string
  width?: number
  height?: number
  alt: string
} {
  const logo = input.logoUrl?.trim()
  if (logo && /^https?:\/\//i.test(logo)) {
    return { url: logo, alt: `${input.name} logosu` }
  }
  return {
    url: absoluteUrl('/opengraph-image'),
    width: 1200,
    height: 630,
    alt: `${input.name} — Asistan randevu`,
  }
}

export function buildClinicPageMetadata(
  input: ClinicSeoInput,
  options?: { canonicalPath?: string },
): Metadata {
  const path = options?.canonicalPath ?? getPublicBookPath(input.slug)
  const title = buildClinicSeoTitle(input)
  const description = buildClinicSeoDescription(input)
  const ogImage = clinicOgImage(input)
  const indexable = isClinicPubliclyIndexable(input)

  return withCanonical(path, {
    title,
    description,
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: 'website',
      locale: 'tr_CY',
      title,
      description,
      url: absoluteUrl(path),
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
    },
  })
}

export function buildMedicalClinicJsonLd(input: ClinicSeoInput): Record<string, unknown> {
  const path = getPublicBookPath(input.slug)
  const url = absoluteUrl(path)
  const specialty = primarySpecialty(input)
  const image = clinicOgImage(input).url

  const physicians = (input.doctors ?? [])
    .filter((d) => d.fullName.trim())
    .slice(0, 20)
    .map((doctor) => {
      const node: Record<string, unknown> = {
        '@type': 'Physician',
        name: doctor.fullName.trim(),
        url,
      }
      if (doctor.specialty?.trim()) {
        node.medicalSpecialty = doctor.specialty.trim()
      }
      return node
    })

  const openingHoursSpecification = (input.openingHours ?? []).flatMap((day) => {
    const dayName = SCHEMA_DAYS[day.weekday]
    if (!dayName) return []
    return day.windows.map((window) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${dayName}`,
      opens: window.startTime.slice(0, 5),
      closes: window.endTime.slice(0, 5),
    }))
  })

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: input.name.trim(),
    url,
    description: buildClinicSeoDescription(input),
    image,
    inLanguage: 'tr',
  }

  if (input.phone?.trim()) jsonLd.telephone = input.phone.trim()
  if (input.email?.trim()) jsonLd.email = input.email.trim()
  if (specialty) jsonLd.medicalSpecialty = specialty

  if (input.address?.trim() || input.city?.trim()) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      ...(input.address?.trim() ? { streetAddress: input.address.trim() } : {}),
      ...(input.city?.trim() ? { addressLocality: input.city.trim() } : {}),
      addressCountry: 'CY',
    }
  }

  if (
    typeof input.locationLat === 'number' &&
    typeof input.locationLng === 'number' &&
    Number.isFinite(input.locationLat) &&
    Number.isFinite(input.locationLng)
  ) {
    jsonLd.geo = {
      '@type': 'GeoCoordinates',
      latitude: input.locationLat,
      longitude: input.locationLng,
    }
  }

  if (openingHoursSpecification.length > 0) {
    jsonLd.openingHoursSpecification = openingHoursSpecification
  }

  if (physicians.length > 0) {
    jsonLd.employee = physicians
  }

  return jsonLd
}
