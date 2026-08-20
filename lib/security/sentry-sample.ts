/**
 * Sentry performance / replay sample rates — hard-capped for healthcare cost + PHI exposure.
 * Board I3: production sample ≤ 0.2.
 */

export const SENTRY_SAMPLE_CAP = 0.2

/** Resolve a rate and clamp to [0, SENTRY_SAMPLE_CAP]. Invalid → fallback. */
export function clampSentrySampleRate(
  value: unknown,
  fallback = 0.1
): number {
  const n = typeof value === 'number' ? value : Number(value)
  const base = Number.isFinite(n) ? n : fallback
  if (base <= 0) return 0
  return Math.min(base, SENTRY_SAMPLE_CAP)
}

/** Production traces default 0.1 (≤0.2); off in non-production. */
export function productionTracesSampleRate(
  nodeEnv: string | undefined = process.env.NODE_ENV,
  override: string | undefined = process.env.SENTRY_TRACES_SAMPLE_RATE
): number {
  if (nodeEnv !== 'production') return 0
  if (override != null && override.trim() !== '') {
    return clampSentrySampleRate(override, 0.1)
  }
  return clampSentrySampleRate(0.1, 0.1)
}

/** Error-only session replay sample (never full-session replay). */
export function productionReplayOnErrorSampleRate(
  nodeEnv: string | undefined = process.env.NODE_ENV
): number {
  return nodeEnv === 'production' ? clampSentrySampleRate(0.1, 0.1) : 0
}
