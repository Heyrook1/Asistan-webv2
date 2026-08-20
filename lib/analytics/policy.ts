import { isFeatureEnabled } from '@/lib/feature-flags'

/** Honest ops overview on /dashboard/analitik — on by default (Q2). */
export function isClinicAnalyticsEnabled() {
  return isFeatureEnabled('clinicAnalytics')
}
