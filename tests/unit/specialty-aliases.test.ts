import { describe, expect, it } from 'vitest'
import {
  matchesSpecialtyTerms,
  specialtyGroupKey,
  specialtySearchTerms,
} from '@/lib/client-marketplace/specialty-aliases'

describe('specialty-aliases', () => {
  it('maps diş chip to dental terms', () => {
    expect(specialtyGroupKey('diş')).toBe('dis')
    expect(specialtySearchTerms('diş')).toContain('diş')
    expect(specialtySearchTerms('diş')).toContain('dental')
  })

  it('matches Aile Hekimliği under genel', () => {
    const terms = specialtySearchTerms('genel')
    expect(matchesSpecialtyTerms('Aile Hekimliği', terms)).toBe(true)
    expect(matchesSpecialtyTerms('Genel Muayene', terms)).toBe(true)
  })

  it('matches Dermatoloji', () => {
    expect(matchesSpecialtyTerms('Dermatoloji', specialtySearchTerms('dermatoloji'))).toBe(true)
  })
})
