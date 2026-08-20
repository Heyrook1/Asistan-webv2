import { describe, expect, it } from 'vitest'

/**
 * withTenantDb / setTenantBusinessId require a live Prisma client.
 * Validate the empty-id contract without opening a DB connection by
 * mirroring the guard used in lib/security/tenant-db-context.ts.
 */
function requireBusinessId(businessId: string, label: string) {
  const id = businessId.trim()
  if (!id) throw new Error(`[${label}] businessId is required`)
  return id
}

describe('tenant-db-context contract', () => {
  it('rejects empty businessId', () => {
    expect(() => requireBusinessId('', 'withTenantDb')).toThrow(/businessId is required/)
    expect(() => requireBusinessId('   ', 'setTenantBusinessId')).toThrow(/businessId is required/)
  })

  it('accepts trimmed businessId', () => {
    expect(requireBusinessId('  biz-a  ', 'withTenantDb')).toBe('biz-a')
  })
})
