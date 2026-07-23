import { describe, expect, it } from 'vitest'

import {
  localDateString,
  matchServiceByQuery,
  parseFrontDeskIntent,
  parseRelativeDate,
  parseTimeToken,
} from '@/lib/front-desk/intents'
import { looksLikeForbiddenClaim } from '@/lib/brand/claim-bank'

describe('front-desk intents (D1)', () => {
  const now = new Date('2026-07-21T12:00:00Z')

  it('parses greet / help / restart / confirm', () => {
    expect(parseFrontDeskIntent('merhaba', now).type).toBe('greet')
    expect(parseFrontDeskIntent('yardım', now).type).toBe('help')
    expect(parseFrontDeskIntent('iptal', now).type).toBe('restart')
    expect(parseFrontDeskIntent('evet', now).type).toBe('confirm')
  })

  it('parses dates', () => {
    expect(parseRelativeDate('bugün', now)).toBe(localDateString(now, 0))
    expect(parseRelativeDate('yarın', now)).toBe(localDateString(now, 1))
    expect(parseRelativeDate('25.07.2026', now)).toBe('2026-07-25')
    expect(parseFrontDeskIntent('yarın', now)).toEqual({ type: 'date', date: localDateString(now, 1) })
  })

  it('parses times and menu numbers', () => {
    expect(parseTimeToken('14:30')).toBe('14:30')
    expect(parseTimeToken('saat 9:05')).toBe('09:05')
    expect(parseFrontDeskIntent('2', now)).toEqual({ type: 'pick_number', index: 2 })
  })

  it('matches services and names', () => {
    const services = [
      { id: '1', name: 'Genel Muayene' },
      { id: '2', name: 'Diş Temizliği' },
    ]
    expect(matchServiceByQuery(services, 'muayene')?.id).toBe('1')
    expect(parseFrontDeskIntent('adım Ayşe Yılmaz', now)).toEqual({
      type: 'name',
      fullName: 'Ayşe Yılmaz',
    })
  })
})

describe('front-desk claim honesty', () => {
  it('does not allow AI-powered marketing claims', () => {
    expect(looksLikeForbiddenClaim('yapay zeka ön büro')).toBe(true)
    expect(looksLikeForbiddenClaim('WhatsApp randevu asistanı (kural tabanlı)')).toBe(false)
  })
})
