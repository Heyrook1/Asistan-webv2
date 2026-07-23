import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * UX-003 / iOS: focused controls < 16px zoom; touch targets < 44px fail mobile.
 * Booking slots + select: always text-base + h-11/min-h-11 (no md:text-sm shrink).
 */
describe('UX-003 public-booking slots/select', () => {
  const src = readFileSync(
    join(process.cwd(), 'components/book/public-booking-widget.tsx'),
    'utf8'
  )

  it('location <select> is h-11 min-h-11 + text-base (no md:text-sm)', () => {
    const selectMatch = src.match(/<select\b[\s\S]*?>/)
    expect(selectMatch?.[0]).toBeTruthy()
    expect(selectMatch![0]).toMatch(/h-11 min-h-11/)
    expect(selectMatch![0]).toMatch(/text-base/)
    expect(selectMatch![0]).not.toMatch(/md:text-sm/)
    expect(selectMatch![0]).not.toMatch(/text-sm/)
  })

  it('slot chips are h-11 min-h-11 + text-base (no md:text-sm)', () => {
    expect(src).toMatch(
      /flex h-11 min-h-11 items-center justify-center rounded-xl border px-2 text-base font-semibold/
    )
    expect(src).not.toMatch(/py-2\.5 text-sm font-semibold/)
  })
})

describe('UX-003 client reschedule slots', () => {
  it('reschedule slot chips are h-11 min-h-11 + text-base', () => {
    const src = readFileSync(
      join(process.cwd(), 'components/client/bookings-panel.tsx'),
      'utf8'
    )
    expect(src).toMatch(
      /flex h-11 min-h-11 items-center justify-center rounded-xl border px-3 text-base font-semibold/
    )
  })
})
