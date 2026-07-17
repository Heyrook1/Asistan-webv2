/**
 * Public marketing pricing — single source of truth.
 * Amounts and plan codes come from `lib/vendor-membership.ts`.
 * Do not hardcode EUR/TL prices in UI components.
 */
import {
  DEMO_PLAN_CODE,
  listVendorPlans,
  type VendorPlanCode,
  type VendorPlanDefinition,
} from '@/lib/vendor-membership'

export type PublicPricingLocale = 'tr' | 'en'
export type PublicBillingCycle = 'monthly' | 'annual'

export type PublicPlanMarketing = {
  nameEn: string
  note: Record<PublicPricingLocale, string>
  features: Record<PublicPricingLocale, string[]>
  /** CTA opens register vs demo scheduler / contact */
  ctaKind: 'register' | 'demo'
  popular: boolean
  matrix: {
    users: Record<PublicPricingLocale, string>
    reminders: boolean
    analytics: boolean
    api: boolean
    onboarding: boolean
    audit: boolean
    multiLocation: boolean
  }
}

const MARKETING: Record<VendorPlanCode, PublicPlanMarketing> = {
  DEMO_14_DAYS: {
    nameEn: 'Free Trial',
    note: {
      tr: '14 günlük deneme süreci',
      en: '14-day risk-free trial',
    },
    features: {
      tr: ['1 klinik lokasyonu', '1 doktor / hekim', 'Sınırlı randevu akışı', 'Temel hasta kayıtları'],
      en: ['1 clinic location', '1 doctor / practitioner', 'Limited appointment volume', 'Basic patient records'],
    },
    ctaKind: 'register',
    popular: false,
    matrix: {
      users: { tr: '1', en: '1' },
      reminders: false,
      analytics: false,
      api: false,
      onboarding: false,
      audit: false,
      multiLocation: false,
    },
  },
  STARTER: {
    nameEn: 'Starter',
    note: {
      tr: 'Tek muayenehane veya hekim için',
      en: 'Single practitioner setup',
    },
    features: {
      tr: ['1 kullanıcı', 'Temel randevu düzeni', 'Hasta kayıtları', 'Hatırlatma akışı'],
      en: ['1 user', 'Core appointment flow', 'Patient records', 'Reminder flow'],
    },
    ctaKind: 'register',
    popular: false,
    matrix: {
      users: { tr: '1', en: '1' },
      reminders: true,
      analytics: false,
      api: false,
      onboarding: false,
      audit: false,
      multiLocation: false,
    },
  },
  PROFESSIONAL: {
    nameEn: 'Professional',
    note: {
      tr: 'Büyüyen poliklinikler ve merkezler',
      en: 'Best for growing multi-staff clinics',
    },
    features: {
      tr: ['5 kullanıcıya kadar', 'Ekip rolleri', 'Operasyon önerileri', 'Öncelikli destek'],
      en: ['Up to 5 users', 'Team roles', 'Ops suggestions', 'Priority support'],
    },
    ctaKind: 'register',
    popular: true,
    matrix: {
      users: { tr: '5', en: '5' },
      reminders: true,
      analytics: true,
      api: false,
      onboarding: false,
      audit: false,
      multiLocation: false,
    },
  },
  ENTERPRISE: {
    nameEn: 'Enterprise',
    note: {
      tr: 'Çoklu şube poliklinikler (hastane değil)',
      en: 'Multi-branch polyclinics (not hospitals)',
    },
    features: {
      tr: ['Sınırsız kullanıcı', 'Özel entegrasyonlar', 'Kurulum danışmanlığı', 'Gelişmiş yetkiler'],
      en: ['Unlimited users', 'Custom integrations', 'Setup consulting', 'Advanced permissions'],
    },
    ctaKind: 'demo',
    popular: false,
    matrix: {
      users: { tr: 'Sınırsız', en: 'Unlimited' },
      reminders: true,
      analytics: true,
      api: true,
      onboarding: true,
      audit: true,
      multiLocation: true,
    },
  },
}

export type PublicPricingPlan = VendorPlanDefinition & {
  marketing: PublicPlanMarketing
}

/** Full vendor catalog (demo + paid) — billing/admin surfaces only. */
export function listPublicPricingPlans(options?: { includeDemo?: boolean }): PublicPricingPlan[] {
  const includeDemo = options?.includeDemo ?? true
  return listVendorPlans({ includeDemo }).map((plan) => ({
    ...plan,
    marketing: MARKETING[plan.code],
  }))
}

/** Paid plans only — feature comparison tables. */
export function listPublicPaidPricingPlans(): PublicPricingPlan[] {
  return listPublicPricingPlans({ includeDemo: false })
}

/** Homepage + /fiyatlandirma plan cards — exactly 3 paid tiers (trial via register CTA). */
export function listPublicMarketingPlanCards(): PublicPricingPlan[] {
  return listPublicPaidPricingPlans()
}

export function publicPlanDisplayName(plan: PublicPricingPlan, locale: PublicPricingLocale) {
  return locale === 'en' ? plan.marketing.nameEn : plan.name
}

/** Monthly list price, or discounted monthly rate when billing annually. */
export function publicPlanMonthlyAmount(
  plan: PublicPricingPlan,
  cycle: PublicBillingCycle
): number | null {
  if (plan.demoOnly) return 0
  if (cycle === 'monthly') return plan.monthlyPriceEur
  return plan.yearlyPriceEur
}

export function formatPublicPlanPrice(
  amount: number | null,
  locale: PublicPricingLocale
): string {
  if (amount == null) return locale === 'tr' ? 'Özel' : 'Custom'
  if (amount === 0) return locale === 'tr' ? 'Ücretsiz' : 'Free'
  const formatted = amount.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US')
  return `€${formatted}`
}

export function isDemoPlanCode(code: string) {
  return code === DEMO_PLAN_CODE
}

/** Matrix row labels shared by homepage + pricing page. */
export const PUBLIC_PRICING_MATRIX_ROWS: Array<{
  id: keyof PublicPlanMarketing['matrix'] | 'users'
  label: Record<PublicPricingLocale, string>
  kind: 'users' | 'boolean'
  key: keyof PublicPlanMarketing['matrix']
}> = [
  {
    id: 'users',
    label: { tr: 'Kullanıcı limiti', en: 'User limit' },
    kind: 'users',
    key: 'users',
  },
  {
    id: 'reminders',
    label: { tr: 'Panel / e-posta hatırlatma', en: 'In-panel / email reminders' },
    kind: 'boolean',
    key: 'reminders',
  },
  {
    id: 'analytics',
    label: { tr: 'Analitik görünüm', en: 'Analytics view' },
    kind: 'boolean',
    key: 'analytics',
  },
  {
    id: 'api',
    label: { tr: 'Özel API entegrasyonu', en: 'Custom API integration' },
    kind: 'boolean',
    key: 'api',
  },
  {
    id: 'onboarding',
    label: { tr: 'Özel kurulum / eğitim', en: 'Custom setup & training' },
    kind: 'boolean',
    key: 'onboarding',
  },
  {
    id: 'audit',
    label: { tr: 'Denetim günlüğü & KVKK iş akışı', en: 'Audit log & KVKK workflow' },
    kind: 'boolean',
    key: 'audit',
  },
  {
    id: 'multiLocation',
    label: { tr: 'Çoklu şube & lokasyon', en: 'Multi-branch & locations' },
    kind: 'boolean',
    key: 'multiLocation',
  },
]
