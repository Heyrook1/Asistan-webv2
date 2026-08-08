/** Pure helpers for booking canary — safe for unit tests (no server-only). */

/** Rotate sample every 10 minutes so all bookable clinics get covered. */
export const BOOKING_CANARY_ROTATION_WINDOW_MS = 10 * 60 * 1000

export function rotateClinicSample<T>(
  items: T[],
  sampleSize: number,
  nowMs = Date.now(),
  windowMs = BOOKING_CANARY_ROTATION_WINDOW_MS,
): T[] {
  if (items.length === 0) return []
  const size = Math.min(Math.max(1, sampleSize), items.length)
  const windowIndex = Math.floor(nowMs / windowMs)
  const start = (windowIndex * size) % items.length
  const out: T[] = []
  for (let i = 0; i < size; i += 1) {
    out.push(items[(start + i) % items.length]!)
  }
  return out
}
