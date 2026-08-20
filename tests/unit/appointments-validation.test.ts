import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    patient: { findFirst: vi.fn() },
    service: { findFirst: vi.fn() },
    location: { findFirst: vi.fn(), findMany: vi.fn() },
    appointment: { findMany: vi.fn(), create: vi.fn() },
    teamMember: { findFirst: vi.fn() },
  },
}))
vi.mock('@/lib/session', () => ({
  requirePermission: vi.fn(async () => ({ businessId: 'biz-1', userId: 'u-1' })),
}))
vi.mock('@/lib/notifications/service', () => ({
  createNotification: vi.fn(),
}))
vi.mock('@/lib/notifications/patient-channels', () => ({
  notifyPatientChannels: vi.fn(async () => []),
  summarizeNotifyResults: vi.fn(() => ({
    attempts: 0,
    sent: 0,
    notConfigured: 0,
    errors: 0,
    outcome: 'skipped',
    label: 'Hasta bildirimi: iletişim bilgisi yok',
    byChannel: [],
  })),
}))
vi.mock('@/lib/client-marketplace/notifications', () => ({
  createClientNotification: vi.fn(),
}))
vi.mock('@/lib/audit', () => ({
  writeAuditLog: vi.fn(),
}))

import { createAppointment } from '@/lib/actions/appointments'
import { requirePermission } from '@/lib/session'

const mockedRequirePermission = vi.mocked(requirePermission)

beforeEach(() => {
  mockedRequirePermission.mockClear()
})

describe('lib/actions/appointments input validation', () => {
  it('rejects invalid patient/service ids before permission check', async () => {
    const result = await createAppointment({
      patientId: 'bad',
      serviceId: 'also-bad',
      date: '2026-07-20',
      startTime: '10:00',
    })
    expect(result.ok).toBe(false)
    expect(mockedRequirePermission).not.toHaveBeenCalled()
  })

  it('rejects invalid date format before permission check', async () => {
    const result = await createAppointment({
      patientId: '11111111-1111-4111-8111-111111111111',
      serviceId: '22222222-2222-4222-8222-222222222222',
      date: '20-07-2026',
      startTime: '10:00',
    })
    expect(result.ok).toBe(false)
    expect(mockedRequirePermission).not.toHaveBeenCalled()
  })

  it('rejects invalid time format before permission check', async () => {
    const result = await createAppointment({
      patientId: '11111111-1111-4111-8111-111111111111',
      serviceId: '22222222-2222-4222-8222-222222222222',
      date: '2026-07-20',
      startTime: '10',
    })
    expect(result.ok).toBe(false)
    expect(mockedRequirePermission).not.toHaveBeenCalled()
  })
})
