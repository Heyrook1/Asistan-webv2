import { describe, expect, it } from 'vitest'

import {
  SENTRY_SAMPLE_CAP,
  clampSentrySampleRate,
  productionReplayOnErrorSampleRate,
  productionTracesSampleRate,
} from '@/lib/security/sentry-sample'

describe('sentry sample cap (I3)', () => {
  it('never exceeds 0.2', () => {
    expect(SENTRY_SAMPLE_CAP).toBe(0.2)
    expect(clampSentrySampleRate(1)).toBe(0.2)
    expect(clampSentrySampleRate(0.5)).toBe(0.2)
    expect(clampSentrySampleRate(0.1)).toBe(0.1)
    expect(clampSentrySampleRate(0)).toBe(0)
  })

  it('defaults production traces to 0.1 and disables outside prod', () => {
    expect(productionTracesSampleRate('production')).toBe(0.1)
    expect(productionTracesSampleRate('development')).toBe(0)
    expect(productionTracesSampleRate('production', '0.9')).toBe(0.2)
    expect(productionReplayOnErrorSampleRate('production')).toBe(0.1)
    expect(productionReplayOnErrorSampleRate('test')).toBe(0)
  })
})
