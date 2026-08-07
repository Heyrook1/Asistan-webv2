import { describe, expect, it } from 'vitest'
import {
  addCalendarDays,
  calendarDateInTimeZone,
  formatBookingWhenStable,
  formatDayChipLabel,
  formatNextSlotLabelStable,
} from '@/lib/datetime/calendar-label'

describe('calendar-label hydration-safe formatters', () => {
  it('formats day chips with fixed TR tokens', () => {
    const today = '2026-08-07'
    const label = formatDayChipLabel('2026-08-09', 'tr', today, addCalendarDays(today, 1))
    expect(label).toBe('Paz 9 Ağu')
  })

  it('labels today/tomorrow without locale APIs', () => {
    const today = '2026-08-07'
    expect(formatDayChipLabel(today, 'tr', today, '2026-08-08')).toBe('Bugün')
    expect(formatDayChipLabel('2026-08-08', 'en', today, '2026-08-08')).toBe('Tomorrow')
  })

  it('formats next slot from ISO parts', () => {
    const label = formatNextSlotLabelStable('2026-08-07T14:30:00', 'tr', new Date('2026-08-07T10:00:00+03:00'))
    expect(label).toMatch(/14:30/)
  })

  it('formats booking when stably', () => {
    expect(formatBookingWhenStable('2026-08-07', '09:15', 'tr')).toBe('Cum, 7 Ağu 2026 · 09:15')
  })

  it('calendarDateInTimeZone returns YYYY-MM-DD', () => {
    expect(calendarDateInTimeZone(new Date('2026-08-07T22:30:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
