import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AppointmentStatus } from '@prisma/client'

const {
  findFirstAppointment,
  updateManyAppointment,
  findFirstInTx,
  createTimeline,
  createNotification,
  createClientNotification,
  notifyPatientChannels,
  summarizeNotifyResults,
  writeAuditLog,
  ensurePatientCardOnConfirm,
} = vi.hoisted(() => ({
  findFirstAppointment: vi.fn(),
  updateManyAppointment: vi.fn(),
  findFirstInTx: vi.fn(),
  createTimeline: vi.fn(),
  createNotification: vi.fn(),
  createClientNotification: vi.fn(),
  notifyPatientChannels: vi.fn(async () => []),
  summarizeNotifyResults: vi.fn(() => ({
    attempts: 0,
    sent: 0,
    notConfigured: 0,
    errors: 0,
    outcome: 'skipped' as const,
    label: 'Hasta bildirimi: iletişim bilgisi yok',
    byChannel: [],
  })),
  writeAuditLog: vi.fn(),
  ensurePatientCardOnConfirm: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: { findFirst: findFirstAppointment },
    patient: { findFirst: vi.fn(async () => ({ fullName: 'Ali', phone: null, email: null })) },
    service: { findFirst: vi.fn(async () => ({ name: 'Kontrol' })) },
    teamMember: { findFirst: vi.fn(async () => null) },
    business: { findUnique: vi.fn(async () => ({ ownerUserId: 'owner-1', name: 'Klinik' })) },
    location: { findFirst: vi.fn(async () => null) },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        appointment: {
          updateMany: updateManyAppointment,
          findFirst: findFirstInTx,
        },
        timelineEvent: { create: createTimeline },
        patient: { update: vi.fn(), findFirst: vi.fn() },
        $queryRaw: vi.fn(),
        $executeRaw: vi.fn(),
      }),
    ),
  },
}))

vi.mock('@/lib/security/tenant-db-context', () => ({
  tenantTransaction: async (_biz: string, fn: (tx: unknown) => Promise<unknown>) => {
    const { prisma } = await import('@/lib/prisma')
    return prisma.$transaction(fn as never)
  },
  setTenantBusinessId: vi.fn(),
}))

vi.mock('@/lib/session', () => ({
  requirePermission: vi.fn(async () => ({
    businessId: 'biz-1',
    userId: 'u-1',
    fullName: 'Doktor',
  })),
}))

vi.mock('@/lib/notifications/service', () => ({
  createNotification,
}))
vi.mock('@/lib/notifications/patient-channels', () => ({
  notifyPatientChannels,
  summarizeNotifyResults,
}))
vi.mock('@/lib/client-marketplace/notifications', () => ({
  createClientNotification,
}))
vi.mock('@/lib/audit', () => ({
  writeAuditLog,
}))
vi.mock('@/lib/identity/ensure-patient-card-on-confirm', () => ({
  ensurePatientCardOnConfirm,
}))
vi.mock('@/lib/ops/fill-the-gap', () => ({
  offerOpenedSlotToWaitlistCandidates: vi.fn(async () => null),
}))
vi.mock('@/lib/observability/funnel', () => ({
  trackFunnelEvent: vi.fn(),
}))

import { setAppointmentStatus } from '@/lib/actions/appointments'
import { canTransitionAppointmentStatus } from '@/lib/appointment-transitions'

const APPT_ID = '11111111-1111-4111-8111-111111111111'

function scheduledRow() {
  return {
    id: APPT_ID,
    businessId: 'biz-1',
    patientId: 'p1',
    serviceId: 's1',
    staffId: null,
    locationId: null,
    clientUserId: null,
    source: 'CLIENT_APP',
    status: AppointmentStatus.SCHEDULED,
    notes: null,
    date: new Date('2026-08-15T00:00:00.000Z'),
    startTime: '10:00',
    endTime: '10:30',
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  findFirstAppointment.mockResolvedValue(scheduledRow())
  updateManyAppointment.mockResolvedValue({ count: 1 })
  ensurePatientCardOnConfirm.mockResolvedValue({ patientId: 'p1', restored: true })
})

describe('appointment status transitions', () => {
  it('allows SCHEDULED → CONFIRMED and treats same status as allowed', () => {
    expect(canTransitionAppointmentStatus('SCHEDULED', 'CONFIRMED')).toBe(true)
    expect(canTransitionAppointmentStatus('CONFIRMED', 'CONFIRMED')).toBe(true)
    expect(canTransitionAppointmentStatus('CONFIRMED', 'SCHEDULED')).toBe(false)
  })
})

describe('setAppointmentStatus confirm', () => {
  it('is a no-op with no side effects when already CONFIRMED', async () => {
    findFirstAppointment.mockResolvedValue({
      ...scheduledRow(),
      status: AppointmentStatus.CONFIRMED,
    })

    const result = await setAppointmentStatus({ id: APPT_ID, status: 'CONFIRMED' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.alreadyInStatus).toBe(true)
    expect(updateManyAppointment).not.toHaveBeenCalled()
    expect(createNotification).not.toHaveBeenCalled()
    expect(writeAuditLog).not.toHaveBeenCalled()
    expect(createTimeline).not.toHaveBeenCalled()
  })

  it('CAS-updates SCHEDULED → CONFIRMED and notifies once', async () => {
    const result = await setAppointmentStatus({ id: APPT_ID, status: 'CONFIRMED' })
    expect(result.ok).toBe(true)
    expect(updateManyAppointment).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: APPT_ID,
          businessId: 'biz-1',
          status: AppointmentStatus.SCHEDULED,
        }),
        data: expect.objectContaining({ status: AppointmentStatus.CONFIRMED }),
      }),
    )
    expect(ensurePatientCardOnConfirm).toHaveBeenCalled()
    expect(createTimeline).toHaveBeenCalledTimes(1)
    expect(createNotification).toHaveBeenCalledTimes(1)
    expect(writeAuditLog).toHaveBeenCalledTimes(1)
  })

  it('returns ok without second notify when concurrent CAS already confirmed', async () => {
    updateManyAppointment.mockResolvedValue({ count: 0 })
    findFirstInTx.mockResolvedValue({ status: AppointmentStatus.CONFIRMED })

    const result = await setAppointmentStatus({ id: APPT_ID, status: 'CONFIRMED' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.alreadyInStatus).toBe(true)
    expect(createNotification).not.toHaveBeenCalled()
    expect(writeAuditLog).not.toHaveBeenCalled()
    expect(createTimeline).not.toHaveBeenCalled()
  })

  it('does not throw when patient card ensure soft-fails', async () => {
    ensurePatientCardOnConfirm.mockResolvedValue(null)
    const result = await setAppointmentStatus({ id: APPT_ID, status: 'CONFIRMED' })
    expect(result.ok).toBe(true)
    expect(createNotification).toHaveBeenCalled()
  })

  it('returns err instead of throwing on unexpected failure', async () => {
    findFirstAppointment.mockRejectedValue(new Error('db down'))
    const result = await setAppointmentStatus({ id: APPT_ID, status: 'CONFIRMED' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/güncellenemedi/i)
  })
})
