import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    patient: { findFirst: vi.fn(), create: vi.fn() },
  },
}))
vi.mock('@/lib/session', () => ({
  requirePermission: vi.fn(async () => ({
    businessId: 'biz-1',
    userId: 'u-1',
    permissions: ['patient.create'],
  })),
}))
vi.mock('@/lib/audit', () => ({
  writeAuditLog: vi.fn(),
}))
vi.mock('@/lib/notifications/service', () => ({
  createNotification: vi.fn(),
}))
vi.mock('@/lib/client-marketplace/notifications', () => ({
  createClientNotification: vi.fn(),
}))

import { createPatient } from '@/lib/actions/patients'
import { requirePermission } from '@/lib/session'

const mockedRequirePermission = vi.mocked(requirePermission)

beforeEach(() => {
  mockedRequirePermission.mockClear()
})

describe('lib/actions/patients input validation', () => {
  it('rejects missing phone / short name before permission-heavy work', async () => {
    const result = await createPatient({
      fullName: 'A',
      phone: '12',
    })
    expect(result.ok).toBe(false)
  })

  it('rejects invalid email', async () => {
    const result = await createPatient({
      fullName: 'Ayşe Yılmaz',
      phone: '+905551112233',
      email: 'not-an-email',
    })
    expect(result.ok).toBe(false)
  })
})
