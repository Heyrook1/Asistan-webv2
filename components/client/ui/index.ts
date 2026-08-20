/**
 * Asistan patient web primitive library.
 *
 * Shared, reusable building blocks for the /client surface. Prefer these over
 * bespoke markup so states (loading/empty/error), spacing, radius and status
 * semantics stay consistent and in parity with the Expo primitives
 * (mobile/components/ui/*).
 */
export { PageContainer } from './page-container'
export { PatientCard } from './patient-card'
export { SectionHeader } from './section-header'
export { EmptyState } from './empty-state'
export { ErrorState } from './error-state'
export { StatusBadge, type AppointmentStatus } from './status-badge'
export { SkeletonBlock, CardSkeleton, ListSkeleton } from './patient-skeleton'
