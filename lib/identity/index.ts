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
export {
  IDENTITY_MERGE_MIN_SCORE,
  IDENTITY_MERGE_REVIEW_ONLY_MAX,
  IDENTITY_MERGE_HIGH_CONFIDENCE,
  IDENTITY_MERGE_CONFIRM_PHRASE,
  namesCompatible,
  buildIdentityFieldDiff,
  evaluateMergeEligibility,
  buildMergeResultSummary,
  type IdentityPersonSnapshot,
  type IdentityFieldDiffRow,
  type MergeEligibility,
} from '@/lib/identity/match-policy'

