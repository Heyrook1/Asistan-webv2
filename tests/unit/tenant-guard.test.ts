import { describe, expect, it } from 'vitest'

import {
  TenantGuardError,
  applyTenantGuard,
  evaluateTenantGuard,
  getTenantBypassAlsIdentity,
  getTenantBypassReason,
  resolveTenantGuardMode,
  runWithTenantBypass,
  runWithTenantBypassAsync,
  whereHasTenantScope,
} from '@/lib/security/tenant-guard'

describe('resolveTenantGuardMode', () => {
  it('defaults to enforce in production and test', () => {
    expect(resolveTenantGuardMode(undefined, 'production')).toBe('enforce')
    expect(resolveTenantGuardMode(undefined, 'test')).toBe('enforce')
  })

  it('defaults to warn in development', () => {
    expect(resolveTenantGuardMode(undefined, 'development')).toBe('warn')
  })

  it('honors explicit env override', () => {
    expect(resolveTenantGuardMode('off', 'production')).toBe('off')
    expect(resolveTenantGuardMode('warn', 'test')).toBe('warn')
    expect(resolveTenantGuardMode('enforce', 'development')).toBe('enforce')
  })
})

describe('whereHasTenantScope', () => {
  it('accepts top-level businessId', () => {
    expect(whereHasTenantScope('Patient', { businessId: 'biz-1', isArchived: false })).toBe(true)
  })

  it('accepts businessId inside AND', () => {
    expect(
      whereHasTenantScope('Appointment', {
        AND: [{ businessId: 'biz-1' }, { date: new Date() }],
      })
    ).toBe(true)
  })

  it('accepts clientUserId alternate scope for Appointment', () => {
    expect(whereHasTenantScope('Appointment', { clientUserId: 'client-1' })).toBe(true)
  })

  it('accepts patientId alternate scope for Appointment', () => {
    expect(whereHasTenantScope('Appointment', { patientId: 'pat-1' })).toBe(true)
  })

  it('accepts personId alternate scope for Patient', () => {
    expect(whereHasTenantScope('Patient', { personId: 'person-1' })).toBe(true)
  })

  it('accepts Review clientUserId / appointmentId alternate scopes', () => {
    expect(whereHasTenantScope('Review', { clientUserId: 'c1' })).toBe(true)
    expect(whereHasTenantScope('Review', { appointmentId: 'a1' })).toBe(true)
    expect(whereHasTenantScope('Review', { rating: 5 })).toBe(false)
  })

  it('rejects unscoped where', () => {
    expect(whereHasTenantScope('Patient', { id: 'pat-1' })).toBe(false)
    expect(whereHasTenantScope('TeamMember', { role: 'DOKTOR', isActive: true })).toBe(false)
  })

  it('rejects OR unless every branch is scoped', () => {
    expect(
      whereHasTenantScope('Patient', {
        OR: [{ businessId: 'biz-1' }, { id: 'pat-1' }],
      })
    ).toBe(false)
    expect(
      whereHasTenantScope('Patient', {
        OR: [{ businessId: 'biz-1' }, { businessId: 'biz-2' }],
      })
    ).toBe(true)
  })
})

describe('evaluateTenantGuard', () => {
  it('allows non-tenant models', () => {
    expect(
      evaluateTenantGuard({
        model: 'Person',
        action: 'findMany',
        args: { where: {} },
      })
    ).toEqual({ ok: true })
  })

  it('blocks Patient findMany without businessId', () => {
    const result = evaluateTenantGuard({
      model: 'Patient',
      action: 'findMany',
      args: { where: { isArchived: false } },
    })
    expect(result.ok).toBe(false)
  })

  it('allows Patient create with businessId', () => {
    expect(
      evaluateTenantGuard({
        model: 'Patient',
        action: 'create',
        args: { data: { businessId: 'biz-1', fullName: 'Ada' } },
      })
    ).toEqual({ ok: true })
  })

  it('allows bypass via runWithTenantBypass', () => {
    const result = runWithTenantBypass('unit-test', () =>
      evaluateTenantGuard({
        model: 'TeamMember',
        action: 'findMany',
        args: { where: { role: 'DOKTOR' } },
      })
    )
    expect(result).toEqual({ ok: true })
  })
})

describe('ALS singleton + marketplace async bypass', () => {
  it('pins AsyncLocalStorage on globalThis (Turbopack dual-eval safe)', () => {
    const g = globalThis as unknown as { __asistanTenantBypassALS?: object }
    expect(g.__asistanTenantBypassALS).toBeDefined()
    expect(getTenantBypassAlsIdentity()).toBe(g.__asistanTenantBypassALS)
  })

  it('keeps bypass visible across Promise.all (marketplace catalog pattern)', async () => {
    expect(getTenantBypassReason()).toBeNull()

    await runWithTenantBypassAsync('marketplace:search-catalog', async () => {
      expect(getTenantBypassReason()).toBe('marketplace:search-catalog')

      const results = await Promise.all([
        Promise.resolve(
          evaluateTenantGuard({
            model: 'TeamMember',
            action: 'findMany',
            args: { where: { role: 'DOKTOR', isActive: true } },
          })
        ),
        Promise.resolve(
          evaluateTenantGuard({
            model: 'Service',
            action: 'findMany',
            args: { where: { isActive: true } },
          })
        ),
        Promise.resolve(
          evaluateTenantGuard({
            model: 'Review',
            action: 'aggregate',
            args: { where: { deletedAt: null } },
          })
        ),
      ])

      expect(results.every((r) => r.ok)).toBe(true)
    })

    expect(getTenantBypassReason()).toBeNull()
    expect(
      evaluateTenantGuard({
        model: 'TeamMember',
        action: 'findMany',
        args: { where: { role: 'DOKTOR' } },
      }).ok
    ).toBe(false)
  })
})

describe('applyTenantGuard', () => {
  it('throws in enforce mode', () => {
    expect(() =>
      applyTenantGuard(
        {
          model: 'Patient',
          action: 'findFirst',
          args: { where: { id: 'x' } },
        },
        { mode: 'enforce' }
      )
    ).toThrow(TenantGuardError)
  })

  it('warns without throwing in warn mode', () => {
    const warnings: string[] = []
    expect(() =>
      applyTenantGuard(
        {
          model: 'Patient',
          action: 'findFirst',
          args: { where: { id: 'x' } },
        },
        { mode: 'warn', onWarn: (msg) => warnings.push(msg) }
      )
    ).not.toThrow()
    expect(warnings[0]).toContain('Patient.findFirst')
  })
})
