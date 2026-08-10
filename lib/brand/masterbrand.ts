/**
 * Locked masterbrand architecture (KKTC-first → international).
 *
 * Asistan          → company / ecosystem + **patient-app chrome** (day-to-day UI)
 * Asistan Health   → clinic B2B product (dashboard, membership)
 * Asistan Rezervasyon → patient product **full name** (about, onboarding, legal, store long-form)
 *
 * Patient surfaces: lead with "Asistan"; use "Rezervasyon" only as subtitle on
 * about / onboarding — do not repeat the long product name in every header.
 *
 * Never invent fourth product names (e.g. "Asistan Client", "Asistan Mobile")
 * in customer-facing copy.
 */

import { getLiveHub } from '@/lib/brand/regional-hubs'

export type BrandLocale = 'tr' | 'en'

export type BrandProductId = 'company' | 'health' | 'booking'

export type BrandProduct = {
  id: BrandProductId
  /** Canonical legal/marketing name */
  name: { tr: string; en: string }
  /** One-line role */
  role: { tr: string; en: string }
  /** Primary audience */
  audience: { tr: string; en: string }
  /** Routes / surfaces this product owns */
  surfaces: string[]
}

export const MASTERBRAND = {
  companyDomain: 'asistan.online',
  /** Live SEO/canonical host — see docs/regional-hubs.md */
  regionalHost: getLiveHub().host,
  socialHandle: '@asistan.kktc',
  contactEmail: 'merhaba@asistan.online',
  /** Only real, live profiles — never generic domain roots */
  social: {
    instagram: 'https://www.instagram.com/asistan.kktc/',
    /** Set when LinkedIn company page is live; do not use generic linkedin.com */
    linkedin: null as string | null,
  },
  og: {
    path: '/opengraph-image',
    width: 1200,
    height: 630,
    alt: {
      tr: 'Asistan Health — KKTC klinik randevu ve operasyon paneli',
      en: 'Asistan Health — clinic operations for Northern Cyprus',
    },
  },
} as const

export function socialLinks(): { label: string; href: string }[] {
  const links: { label: string; href: string }[] = [
    { label: 'Instagram', href: MASTERBRAND.social.instagram },
  ]
  if (MASTERBRAND.social.linkedin) {
    links.push({ label: 'LinkedIn', href: MASTERBRAND.social.linkedin })
  }
  return links
}

export const BRAND_PRODUCTS: Record<BrandProductId, BrandProduct> = {
  company: {
    id: 'company',
    name: { tr: 'Asistan', en: 'Asistan' },
    role: {
      tr: 'Şirket markası; hasta uygulamasında günlük chrome',
      en: 'Company brand; patient-app day-to-day chrome',
    },
    audience: {
      tr: 'Kurumsal, yatırımcı, kariyer; hasta UI chrome',
      en: 'Corporate, investor, careers; patient UI chrome',
    },
    surfaces: ['footer-corporate', 'legal-company', 'press', '/client-chrome', 'web-mobile-chrome'],
  },
  health: {
    id: 'health',
    name: { tr: 'Asistan Health', en: 'Asistan Health' },
    role: {
      tr: 'Klinik B2B ürünü — randevu, hasta, ekip, abonelik',
      en: 'Clinic B2B product — scheduling, patients, team, membership',
    },
    audience: {
      tr: 'Klinik sahipleri, hekimler, sekreterler',
      en: 'Clinic owners, clinicians, front-desk teams',
    },
    surfaces: ['/', '/urun', '/dashboard', '/fiyatlandirma', 'clinic-trial', 'demo'],
  },
  booking: {
    id: 'booking',
    name: { tr: 'Asistan Rezervasyon', en: 'Asistan Booking' },
    role: {
      tr: 'Hasta ürününün tam adı — about, onboarding, yasal metin',
      en: 'Full patient product name — about, onboarding, legal',
    },
    audience: {
      tr: 'Hastalar / randevu arayan kullanıcılar',
      en: 'Patients and appointment seekers',
    },
    surfaces: ['/client', '/r', 'web-mobile', 'mobile', 'pwa-install', 'about', 'onboarding'],
  },
}

/** Short approved taglines — not slogans for unrelated products */
export const BRAND_TAGLINES = {
  health: {
    tr: 'KKTC kliniklerinin günlük operasyonunu sakinleştiren dijital sağlık paneli.',
    en: 'The digital clinic panel that calms day-to-day operations in Northern Cyprus.',
  },
  booking: {
    tr: 'KKTC’deki klinikleri, hizmetleri ve gerçek müsaitliği karşılaştırın.',
    en: 'Compare clinics, services, and live availability in Northern Cyprus.',
  },
  /** Patient home hero headline (chrome brand is Asistan, not the long product name). */
  bookingHero: {
    tr: 'Doğru kliniği bulun. Randevunuzu kolayca alın.',
    en: 'Find the right clinic. Book easily.',
  },
  company: {
    tr: 'İşinizi yöneten, hayatı kolaylaştıran dijital asistan.',
    en: 'The digital assistant that runs your operations and simplifies daily life.',
  },
} as const

/** Names that must not appear in customer-facing UI */
export const FORBIDDEN_PRODUCT_ALIASES = [
  'Asistan Client',
  'Asistan Mobile',
  'Asistan App',
  'Asistan Health Ecosystem',
  'Asistan Rezervasyon Mobile',
] as const

export function productName(id: BrandProductId, locale: BrandLocale = 'tr'): string {
  return BRAND_PRODUCTS[id].name[locale]
}

/**
 * Day-to-day patient UI wordmark — "Asistan".
 * Use {@link bookingProductFullName} on about / onboarding / legal only.
 */
export function patientChromeName(locale: BrandLocale = 'tr'): string {
  return BRAND_PRODUCTS.company.name[locale]
}

/** Full patient product name — about, onboarding, legal, long-form SEO. */
export function bookingProductFullName(locale: BrandLocale = 'tr'): string {
  return BRAND_PRODUCTS.booking.name[locale]
}

export function productRole(id: BrandProductId, locale: BrandLocale = 'tr'): string {
  return BRAND_PRODUCTS[id].role[locale]
}

export function brandTagline(
  id: keyof typeof BRAND_TAGLINES,
  locale: BrandLocale = 'tr',
): string {
  return BRAND_TAGLINES[id][locale]
}

export function copyrightLine(year = new Date().getFullYear(), locale: BrandLocale = 'tr'): string {
  if (locale === 'en') {
    return `© ${year} ${productName('health', 'en')}. All rights reserved.`
  }
  return `© ${year} ${productName('health', 'tr')}. Tüm hakları saklıdır.`
}

/** Metadata default title fragment for clinic product pages */
export function healthTitle(pageTitle?: string): string {
  const brand = productName('health', 'tr')
  return pageTitle ? `${pageTitle} | ${brand}` : brand
}
