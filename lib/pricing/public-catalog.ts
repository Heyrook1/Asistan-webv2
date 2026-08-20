/**
 * Public marketing pricing — single source of truth.
 * Amounts and plan codes come from `lib/vendor-membership.ts`.
 * Do not hardcode TRY prices in UI components.
 *
 * Security rule: tenant isolation, basic RBAC, and mandatory privacy / in-product
 * audit controls ship on every plan. Only advanced audit export / governance may
 * differentiate upper tiers — never core security.
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
    /** Core security — always true; never a plan differentiator. */
    tenantIsolation: boolean
    roleAccess: boolean
    privacyControls: boolean
    /** Advanced audit export / governance — upper tier only. */
    auditExport: boolean
    multiLocation: boolean
  }
}

/** Core security flags — shared by every public plan (including trial). */
const CORE_SECURITY_MATRIX = {
  tenantIsolation: true,
  roleAccess: true,
  privacyControls: true,
} as const

const MARKETING: Record<VendorPlanCode, PublicPlanMarketing> = {
  DEMO_14_DAYS: {
    nameEn: 'Free Trial',
    note: {
      tr: '14 günlük deneme süreci',
      en: '14-day risk-free trial',
    },
    features: {
      tr: [
        '1 klinik lokasyonu',
        '1 doktor / hekim',
        'Sınırlı randevu akışı',
        'Temel güvenlik (veri ayrımı, roller, gizlilik)',
      ],
      en: [
        '1 clinic location',
        '1 doctor / practitioner',
        'Limited appointment volume',
        'Core security (isolation, roles, privacy)',
      ],
    },
    ctaKind: 'register',
    popular: false,
    matrix: {
      users: { tr: '1', en: '1' },
      reminders: false,
      analytics: false,
      api: false,
      onboarding: false,
      ...CORE_SECURITY_MATRIX,
      auditExport: false,
      multiLocation: false,
    },
  },
  STARTER: {
    nameEn: 'Starter',
    note: {
      tr: 'Tek muayenehane veya hekim — erken erişim liste fiyatı',
      en: 'Single practitioner — early-access list price',
    },
    features: {
      tr: [
        '1 kullanıcı',
        'Temel randevu düzeni',
        'Hasta kayıtları',
        'Panel / e-posta hatırlatma',
        'Temel güvenlik tüm planlarda',
      ],
      en: [
        '1 user',
        'Core appointment flow',
        'Patient records',
        'In-panel / email reminders',
        'Core security on every plan',
      ],
    },
    ctaKind: 'register',
    popular: false,
    matrix: {
      users: { tr: '1', en: '1' },
      reminders: true,
      analytics: false,
      api: false,
      onboarding: false,
      ...CORE_SECURITY_MATRIX,
      auditExport: false,
      multiLocation: false,
    },
  },
  PROFESSIONAL: {
    nameEn: 'Professional',
    note: {
      tr: 'Büyüyen poliklinikler — önce demo / deneme önerilir',
      en: 'Growing clinics — demo / trial first recommended',
    },
    features: {
      tr: [
        '5 kullanıcıya kadar',
        'Ekip rolleri',
        'Operasyon görünümleri',
        'Standart klinik destek',
        'Temel güvenlik tüm planlarda',
      ],
      en: [
        'Up to 5 users',
        'Team roles',
        'Ops views',
        'Standard clinic support',
        'Core security on every plan',
      ],
    },
    ctaKind: 'register',
    popular: true,
    matrix: {
      users: { tr: '5', en: '5' },
      reminders: true,
      analytics: true,
      api: false,
      onboarding: false,
      ...CORE_SECURITY_MATRIX,
      auditExport: false,
      multiLocation: false,
    },
  },
  ENTERPRISE: {
    nameEn: 'Enterprise',
    note: {
      tr: 'Çoklu şube — yalnızca demo ile başlar (hastane değil)',
      en: 'Multi-branch — demo-led only (not hospitals)',
    },
    features: {
      tr: [
        'Sınırsız kullanıcı',
        'Özel entegrasyonlar (planlı)',
        'Kurulum danışmanlığı',
        'Gelişmiş denetim dışa aktarma / yönetişim',
      ],
      en: [
        'Unlimited users',
        'Custom integrations (planned)',
        'Setup consulting',
        'Advanced audit export / governance',
      ],
    },
    ctaKind: 'demo',
    popular: false,
    matrix: {
      users: { tr: 'Sınırsız', en: 'Unlimited' },
      reminders: true,
      analytics: true,
      api: true,
      onboarding: true,
      ...CORE_SECURITY_MATRIX,
      auditExport: true,
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
  if (cycle === 'monthly') return plan.monthlyPriceTry
  return plan.yearlyPriceTry
}

/**
 * Amount charged when paying annual upfront.
 * `yearlyPriceTry` in the catalog is the monthly-equivalent rate.
 */
export function publicPlanAnnualPrepaidAmount(plan: PublicPricingPlan): number | null {
  if (plan.demoOnly) return 0
  if (plan.yearlyPriceTry == null || plan.yearlyPriceTry <= 0) return null
  return plan.yearlyPriceTry * 12
}

export function formatPublicPlanPrice(
  amount: number | null,
  locale: PublicPricingLocale
): string {
  if (amount == null) return locale === 'tr' ? 'İletişime geçiniz' : 'Contact us'
  if (amount === 0) return locale === 'tr' ? 'Ücretsiz' : 'Free'
  const formatted = amount.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US')
  return `${formatted} TRY`
}

/** Early-access pricing honesty — list price ≠ mature SaaS proof pack. */
export const PUBLIC_PRICING_PROOF_GATE: Record<
  PublicPricingLocale,
  {
    title: string
    body: string
    bullets: string[]
  }
> = {
  tr: {
    title: 'Erken erişim şeffaflık notları',
    body:
      'Plan kartları bugünkü kapsamı ve liste fiyatını gösterir. Demo veya 14 günlük denemede randevu akışı ve destek uyumunu doğrulayın.',
    bullets: [
      'Bugün güçlü olan: klinik paneli, gerçek slot randevusu, işletme bazlı güvenlik kontrolleri.',
      'Kanıt kapısı açık değilse iddia etmiyoruz: sahte logo/sertifika, uydurma NPS/%, imzasız “ROI garantisi”.',
      'SMS/WhatsApp: destek ile bağlanabilir — varsayılan “canlı bildirim paketi” değildir.',
      'Ücretli geçiş: demo veya denemede randevu akışı ve destek süreci netleştikten sonra.',
    ],
  },
  en: {
    title: 'Early-access transparency notes',
    body:
      'Plan cards show today’s scope and list price. Confirm booking-flow and support fit during a demo or 14-day trial.',
    bullets: [
      'Strong today: clinic panel, real slot booking, business-level security controls.',
      'We do not invent proof: fake logos/certs, fabricated NPS/%, unsigned “ROI guarantees”.',
      'SMS/WhatsApp: webhook integration option — not a default “live notification pack”.',
      'Paid conversion after demo/trial shows booking flow and support fit.',
    ],
  },
}

/** Billing / tax honesty for marketing surfaces (no invented VAT rates). */
export const PUBLIC_PRICING_BILLING_DISCLOSURE: Record<
  PublicPricingLocale,
  {
    title: string
    bullets: string[]
  }
> = {
  tr: {
    title: 'Vergi, para birimi ve tahsilat',
    bullets: [
      'Listelenen tutarlar TRY cinsindendir; faturada ayrıca belirtilmedikçe KDV/vergi hariçtir. Uygulanacak vergi oranı fatura anında netleşir.',
      'Başlangıç ve Profesyonel paket tahsilatı TRY üzerinden planlanır (kart veya fatura).',
      'Kurumsal paket, klinik yapısı ve entegrasyon ihtiyacına göre tekliflendirilir.',
    ],
  },
  en: {
    title: 'Tax, currency, and billing',
    bullets: [
      'Listed amounts are in TRY and exclude VAT/tax unless the invoice states otherwise. Applicable tax is confirmed on the invoice.',
      'Starter and Professional plans are billed in TRY (card or invoice).',
      'Enterprise is quoted based on clinic structure and integration needs.',
    ],
  },
}

export function isDemoPlanCode(code: string) {
  return code === DEMO_PLAN_CODE
}

/**
 * Matrix rows — core security first (all plans), then capacity/ops differentiators.
 * Do not put tenant isolation / RBAC / privacy behind a paid tier.
 */
export const PUBLIC_PRICING_MATRIX_ROWS: Array<{
  id: keyof PublicPlanMarketing['matrix'] | 'users'
  label: Record<PublicPricingLocale, string>
  kind: 'users' | 'boolean'
  key: keyof PublicPlanMarketing['matrix']
  /** When true, row is baseline security (expected ✓ on every plan). */
  coreSecurity?: boolean
}> = [
  {
    id: 'users',
    label: { tr: 'Kullanıcı limiti', en: 'User limit' },
    kind: 'users',
    key: 'users',
  },
  {
    id: 'tenantIsolation',
    label: { tr: 'İşletme bazlı veri ayrımı', en: 'Business-level data isolation' },
    kind: 'boolean',
    key: 'tenantIsolation',
    coreSecurity: true,
  },
  {
    id: 'roleAccess',
    label: { tr: 'Temel rol güvenliği (RBAC)', en: 'Basic role security (RBAC)' },
    kind: 'boolean',
    key: 'roleAccess',
    coreSecurity: true,
  },
  {
    id: 'privacyControls',
    label: {
      tr: 'Zorunlu gizlilik + ürün içi denetim günlüğü',
      en: 'Required privacy + in-product audit log',
    },
    kind: 'boolean',
    key: 'privacyControls',
    coreSecurity: true,
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
    id: 'auditExport',
    label: {
      tr: 'Gelişmiş denetim dışa aktarma / yönetişim',
      en: 'Advanced audit export / governance',
    },
    kind: 'boolean',
    key: 'auditExport',
  },
  {
    id: 'multiLocation',
    label: { tr: 'Çoklu şube & lokasyon', en: 'Multi-branch & locations' },
    kind: 'boolean',
    key: 'multiLocation',
  },
]
