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
 * 3. Patient booking (live web) → PATIENT_BOOK_PATH
 * 4. Store early-access waitlist → STORE_WAITLIST_PATH
 * 5. Clinic demo / sales → DEMO_CONTACT_PATH
 *
 * Labels: use ENTRY_CTA_* only. Avoid bare “Başla/Start”, “Erişim/Access”,
 * or “Demo” when the destination is trial/login/waitlist.
 */
export type EntryLanguage = AuthLanguage

export const PATIENT_BOOK_PATH = '/client'
/** Home-page waitlist section; works from any route via absolute hash. */
export const STORE_WAITLIST_PATH = '/#waitlist'
export const DEMO_CONTACT_PATH = '/contact'

export { getLoginPath as getClinicLoginPath, getRegisterPath as getClinicTrialPath, normalizeAuthLanguage }

/** Canonical bilingual CTA labels — keep marketing copy in sync with these. */
export const ENTRY_CTA = {
  clinicTrial: {
    tr: 'Klinik denemesini başlat',
    en: 'Start clinic trial',
    short: { tr: 'Klinik denemesi', en: 'Clinic trial' },
  },
  clinicLogin: {
    tr: 'Klinik girişi',
    en: 'Clinic login',
  },
  patientBook: {
    tr: 'Hasta randevusu al',
    en: 'Book as patient',
    short: { tr: 'Hasta randevusu', en: 'Patient booking' },
  },
  storeWaitlist: {
    tr: 'Mağaza bekleme listesi',
    en: 'Join store waitlist',
  },
  demoRequest: {
    tr: 'Demo talep et',
    en: 'Request a demo',
  },
} as const

export function getPatientBookPath(): string {
  return PATIENT_BOOK_PATH
}

export function getStoreWaitlistPath(): string {
  return STORE_WAITLIST_PATH
}

export function getDemoContactPath(): string {
  return DEMO_CONTACT_PATH
}
