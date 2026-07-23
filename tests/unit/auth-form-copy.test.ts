import { describe, expect, it } from 'vitest'
import { authFormCopy } from '@/lib/auth/auth-form-copy'

describe('authFormCopy (5.3 TR microcopy)', () => {
  it('rejects John Doe / vague email errors', () => {
    expect(authFormCopy.namePlaceholder.tr).not.toMatch(/John Doe/i)
    expect(authFormCopy.namePlaceholder.tr).toBe('Ayşe Yılmaz')
    expect(authFormCopy.emailPlaceholder.tr).toBe('ornek@klinik.com')
    expect(authFormCopy.emailInvalid.tr).toMatch(/@/)
    expect(authFormCopy.emailInvalid.tr).not.toMatch(/Geçersiz e-posta formatı/)
  })
})
