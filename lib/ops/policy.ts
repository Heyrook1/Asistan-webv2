import { isFeatureEnabled } from '@/lib/feature-flags'

/** Proactive open-slot ops on Genel Bakış / Ajanda — not Analitik / ML. */
export function isFillTheGapEnabled() {
  return isFeatureEnabled('fillTheGap')
}
