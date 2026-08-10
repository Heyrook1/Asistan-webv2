export {
  canonicalizeFullName,
  generateGpiDisplay,
  hashIdentityDocument,
  normalizeEmail,
  normalizePhoneE164,
  phoneLookupVariants,
  scoreIdentityMatch,
  shouldAutoLinkPerson,
  shouldSuggestPersonMatch,
  hasDualStrongSignal,
  type IdentitySignals,
  type ScoreBreakdown,
} from '@/lib/identity/normalize'

export { resolveOrCreatePerson, linkPatientToPerson, type ResolvePersonInput } from '@/lib/identity/resolve'
export {
  resolveOrCreateClinicPatient,
  type ClinicPatientInput,
  type ClinicPatientResult,
} from '@/lib/identity/clinic-patient'
export {
  ensurePatientCardOnConfirm,
  WEB_BOOKING_TAG,
} from '@/lib/identity/ensure-patient-card-on-confirm'

