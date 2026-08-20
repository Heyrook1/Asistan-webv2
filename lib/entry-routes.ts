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
/** Home showcase — patient web app (PWA). Native Expo store is not claimed live here. */
export const PATIENT_PWA_PATH = '/client'
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
  /** Primary conversion — self-serve free trial. */
  clinicTrial: {
    tr: 'Kliniğinizde 14 gün ücretsiz deneyin',
    en: 'Try it free for 14 days in your clinic',
    short: { tr: '14 gün ücretsiz dene', en: '14-day free trial' },
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
    tr: '3 adımda randevu talebi gönder',
    en: 'Send a booking request in 3 steps',
    short: { tr: 'Randevu talebi gönder', en: 'Send request' },
  },
  patientPwaInstall: {
    tr: 'Uygulamayı yükle (PWA)',
    en: 'Install the app (PWA)',
  },
  storeWaitlist: {
    tr: 'Mağaza haberleri (isteğe bağlı)',
    en: 'Store updates (optional)',
  },
  /** Landing primary conversion — sales demo request (contact form, not calendar). */
  demoRequest: {
    tr: 'Demo talep et',
    en: 'Request a demo',
    short: { tr: 'Demo talep et', en: 'Request demo' },
  },
  demoRiskReducer: {
    tr: 'İletişim formu — canlı takvim yok; hedef yanıt 1 iş günü',
    en: 'Contact form — no live calendar; target reply 1 business day',
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
