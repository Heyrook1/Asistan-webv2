/** One-shot handoff: register success → first dashboard QuickStartTour.
 * Uses localStorage (not sessionStorage) so email-confirm in a new tab still sees it.
 */

export const FORCE_QUICK_START_KEY = 'asistan.force-quick-start.v1'

export function markForceQuickStart(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(FORCE_QUICK_START_KEY, '1')
  } catch {
    // private mode / quota — ignore
  }
}

/** Returns true once, then clears the flag. */
export function consumeForceQuickStart(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(FORCE_QUICK_START_KEY)
    if (raw !== '1') return false
    window.localStorage.removeItem(FORCE_QUICK_START_KEY)
    return true
  } catch {
    return false
  }
}
