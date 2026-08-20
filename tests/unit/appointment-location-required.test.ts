import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const locationCreate = vi.fn()
const locationFindMany = vi.fn()
const locationFindFirst = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    patient: { findFirst: vi.fn() },
    service: { findFirst: vi.fn() },
    location: {
      findFirst: (...args: unknown[]) => locationFindFirst(...args),
      findMany: (...args: unknown[]) => locationFindMany(...args),
      create: (...args: unknown[]) => locationCreate(...args),
    },
    appointment: { findMany: vi.fn(), create: vi.fn() },
    teamMember: { findFirst: vi.fn() },
    business: { findUnique: vi.fn() },
  },
}))
vi.mock('@/lib/session', () => ({
  requirePermission: vi.fn(async () => ({
    businessId: 'biz-1',
    userId: 'u-1',
    fullName: 'Test',
  })),
}))
vi.mock('@/lib/notifications/service', () => ({ createNotification: vi.fn() }))
vi.mock('@/lib/notifications/patient-channels', () => ({
  notifyPatientChannels: vi.fn(async () => []),
  summarizeNotifyResults: vi.fn(() => ({
    attempts: 0,
    sent: 0,
    notConfigured: 0,
    errors: 0,
    outcome: 'skipped',
    label: 'skip',
    byChannel: [],
  })),
}))
vi.mock('@/lib/client-marketplace/notifications', () => ({ createClientNotification: vi.fn() }))
vi.mock('@/lib/audit', () => ({ writeAuditLog: vi.fn() }))

import { createAppointment } from '@/lib/actions/appointments'
import { LOCATION_REQUIRED_ERROR } from '@/lib/locations/constants'
import { prisma } from '@/lib/prisma'

const patientId = '11111111-1111-4111-8111-111111111111'
const serviceId = '22222222-2222-4222-8222-222222222222'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.patient.findFirst).mockResolvedValue({ id: patientId, fullName: 'Hasta' } as never)
  vi.mocked(prisma.service.findFirst).mockResolvedValue({
    id: serviceId,
    name: 'Kontrol',
    durationMin: 30,
    price: 100,
  } as never)
  locationFindFirst.mockResolvedValue(null)
  locationFindMany.mockResolvedValue([])
})

describe('P0-08 appointment must not silent-seed Location', () => {
  it('rejects create when clinic has no active location and never calls location.create', async () => {
    const result = await createAppointment({
      patientId,
      serviceId,
      date: '2026-07-20',
      startTime: '10:00',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe(LOCATION_REQUIRED_ERROR)
    }
    expect(locationCreate).not.toHaveBeenCalled()
  })
})
