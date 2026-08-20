import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/session', () => ({
  requireSession: vi.fn(async () => ({ businessId: 'biz-1', userId: 'u-1' })),
  can: vi.fn(() => false),
}))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    patient: { findMany: vi.fn(async () => []) },
    appointment: { findMany: vi.fn(async () => []) },
  },
}))

import { searchGlobalPalette } from '@/lib/actions/global-search'

describe('lib/actions/global-search validation', () => {
  it('rejects overlong query without hitting prisma', async () => {
    const { prisma } = await import('@/lib/prisma')
    const long = 'x'.repeat(200)
    const result = await searchGlobalPalette(long)
    expect(result).toEqual({ patients: [], appointments: [] })
    expect(prisma.patient.findMany).not.toHaveBeenCalled()
  })
})
