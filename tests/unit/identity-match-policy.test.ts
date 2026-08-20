import { describe, expect, it } from 'vitest'

import {
  IDENTITY_MERGE_CONFIRM_PHRASE,
  IDENTITY_MERGE_MIN_SCORE,
  buildIdentityFieldDiff,
  buildMergeResultSummary,
  evaluateMergeEligibility,
  namesCompatible,
} from '@/lib/identity/match-policy'

describe('identity match policy (P1-03)', () => {
  it('blocks merge at 25% score (review / reject only)', () => {
    const e = evaluateMergeEligibility({
      score: 0.25,
      leftNameCanon: 'ali veli',
      rightNameCanon: 'ali veli',
    })
    expect(e.canMerge).toBe(false)
    expect(e.primaryAction).toBe('reject')
    expect(e.risk).toBe('review_only')
    expect(e.blockers.some((b) => /düşük|inceleme/i.test(b))).toBe(true)
  })

  it('hard-blocks name mismatch even at high score', () => {
    const e = evaluateMergeEligibility({
      score: 0.9,
      leftNameCanon: 'ali veli',
      rightNameCanon: 'ayşe yılmaz',
    })
    expect(e.canMerge).toBe(false)
    expect(e.nameCompatible).toBe(false)
    expect(e.blockers.some((b) => b.toLocaleLowerCase('tr-TR').includes('isim'))).toBe(true)
  })

  it('allows merge only at/above min score with compatible names', () => {
    const below = evaluateMergeEligibility({
      score: IDENTITY_MERGE_MIN_SCORE - 0.01,
      leftNameCanon: 'ali veli',
      rightNameCanon: 'ali veli',
    })
    expect(below.canMerge).toBe(false)

    const ok = evaluateMergeEligibility({
      score: 0.55,
      leftNameCanon: 'ali veli',
      rightNameCanon: 'ali veli',
    })
    expect(ok.canMerge).toBe(true)
    expect(ok.primaryAction).toBe('merge')
    expect(ok.warnings.length).toBeGreaterThan(0)
  })

  it('treats identical names as compatible; unrelated as not', () => {
    expect(namesCompatible('Mehmet Yılmaz', 'mehmet yilmaz')).toBe(true)
    expect(namesCompatible('ali veli', 'fatma demir')).toBe(false)
  })

  it('builds field-level diff with mismatch status', () => {
    const rows = buildIdentityFieldDiff(
      {
        id: 'a',
        gpiDisplay: 'GPI-1',
        fullNameCanon: 'ali veli',
        phoneE164: '+905321112233',
        emailNorm: 'a@x.com',
      },
      {
        id: 'b',
        gpiDisplay: 'GPI-2',
        fullNameCanon: 'ayşe yılmaz',
        phoneE164: '+905321112233',
        emailNorm: null,
      },
    )
    const name = rows.find((r) => r.field === 'fullName')
    const phone = rows.find((r) => r.field === 'phone')
    const email = rows.find((r) => r.field === 'email')
    expect(name?.status).toBe('mismatch')
    expect(phone?.status).toBe('match')
    expect(email?.status).toBe('left_only')
  })

  it('merge summary lists keep/move and score', () => {
    const text = buildMergeResultSummary({
      left: {
        id: 'a',
        gpiDisplay: 'GPI-A',
        fullNameCanon: 'ali veli',
        phoneE164: null,
        emailNorm: null,
      },
      right: {
        id: 'b',
        gpiDisplay: 'GPI-B',
        fullNameCanon: 'ali veli',
        phoneE164: null,
        emailNorm: null,
      },
      score: 0.72,
      clinicPatientMoves: 2,
    })
    expect(text).toContain('GPI-A')
    expect(text).toContain('%72')
    expect(text).toContain('2')
  })

  it('exports confirm phrase for four-eyes UX', () => {
    expect(IDENTITY_MERGE_CONFIRM_PHRASE).toBe('BIRLESTIR')
  })
})
