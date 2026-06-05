import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock heavy modules so we only exercise the zod input validation branch.
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: {
      create: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    appointment: { count: vi.fn() },
  },
}))
vi.mock('@/lib/session', () => ({
  requirePermission: vi.fn(async () => ({ businessId: 'biz-1', userId: 'u-1' })),
}))

import { toggleServiceActive, deleteService, createService } from '@/lib/actions/services'
import { requirePermission } from '@/lib/session'

const mockedRequirePermission = vi.mocked(requirePermission)

beforeEach(() => {
  mockedRequirePermission.mockClear()
})

describe('lib/actions/services input validation', () => {
  it('toggleServiceActive rejects non-uuid id without calling permission', async () => {
    const result = await toggleServiceActive({ id: 'not-a-uuid', isActive: true })
    expect(result.ok).toBe(false)
    expect(mockedRequirePermission).not.toHaveBeenCalled()
  })

  it('deleteService rejects missing id without calling permission', async () => {
    const result = await deleteService({})
    expect(result.ok).toBe(false)
    expect(mockedRequirePermission).not.toHaveBeenCalled()
  })

  it('createService rejects too-short name without calling permission', async () => {
    const result = await createService({
      name: 'A',
      durationMin: 30,
      price: 100,
    })
    expect(result.ok).toBe(false)
    expect(mockedRequirePermission).not.toHaveBeenCalled()
  })
})
