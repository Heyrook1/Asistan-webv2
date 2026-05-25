export const VENDOR_MEMBERSHIP_STATUSES = ['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED'] as const

export type VendorMembershipStatusValue = (typeof VENDOR_MEMBERSHIP_STATUSES)[number]

export const DEFAULT_VENDOR_MEMBERSHIP_STATUS: VendorMembershipStatusValue = 'TRIAL'

export const VENDOR_ACCOUNT_SOURCES = ['SELF_SIGNUP', 'ADMIN_CREATED'] as const
export type VendorAccountSourceValue = (typeof VENDOR_ACCOUNT_SOURCES)[number]

export const DEMO_TRIAL_DAYS = 14
export const DEMO_PLAN_CODE = 'DEMO_14_DAYS'
export const DEFAULT_VENDOR_PLAN_CODE = 'STARTER'

export const VENDOR_PLAN_CODES = [DEMO_PLAN_CODE, DEFAULT_VENDOR_PLAN_CODE, 'PROFESSIONAL', 'ENTERPRISE'] as const
export type VendorPlanCode = (typeof VENDOR_PLAN_CODES)[number]

export type VendorPlanDefinition = {
  code: VendorPlanCode
  name: string
  monthlyPriceEur: number | null
  yearlyPriceEur: number | null
  userLimit: number | null
  description: string
  features: string[]
  demoOnly?: boolean
}

const VENDOR_PLANS: Record<VendorPlanCode, VendorPlanDefinition> = {
  DEMO_14_DAYS: {
    code: 'DEMO_14_DAYS',
    name: 'Demo 14 Gun',
    monthlyPriceEur: 0,
    yearlyPriceEur: 0,
    userLimit: 1,
    description: 'Kayit ol ile acilan deneme hesabi',
    features: ['1 kullanici', 'Temel randevu', 'Hasta karti', 'Hatirlatma akisi'],
    demoOnly: true,
  },
  STARTER: {
    code: 'STARTER',
    name: 'Baslangic',
    monthlyPriceEur: 149,
    yearlyPriceEur: 119,
    userLimit: 1,
    description: 'Tek hekimli ekipler ve kucuk klinikler icin.',
    features: ['1 kullanici', 'Temel randevu', 'Hasta karti', 'Hatirlatma akisi'],
  },
  PROFESSIONAL: {
    code: 'PROFESSIONAL',
    name: 'Profesyonel',
    monthlyPriceEur: 249,
    yearlyPriceEur: 199,
    userLimit: 5,
    description: 'Buyuyen klinikler icin en dengeli paket.',
    features: ['5 kullanici', 'AI onerileri', 'Ekip rolleri', 'Oncelikli destek', 'Analitik gorunum'],
  },
  ENTERPRISE: {
    code: 'ENTERPRISE',
    name: 'Kurumsal',
    monthlyPriceEur: 499,
    yearlyPriceEur: 399,
    userLimit: null,
    description: 'Coklu ekip ve ozel surecler icin.',
    features: ['Sinirsiz kullanici', 'Ozel entegrasyonlar', 'Kurulum danismanligi', 'Gelismis yetkiler'],
  },
}

const PLAN_ALIAS_MAP: Record<string, VendorPlanCode> = {
  BASLANGIC: 'STARTER',
  STARTER: 'STARTER',
  PROFESSIONAL: 'PROFESSIONAL',
  PRO: 'PROFESSIONAL',
  PRO_PLAN: 'PROFESSIONAL',
  KURUMSAL: 'ENTERPRISE',
  ENTERPRISE: 'ENTERPRISE',
  DEMO: 'DEMO_14_DAYS',
  DEMO_14_DAYS: 'DEMO_14_DAYS',
}

export const VENDOR_MEMBERSHIP_LABELS: Record<VendorMembershipStatusValue, string> = {
  TRIAL: 'Trial',
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  CANCELLED: 'Cancelled',
}

export function getVendorPlanDefinition(plan: string | null | undefined): VendorPlanDefinition {
  const code = normalizeVendorPlanCode(plan)
  return VENDOR_PLANS[code]
}

export function normalizeVendorPlanCode(plan: string | null | undefined): VendorPlanCode {
  if (!plan) return DEFAULT_VENDOR_PLAN_CODE
  const normalized = plan.trim().toUpperCase()
  return PLAN_ALIAS_MAP[normalized] ?? DEFAULT_VENDOR_PLAN_CODE
}

export function getVendorPlanName(plan: string | null | undefined) {
  return getVendorPlanDefinition(plan).name
}

export function getVendorPlanUserLimit(input: {
  plan: string | null | undefined
  isDemo?: boolean | null
}) {
  if (input.isDemo) return 1
  return getVendorPlanDefinition(input.plan).userLimit
}

export function listVendorPlans(options?: { includeDemo?: boolean }) {
  const includeDemo = options?.includeDemo ?? false
  return VENDOR_PLAN_CODES.map((code) => VENDOR_PLANS[code]).filter((plan) =>
    includeDemo ? true : !plan.demoOnly
  )
}

export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}
