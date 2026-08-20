import { describe, expect, it } from 'vitest'

import {
  listBusinessIdScopedTables,
  listDenyPostgrestTables,
  policyLooksBusinessScoped,
  policyLooksDenyAll,
  RLS_BUSINESS_ID_SCOPED_TABLES,
} from '@/lib/security/rls-policy-inventory'

describe('rls policy inventory', () => {
  it('lists core PHI tenant tables with businessId scope', () => {
    expect(RLS_BUSINESS_ID_SCOPED_TABLES).toContain('Patient')
    expect(RLS_BUSINESS_ID_SCOPED_TABLES).toContain('Prescription')
    expect(RLS_BUSINESS_ID_SCOPED_TABLES).toContain('IntakeResponse')
    expect(listBusinessIdScopedTables().length).toBeGreaterThan(25)
  })

  it('detects businessId in policy expressions', () => {
    expect(
      policyLooksBusinessScoped(
        'public.has_business_permission("businessId", \'patient.view\')',
        null
      )
    ).toBe(true)
    expect(
      policyLooksBusinessScoped('public.is_conversation_participant(id)', null)
    ).toBe(true)
    expect(policyLooksBusinessScoped('id = auth.uid()', null)).toBe(false)
  })

  it('requires deny-default on platform-only tables', () => {
    expect(listDenyPostgrestTables()).toContain('Person')
    expect(listDenyPostgrestTables()).toContain('PersonMedication')
    expect(listDenyPostgrestTables()).toContain('PersonDocument')
    expect(listDenyPostgrestTables()).toContain('Waitlist')
    expect(policyLooksDenyAll('false', 'false')).toBe(true)
  })
})
