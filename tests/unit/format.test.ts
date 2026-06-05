import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDuration,
  formatTime,
  formatPhone,
  ageFromBirthDate,
  toIsoDate,
} from '@/lib/format'

describe('lib/format', () => {
  describe('formatDuration', () => {
    it('returns minutes only when below an hour', () => {
      expect(formatDuration(45)).toBe('45 dk')
    })
    it('returns whole hours when divisible by 60', () => {
      expect(formatDuration(120)).toBe('2 saat')
    })
    it('returns hours + remainder minutes', () => {
      expect(formatDuration(95)).toBe('1 sa 35 dk')
    })
  })

  describe('formatTime', () => {
    it('returns dash for empty input', () => {
      expect(formatTime(null)).toBe('—')
      expect(formatTime(undefined)).toBe('—')
    })
    it('keeps HH:MM portion', () => {
      expect(formatTime('09:30:00')).toBe('09:30')
    })
  })

  describe('formatCurrency', () => {
    it('formats TRY with no decimals when whole', () => {
      // tr-TR uses non-breaking spaces; assert key substrings
      const out = formatCurrency(1500)
      expect(out).toContain('1.500')
      expect(out).toContain('₺')
    })
  })

  describe('formatPhone', () => {
    it('returns dash for empty value', () => {
      expect(formatPhone(null)).toBe('—')
    })
    it('formats 10-digit national number', () => {
      expect(formatPhone('5551234567')).toBe('555 123 45 67')
    })
    it('formats 0-prefixed national number', () => {
      expect(formatPhone('05551234567')).toBe('0555 123 45 67')
    })
    it('formats +90 international number', () => {
      expect(formatPhone('905551234567')).toBe('+90 555 123 45 67')
    })
  })

  describe('ageFromBirthDate', () => {
    it('returns null for invalid', () => {
      expect(ageFromBirthDate(null)).toBeNull()
      expect(ageFromBirthDate('not-a-date')).toBeNull()
    })
    it('computes a positive age for a past date', () => {
      const tenYearsAgo = new Date()
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10)
      tenYearsAgo.setMonth(0)
      tenYearsAgo.setDate(1)
      const age = ageFromBirthDate(tenYearsAgo)
      expect(age).not.toBeNull()
      expect(age!).toBeGreaterThanOrEqual(9)
      expect(age!).toBeLessThanOrEqual(10)
    })
  })

  describe('toIsoDate', () => {
    it('returns empty for invalid input', () => {
      expect(toIsoDate(null)).toBe('')
      expect(toIsoDate('not-a-date')).toBe('')
    })
    it('returns YYYY-MM-DD for a valid date', () => {
      expect(toIsoDate(new Date(2026, 4, 23))).toBe('2026-05-23')
    })
  })
})
