import { describe, expect, it } from 'vitest'

import { evaluateTenantGuard } from '@/lib/security/tenant-guard'

/**
 * Documents the Dilim-A write contract: PHI mutations must carry businessId
 * (or alternate scope) in `where` — never id-only update/delete.
 */
describe('tenant write scope (PHI)', () => {
  it('rejects id-only Appointment.update', () => {
    const result = evaluateTenantGuard({
      model: 'Appointment',
      action: 'update',
      args: { where: { id: 'appt-1' }, data: { status: 'CONFIRMED' } },
    })
    expect(result.ok).toBe(false)
  })

  it('allows Appointment.updateMany with businessId', () => {
    const result = evaluateTenantGuard({
      model: 'Appointment',
      action: 'updateMany',
      args: {
        where: { id: 'appt-1', businessId: 'biz-a' },
        data: { status: 'CONFIRMED' },
      },
    })
    expect(result).toEqual({ ok: true })
  })

  it('allows Appointment.updateMany with clientUserId alternate scope', () => {
    const result = evaluateTenantGuard({
      model: 'Appointment',
      action: 'updateMany',
      args: {
        where: { id: 'appt-1', clientUserId: 'client-1' },
        data: { status: 'CANCELLED' },
      },
    })
    expect(result).toEqual({ ok: true })
  })

  it('rejects id-only Patient.update', () => {
    const result = evaluateTenantGuard({
      model: 'Patient',
      action: 'update',
      args: { where: { id: 'pat-1' }, data: { fullName: 'X' } },
    })
    expect(result.ok).toBe(false)
  })

  it('allows Patient.updateMany with businessId', () => {
    const result = evaluateTenantGuard({
      model: 'Patient',
      action: 'updateMany',
      args: {
        where: { id: 'pat-1', businessId: 'biz-a' },
        data: { fullName: 'X' },
      },
    })
    expect(result).toEqual({ ok: true })
  })

  it('rejects id-only TreatmentPlanItem.delete', () => {
    const result = evaluateTenantGuard({
      model: 'TreatmentPlanItem',
      action: 'delete',
      args: { where: { id: 'item-1' } },
    })
    expect(result.ok).toBe(false)
  })

  it('allows TreatmentPlanItem.deleteMany with businessId', () => {
    const result = evaluateTenantGuard({
      model: 'TreatmentPlanItem',
      action: 'deleteMany',
      args: { where: { id: 'item-1', businessId: 'biz-a' } },
    })
    expect(result).toEqual({ ok: true })
  })

  it('rejects PatientNote.findFirst without businessId', () => {
    const result = evaluateTenantGuard({
      model: 'PatientNote',
      action: 'findFirst',
      args: { where: { id: 'note-1' } },
    })
    expect(result.ok).toBe(false)
  })
})

/**
 * Cross-tenant simulation: wrong businessId in where → caller treats count===0
 * as not-found (no leak). Guard still allows the query shape because businessId
 * is present — isolation is the DB filter, not the guard.
 */
describe('cross-tenant PHI write contract', () => {
  it('scoped where with foreign businessId is guard-ok (returns 0 rows at DB)', () => {
    const clinicA = 'biz-a'
    const clinicBAppointmentId = 'appt-owned-by-b'
    const result = evaluateTenantGuard({
      model: 'Appointment',
      action: 'updateMany',
      args: {
        where: { id: clinicBAppointmentId, businessId: clinicA },
        data: { status: 'CANCELLED' },
      },
    })
    expect(result).toEqual({ ok: true })
    // Application contract: if updateMany.count === 0 → "Randevu bulunamadı"
  })

  it('linkPatientToPerson shape requires businessId on Patient.updateMany', () => {
    const withoutBiz = evaluateTenantGuard({
      model: 'Patient',
      action: 'updateMany',
      args: { where: { id: 'pat-1' }, data: { personId: 'person-1' } },
    })
    expect(withoutBiz.ok).toBe(false)

    const withBiz = evaluateTenantGuard({
      model: 'Patient',
      action: 'updateMany',
      args: {
        where: { id: 'pat-1', businessId: 'biz-a' },
        data: { personId: 'person-1' },
      },
    })
    expect(withBiz).toEqual({ ok: true })
  })
})
