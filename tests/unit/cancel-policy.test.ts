import { describe, expect, it } from 'vitest'
import {
  canCancelOrRescheduleByPolicy,
  cancelPolicyUserMessage,
  DEFAULT_CANCEL_MIN_HOURS,
  hoursUntilAppointment,
} from '@/lib/client-marketplace/cancel-policy'

/**
 * `now` must carry an explicit offset.
 *
 * The policy helpers resolve the appointment against DEFAULT_CLINIC_TIMEZONE
 * (UTC+3 in August), but a date string without a designator is parsed as the
 * *runner's* local time. Bare '2026-08-07T10:00:00' therefore meant 10:00
 * clinic time on a UTC+3 machine and 13:00 clinic time on a UTC runner —
 * passing locally and failing in CI. +03:00 pins these to clinic wall-clock.
 */
const clinicTime = (isoWithoutZone: string) => new Date(`${isoWithoutZone}+03:00`)

describe('cancel-policy', () => {
  it('allows cancel when enough hours remain', () => {
    const now = clinicTime('2026-08-07T10:00:00')
    const result = canCancelOrRescheduleByPolicy('2026-08-07', '18:00', 4, now)
    expect(result).toEqual({ ok: true })
  })

  it('blocks cancel inside the window', () => {
    const now = clinicTime('2026-08-07T16:00:00')
    const result = canCancelOrRescheduleByPolicy('2026-08-07', '18:00', 4, now)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.minHours).toBe(4)
      expect(result.hoursLeft).toBeLessThan(4)
    }
  })

  it('computes hours until appointment', () => {
    const now = clinicTime('2026-08-07T10:00:00')
    expect(hoursUntilAppointment('2026-08-07', '12:00', now)).toBe(2)
  })

  it('exposes default and user message', () => {
    expect(DEFAULT_CANCEL_MIN_HOURS).toBe(4)
    expect(cancelPolicyUserMessage(4)).toMatch(/4 saatten az/)
  })
})
