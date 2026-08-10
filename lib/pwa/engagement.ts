/** Patient PWA install soft-gate — show after meaningful use, not on first paint. */

export const PWA_ENGAGEMENT_KEY = 'asistan-pwa-engaged-v1'
export const PWA_ENGAGED_EVENT = 'asistan:pwa-engaged'

export type PwaEngagementReason =
  | 'clinic_search'
  | 'clinic_view'
  | 'booking_complete'
  | 'manual'

export function hasPwaEngagement(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(PWA_ENGAGEMENT_KEY) === '1'
  } catch {
    return false
  }
}

export function markPwaEngagement(reason: PwaEngagementReason): void {
  if (typeof window === 'undefined') return
  try {
    const first = !hasPwaEngagement()
    window.localStorage.setItem(PWA_ENGAGEMENT_KEY, '1')
    window.sessionStorage.setItem(`${PWA_ENGAGEMENT_KEY}:reason`, reason)
    if (first) {
      window.dispatchEvent(new CustomEvent(PWA_ENGAGED_EVENT, { detail: { reason } }))
    }
  } catch {
    /* private mode / quota */
  }
}
