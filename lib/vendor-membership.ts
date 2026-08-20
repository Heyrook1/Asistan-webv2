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
  monthlyPriceTry: number | null
  yearlyPriceTry: number | null
  userLimit: number | null
  description: string
  features: string[]
  demoOnly?: boolean
}

const VENDOR_PLANS: Record<VendorPlanCode, VendorPlanDefinition> = {
  DEMO_14_DAYS: {
    code: 'DEMO_14_DAYS',
    name: 'Demo 14 Gün',
    monthlyPriceTry: 0,
    yearlyPriceTry: 0,
    userLimit: 1,
    description: 'Kayıt ol ile açılan deneme hesabı',
    features: ['1 kullanıcı', 'Temel randevu', 'Hasta kartı', 'Hatırlatma akışı'],
    demoOnly: true,
  },
  STARTER: {
    code: 'STARTER',
    name: 'Başlangıç',
    monthlyPriceTry: 1000,
    yearlyPriceTry: 1000,
    userLimit: 1,
    description: 'Tek hekimli ekipler ve küçük klinikler için.',
    features: ['1 kullanıcı', 'Temel randevu', 'Hasta kartı', 'Hatırlatma akışı'],
  },
  PROFESSIONAL: {
    code: 'PROFESSIONAL',
    name: 'Profesyonel',
    monthlyPriceTry: 2500,
    yearlyPriceTry: 2500,
    userLimit: 5,
    description: 'Büyüyen klinikler için en dengeli paket.',
    features: ['5 kullanıcı', 'Operasyon önerileri', 'Ekip rolleri', 'Öncelikli destek', 'Analitik görünüm'],
  },
  ENTERPRISE: {
    code: 'ENTERPRISE',
    name: 'Kurumsal',
    monthlyPriceTry: null,
    yearlyPriceTry: null,
    userLimit: null,
    description: 'Çoklu ekip ve özel süreçler için.',
    features: ['Sınırsız kullanıcı', 'Özel entegrasyonlar', 'Kurulum danışmanlığı', 'Gelişmiş yetkiler'],
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
  TRIAL: 'Deneme',
  ACTIVE: 'Aktif',
  SUSPENDED: 'Askıda',
  CANCELLED: 'İptal',
}

export type MembershipUrgency = 'ok' | 'soon' | 'critical' | 'expired'

/** Whole calendar days until accessEndAt. Negative means already past. Null if no end date. */
export function daysUntilAccessEnd(accessEndAt: Date | string | null | undefined, now = new Date()): number | null {
  if (!accessEndAt) return null
  const end = typeof accessEndAt === 'string' ? new Date(accessEndAt) : accessEndAt
  if (Number.isNaN(end.getTime())) return null
  const ms = end.getTime() - now.getTime()
  return Math.ceil(ms / (24 * 60 * 60 * 1000))
}

export function getMembershipUrgency(input: {
  accessEndAt?: Date | string | null
  status?: string | null
  now?: Date
}): MembershipUrgency {
  const status = (input.status ?? '').toUpperCase()
  if (status === 'SUSPENDED' || status === 'CANCELLED') return 'expired'

  const days = daysUntilAccessEnd(input.accessEndAt, input.now)
  if (days === null) return 'ok'
  if (days <= 0) return 'expired'
  if (days <= 3) return 'critical'
  if (days <= 14) return 'soon'
  return 'ok'
}

export function buildMembershipRenewMailto(input: {
  businessName: string
  businessId: string
  planName: string
  accessEndAt?: string | null
}) {
  const subject = encodeURIComponent(`Paket yenileme talebi — ${input.businessName}`)
  const endLine = input.accessEndAt
    ? `Erişim bitiş: ${new Date(input.accessEndAt).toLocaleDateString('tr-TR')}`
    : 'Erişim bitiş: belirtilmemiş'
  const body = encodeURIComponent(
    [
      'Merhaba Asistan ekibi,',
      '',
      'Klinik paketimizi yenilemek / yükseltmek istiyoruz.',
      '',
      `İşletme: ${input.businessName}`,
      `İşletme ID: ${input.businessId}`,
      `Mevcut plan: ${input.planName}`,
      endLine,
      '',
      'İletişim bilgisini bu e-postadan kullanabilirsiniz.',
    ].join('\n')
  )
  return `mailto:merhaba@asistan.online?subject=${subject}&body=${body}`
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

export const MEMBERSHIP_BILLING_PERIODS = ['MONTHLY', 'YEARLY'] as const
export type MembershipBillingPeriodValue = (typeof MEMBERSHIP_BILLING_PERIODS)[number]

export const PAID_VENDOR_PLAN_CODES = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] as const
export type PaidVendorPlanCode = (typeof PAID_VENDOR_PLAN_CODES)[number]

export function isPaidVendorPlanCode(code: string): code is PaidVendorPlanCode {
  return (PAID_VENDOR_PLAN_CODES as readonly string[]).includes(code)
}

/** Monthly catalog amount; yearly = monthly rate × 12 (no annual discount). */
export function getVendorPlanPrice(
  plan: string | null | undefined,
  period: MembershipBillingPeriodValue
): { amount: number; currency: 'TRY'; durationDays: number } | null {
  const def = getVendorPlanDefinition(plan)
  if (def.demoOnly) return null
  if (period === 'MONTHLY') {
    if (def.monthlyPriceTry == null || def.monthlyPriceTry <= 0) return null
    return { amount: def.monthlyPriceTry, currency: 'TRY', durationDays: 30 }
  }
  if (def.yearlyPriceTry == null || def.yearlyPriceTry <= 0) return null
  return { amount: def.yearlyPriceTry * 12, currency: 'TRY', durationDays: 365 }
}
