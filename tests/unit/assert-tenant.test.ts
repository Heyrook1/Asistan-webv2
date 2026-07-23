import { describe, expect, it } from 'vitest'

import { assertSameTenant, isSameTenant } from '@/lib/security/assert-tenant'
import { TenantGuardError } from '@/lib/security/tenant-guard'

describe('assertSameTenant', () => {
  it('allows matching business ids', () => {
    expect(() => assertSameTenant('biz-a', 'biz-a')).not.toThrow()
    expect(isSameTenant('biz-a', 'biz-a')).toBe(true)
  })

  it('rejects cross-tenant and missing row businessId', () => {
    expect(() => assertSameTenant('biz-a', 'biz-b')).toThrow(TenantGuardError)
    expect(() => assertSameTenant('biz-a', null)).toThrow(TenantGuardError)
    expect(() => assertSameTenant('biz-a', undefined)).toThrow(TenantGuardError)
    expect(isSameTenant('biz-a', 'biz-b')).toBe(false)
    expect(isSameTenant('biz-a', null)).toBe(false)
  })
})
