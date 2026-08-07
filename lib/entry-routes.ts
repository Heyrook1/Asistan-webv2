import {
  type AuthLanguage,
  getLoginPath,
  getRegisterPath,
  normalizeAuthLanguage,
} from '@/lib/auth-routes'

/**
 * Canonical public entry funnels.
 * Every marketing CTA should resolve to one of these — not ad-hoc aliases.
 *
 * 1. Clinic trial/register → getClinicTrialPath
 * 2. Clinic login → getClinicLoginPath
 * 3. Patient booking (live web marketplace / PWA) → PATIENT_BOOK_PATH
 * 3b. Clinic public book link → getPublicBookPath(slug)
 * 4. Patient PWA install surface → PATIENT_PWA_PATH (/#uygulama)
 * 4b. Optional native-store update list → STORE_WAITLIST_PATH (/#waitlist)
 * 5. Clinic demo / sales → DEMO_CONTACT_PATH
 *
 * Labels: use ENTRY_CTA_* only. Avoid bare “Başla/Start”, “Erişim/Access”,
 * or “Demo” when the destination is trial/login/waitlist.
 */
export type EntryLanguage = AuthLanguage

export const PATIENT_BOOK_PATH = '/client'
/** Short share alias → /client */
export const PATIENT_BOOK_SHORT_PATH = '/r'
/** Home showcase — PWA-first patient install narrative. */
export const PATIENT_PWA_PATH = '/#uygulama'
/** Optional email list for future App Store / Play updates (secondary). */
export const STORE_WAITLIST_PATH = '/#waitlist'
export const DEMO_CONTACT_PATH = '/contact'
/** KKTC medical-tourism inbound (TR/EN/RU) — not travel agency */
export const VISIT_CYPRUS_PATH = '/visit-cyprus'

export { getLoginPath as getClinicLoginPath, getRegisterPath as getClinicTrialPath, normalizeAuthLanguage }
export {
  getPublicBookPath,
  getPublicBookEmbedPath,
  buildPublicBookEmbedSnippet,
} from '@/lib/public-booking/paths'

/** Canonical bilingual CTA labels — keep marketing copy in sync with these. */
export const ENTRY_CTA = {
  /** Secondary conversion — free trial (landing primary is demoRequest). */
  clinicTrial: {
    tr: '14 gün ücretsiz klinik dene',
    en: 'Try clinic free for 14 days',
    short: { tr: '14 gün ücretsiz', en: '14-day free trial' },
  },
  /** Hero / register risk reducer under the primary CTA. */
  clinicTrialRiskReducer: {
    tr: 'Kredi kartı gerekmez — paneli hemen açın',
    en: 'No credit card — open the panel now',
  },
  clinicLogin: {
    tr: 'Klinik paneline gir',
    en: 'Open clinic panel',
  },
  patientBook: {
    tr: '3 adımda randevu talep et',
    en: 'Request a booking in 3 steps',
    short: { tr: 'Randevu talep et', en: 'Request booking' },
  },
  patientPwaInstall: {
    tr: 'Uygulamayı yükle (PWA)',
    en: 'Install the app (PWA)',
  },
  storeWaitlist: {
    tr: 'Mağaza haberleri (isteğe bağlı)',
    en: 'Store updates (optional)',
  },
  /** Landing primary conversion — sales demo (not trial). */
  demoRequest: {
    tr: 'Demo rezerve et',
    en: 'Book a demo',
    short: { tr: 'Demo', en: 'Demo' },
  },
  demoRiskReducer: {
    tr: '20 dakikada paneli görün — taahhüt yok',
    en: 'See the panel in 20 minutes — no commitment',
  },
} as const

export function getPatientBookPath(): string {
  return PATIENT_BOOK_PATH
}

export function getPatientPwaPath(): string {
  return PATIENT_PWA_PATH
}

export function getStoreWaitlistPath(): string {
  return STORE_WAITLIST_PATH
}

export function getDemoContactPath(): string {
  return DEMO_CONTACT_PATH
}
