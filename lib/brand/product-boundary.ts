/**
 * Product depth boundary — outpatient SMB first.
 * Hospital / LIS / telehealth / official e-reçete integrations are postponed
 * until KKTC density warrants them. See docs/product-boundary.md.
 */

export const PRODUCT_FOCUS = {
  stage: 'outpatient-smb' as const,
  geography: 'kktc-first' as const,
  primaryBuyer: {
    tr: 'KKTC poliklinik / muayenehane / çok-hekim merkez',
    en: 'Northern Cyprus outpatient clinic / practice / multi-clinician centre',
  },
} as const

/** Capabilities we may describe as present-tense product. */
export const IN_SCOPE_CAPABILITIES = [
  'clinic-agenda',
  'patient-chart-light',
  'team-rbac',
  'public-booking',
  'patient-pwa',
  'printable-prescription-draft',
  'kktc-efatura-draft',
  'whatsapp-front-desk-rules',
  'asistan-passport-visits',
  'kktc-medical-tourism-routing',
  'kvkk-oriented-controls',
] as const

/** Present-tense marketing or sales claims for these are forbidden until un-postponed. */
export const POSTPONED_CAPABILITIES = [
  {
    id: 'official-erecete',
    tr: 'Resmi / ulusal e-reçete ağ entegrasyonu',
    en: 'Official national e-prescription network integration',
  },
  {
    id: 'tr-gib-esmm',
    tr: 'TR GİB e-SMM / e-Fatura sertifikalı entegrasyon',
    en: 'TR GİB e-SMM / e-invoice certified integration',
  },
  {
    id: 'travel-agency-visa-hotel',
    tr: 'Seyahat acentesi / vize / otel satış ürünü',
    en: 'Travel agency / visa / hotel product',
  },
  {
    id: 'fhir-medical-passport',
    tr: 'FHIR / tıbbi pasaport / Apple Health senkronu',
    en: 'FHIR / medical passport / Apple Health sync',
  },
  {
    id: 'llm-voice-front-desk',
    tr: 'LLM / sesli AI ön-büro (kanıtlı model + prod ses)',
    en: 'LLM / voice AI front desk (proven model + prod voice)',
  },
  {
    id: 'lis',
    tr: 'LIS / laboratuvar cihaz entegrasyonu',
    en: 'LIS / lab instrument integration',
  },
  {
    id: 'telehealth',
    tr: 'Telehealth / video muayene',
    en: 'Telehealth / video visits',
  },
  {
    id: 'rooms-wards',
    tr: 'Oda / yatak / servis çizelgesi',
    en: 'Room / bed / ward scheduling',
  },
  {
    id: 'hospital-emr',
    tr: 'Hastane EMR / HIS paket entegrasyonu',
    en: 'Hospital EMR / HIS suite integration',
  },
] as const

export const PRODUCT_BOUNDARY_SUMMARY = {
  tr: 'Poliklinik operasyonu önce; resmi e-reçete, LIS, telehealth ve hastane katmanı ertelendi.',
  en: 'Outpatient clinic ops first; official e-prescription, LIS, telehealth, and hospital layer postponed.',
} as const
