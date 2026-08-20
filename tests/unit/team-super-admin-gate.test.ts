import { describe, expect, it } from 'vitest'

import { platformRoleAssignmentError } from '@/lib/security/platform-roles'

describe('P0.8 owner → SUPER_ADMIN gate', () => {
  it('rejects SUPER_ADMIN assignment via tenant team actions', () => {
    expect(platformRoleAssignmentError('SUPER_ADMIN')).toMatch(/SUPER_ADMIN/)
  })

  it('allows clinic roles', () => {
    expect(platformRoleAssignmentError('ISLETME_SAHIBI')).toBeNull()
    expect(platformRoleAssignmentError('DOKTOR')).toBeNull()
    expect(platformRoleAssignmentError('SEKRETER')).toBeNull()
    expect(platformRoleAssignmentError('PERSONEL')).toBeNull()
  })

  it('ignores empty role patch', () => {
    expect(platformRoleAssignmentError(undefined)).toBeNull()
    expect(platformRoleAssignmentError(null)).toBeNull()
  })
})
