import { describe, expect, it } from 'vitest'

import { passwordFlowCopy } from '@/lib/auth/password-flow-copy'

const TR_DIACRITICS = /[çğıöşüÇĞİÖŞÜ]/

/** ASCII mangling that made auth look amateur (BUG-003). */
const FORBIDDEN_ASCII = [
  'Sifre Sifirlama',
  'Sifre sifirlama',
  'Sifrenizi',
  'sifrenizi',
  'sifre',
  'Baglanti',
  'baglanti',
  'Giris',
  'dogrula',
  'olus',
  'icin ',
  'guven',
]

function flattenCopy(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(flattenCopy)
  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(flattenCopy)
  }
  return []
}

describe('password flow TR copy (BUG-003)', () => {
  it('snapshots forgot/setup/reset strings with Turkish diacritics', () => {
    expect(passwordFlowCopy).toMatchSnapshot()
  })

  it('uses Şifre sıfırlama (not Sifre Sifirlama)', () => {
    expect(passwordFlowCopy.forgot.badge).toBe('Şifre sıfırlama')
    expect(passwordFlowCopy.forgot.badge).toMatch(TR_DIACRITICS)
  })

  it('rejects ASCII-mangled auth phrases across password surfaces', () => {
    const all = flattenCopy(passwordFlowCopy).join('\n')
    expect(all).toMatch(TR_DIACRITICS)
    for (const bad of FORBIDDEN_ASCII) {
      expect(all.toLowerCase()).not.toContain(bad.toLowerCase())
    }
  })

  it('keeps required diacritics on key labels', () => {
    const joined = flattenCopy(passwordFlowCopy).join(' ')
    for (const required of ['Ş', 'ı', 'ğ', 'ü', 'ö', 'ç']) {
      expect(joined).toContain(required)
    }
  })
})
