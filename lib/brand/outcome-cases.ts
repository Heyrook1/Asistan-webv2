/**
 * KKTC outcome / proof cases for marketing + sales.
 *
 * Guardrails (claim-bank + UI/UX brief):
 * - No named clinic logos or fake testimonials.
 * - Prefer process/ops before→after that product actually enables.
 * - Percent metrics only when source = 'signed_pilot' (replace placeholders before ads).
 * - Always show early-access / anonymized framing when published.
 * - Public surfaces must never serialize draft/status/internal ids.
 */

export type OutcomeMetric = {
  id: string
  label: { tr: string; en: string }
  before: string
  after: string
  /** Optional unit hint shown under the pair */
  note?: { tr: string; en: string }
}

/** Internal catalog row — never pass straight to client components. */
export type OutcomeCase = {
  id: string
  /** Only `published` render on public surfaces */
  status: 'published' | 'draft'
  /** Stable icon bucket for UI — not a CMS document id */
  iconKey: 'dental' | 'roles' | 'booking' | 'generic'
  /** Anonymized archetype — never a real clinic trade name without written approval */
  clinicType: { tr: string; en: string }
  region: { tr: string; en: string }
  period: { tr: string; en: string }
  headline: { tr: string; en: string }
  summary: { tr: string; en: string }
  metrics: OutcomeMetric[]
  source: 'process_pilot' | 'signed_pilot'
  sourceLabel: { tr: string; en: string }
}

/**
 * Public marketing DTO — no status, source enum, or internal document keys.
 */
export type PublicOutcomeCase = {
  iconKey: OutcomeCase['iconKey']
  clinicType: OutcomeCase['clinicType']
  region: OutcomeCase['region']
  period: OutcomeCase['period']
  headline: OutcomeCase['headline']
  summary: OutcomeCase['summary']
  metrics: Array<{
    label: OutcomeMetric['label']
    before: string
    after: string
    note?: OutcomeMetric['note']
  }>
  sourceLabel: OutcomeCase['sourceLabel']
}

/**
 * Process-pilot drafts — NOT public until a real clinic pilot is documented
 * (written approval + measurement method). Invented 45/60/90-day cards must stay draft.
 */
export const OUTCOME_CASES: OutcomeCase[] = [
  {
    id: 'kktc-dental-single-agenda',
    status: 'draft',
    iconKey: 'dental',
    clinicType: { tr: 'Diş kliniği (1–2 hekim)', en: 'Dental clinic (1–2 clinicians)' },
    region: { tr: 'Lefkoşa bölgesi · anonim', en: 'Nicosia area · anonymized' },
    period: { tr: '90 günlük erken erişim pilotu', en: '90-day early-access pilot' },
    headline: {
      tr: 'Excel + WhatsApp + defter → tek ajanda',
      en: 'Excel + WhatsApp + notebook → one agenda',
    },
    summary: {
      tr: 'Randevu durumu tek panelde; sekreter ve hekim aynı günü görüyor. “Kim neyi onayladı?” tartışması azaldı.',
      en: 'Appointment status lives in one panel; front desk and clinician see the same day. Fewer “who confirmed what?” threads.',
    },
    metrics: [
      {
        id: 'tools',
        label: { tr: 'Randevu araçları', en: 'Scheduling tools' },
        before: '3+ kanal',
        after: '1 panel',
        note: { tr: 'Defter / Excel / WA grubu', en: 'Notebook / Excel / WA group' },
      },
      {
        id: 'status',
        label: { tr: 'Durum kaydı', en: 'Status discipline' },
        before: 'Sözlü / dağınık',
        after: 'Panelde durum',
        note: { tr: 'Bekleyen → onaylı → tamamlandı / gelinmedi', en: 'Pending → confirmed → done / no-show' },
      },
      {
        id: 'visibility',
        label: { tr: 'No-show görünürlüğü', en: 'No-show visibility' },
        before: 'Ölçülmüyor',
        after: 'Haftalık izleniyor',
        note: { tr: 'Analitik hunisinde gelinmedi sayısı', en: 'No-show count in ops analytics' },
      },
    ],
    source: 'process_pilot',
    sourceLabel: {
      tr: 'Anonimleştirilmiş KKTC süreç pilotu · isimli referans değil',
      en: 'Anonymized KKTC process pilot · not a named endorsement',
    },
  },
  {
    id: 'kktc-multi-staff-roles',
    status: 'draft',
    iconKey: 'roles',
    clinicType: { tr: 'Çoklu ekip polikliniği', en: 'Multi-staff outpatient clinic' },
    region: { tr: 'Mağusa bölgesi · anonim', en: 'Famagusta area · anonymized' },
    period: { tr: '60 günlük erken erişim pilotu', en: '60-day early-access pilot' },
    headline: {
      tr: 'Ortak hesap → rol bazlı erişim',
      en: 'Shared login → role-based access',
    },
    summary: {
      tr: 'Hekim yalnızca kendi ajandasını; sekreter randevu; sahip ayarları görüyor. Yanlışlıkla silme / not görme riski düştü.',
      en: 'Clinicians see their agenda; front desk books; owner manages settings. Fewer accidental edits or chart peeks.',
    },
    metrics: [
      {
        id: 'accounts',
        label: { tr: 'Giriş modeli', en: 'Access model' },
        before: 'Paylaşılan şifre',
        after: 'Kişi + rol',
      },
      {
        id: 'audit',
        label: { tr: 'Hassas işlem izi', en: 'Sensitive action trail' },
        before: 'Yok / belirsiz',
        after: 'Denetim günlüğü',
      },
      {
        id: 'permissions',
        label: { tr: 'Hasta not erişimi', en: 'Chart note access' },
        before: 'Herkes (fiilen)',
        after: 'Tıbbi not izni',
      },
    ],
    source: 'process_pilot',
    sourceLabel: {
      tr: 'Anonimleştirilmiş KKTC süreç pilotu · isimli referans değil',
      en: 'Anonymized KKTC process pilot · not a named endorsement',
    },
  },
  {
    id: 'kktc-beauty-booking-link',
    status: 'draft',
    iconKey: 'booking',
    clinicType: { tr: 'Estetik / cilt kliniği', en: 'Aesthetic / skin clinic' },
    region: { tr: 'Girne bölgesi · anonim', en: 'Kyrenia area · anonymized' },
    period: { tr: '45 günlük erken erişim pilotu', en: '45-day early-access pilot' },
    headline: {
      tr: 'Bio DM → genel randevu linki',
      en: 'Bio DMs → public booking link',
    },
    summary: {
      tr: 'Instagram bio’daki `/book` linki talebi panele düşürüyor; sekreter saat seçmek yerine onaylıyor. Ön kayıt formu pilotta eklendi.',
      en: 'The /book link from Instagram bio creates requests in the panel; front desk confirms instead of negotiating times. Intake form added in-pilot.',
    },
    metrics: [
      {
        id: 'intake',
        label: { tr: 'İlk iletişim', en: 'First touch' },
        before: 'DM / telefon',
        after: 'Link + form',
      },
      {
        id: 'front-desk',
        label: { tr: 'Sekreter yükü (talep)', en: 'Front-desk load (intake)' },
        before: 'Slot pazarlığı',
        after: 'Onay / ayar',
      },
      {
        id: 'previsit',
        label: { tr: 'Ön ziyaret bilgi', en: 'Pre-visit info' },
        before: 'Kağıt / çağrı',
        after: 'Anket → hasta kartı',
      },
    ],
    source: 'process_pilot',
    sourceLabel: {
      tr: 'Anonimleştirilmiş KKTC süreç pilotu · isimli referans değil',
      en: 'Anonymized KKTC process pilot · not a named endorsement',
    },
  },
]

/**
 * Internal signed-% template — never included in public queries.
 * Kept for ops/docs; not part of OUTCOME_CASES publish set.
 */
export const SIGNED_METRIC_CASE_TEMPLATE: OutcomeCase = {
  id: 'kktc-signed-noshow-template',
  status: 'draft',
  iconKey: 'generic',
  clinicType: { tr: 'Klinik tipi (onay sonrası)', en: 'Clinic type (after approval)' },
  region: { tr: 'KKTC · isim gizli', en: 'Northern Cyprus · name withheld' },
  period: { tr: 'Örn. 120 gün', en: 'e.g. 120 days' },
  headline: {
    tr: 'No-show %X → %Y (imzalı paylaşım)',
    en: 'No-show %X → %Y (signed disclosure)',
  },
  summary: {
    tr: 'Yalnızca klinik yazılı onayı + ölçüm yöntemi (payda) kayda geçince yayınlanır.',
    en: 'Publish only after written clinic approval and a documented denominator method.',
  },
  metrics: [
    {
      id: 'noshow',
      label: { tr: 'No-show oranı', en: 'No-show rate' },
      before: '—%',
      after: '—%',
      note: { tr: 'Payda: tamamlanan + gelinmedi', en: 'Denominator: completed + no-show' },
    },
    {
      id: 'ops-nps',
      label: { tr: 'Operasyon NPS (ekip)', en: 'Ops NPS (staff)' },
      before: '—',
      after: '—',
    },
  ],
  source: 'signed_pilot',
  sourceLabel: {
    tr: 'İmzalı pilot · yayın kapalı (draft)',
    en: 'Signed pilot · unpublished (draft)',
  },
}

export const OUTCOME_CASES_DISCLAIMER = {
  tr: 'Kamuya açık sonuç kartları yalnızca belgelenmiş klinik pilotu ve onaylı ölçümle yayınlanır. Yüzdelik sonuçlar için yazılı klinik onayı zorunludur.',
  en: 'Public outcome cards ship only with a documented clinic pilot and approved measurement. Percentage results require written clinic approval.',
} as const

/** Full internal catalog including drafts (ops/tests only — not for UI props). */
export function listAllOutcomeCases(): OutcomeCase[] {
  return [...OUTCOME_CASES, SIGNED_METRIC_CASE_TEMPLATE]
}

function toPublicOutcomeCase(item: OutcomeCase): PublicOutcomeCase {
  return {
    iconKey: item.iconKey,
    clinicType: item.clinicType,
    region: item.region,
    period: item.period,
    headline: item.headline,
    summary: item.summary,
    metrics: item.metrics.map(({ label, before, after, note }) => ({
      label,
      before,
      after,
      ...(note ? { note } : {}),
    })),
    sourceLabel: item.sourceLabel,
  }
}

/** Published + approved rows only, as a client-safe DTO. */
export function listPublicOutcomeCases(): PublicOutcomeCase[] {
  return OUTCOME_CASES.filter((item) => item.status === 'published').map(toPublicOutcomeCase)
}

/** @deprecated Prefer listPublicOutcomeCases for any UI surface. */
export function listPublishedOutcomeCases() {
  return OUTCOME_CASES.filter((item) => item.status === 'published')
}

export function getOutcomeCaseById(id: string) {
  return listAllOutcomeCases().find((item) => item.id === id) ?? null
}

/** Public lookup — draft/internal ids resolve to null. */
export function getPublicOutcomeCaseById(id: string): PublicOutcomeCase | null {
  const row = OUTCOME_CASES.find((item) => item.id === id && item.status === 'published')
  return row ? toPublicOutcomeCase(row) : null
}
