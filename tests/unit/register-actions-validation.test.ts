import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: { user: { findUnique: vi.fn(async () => null) } },
}))

import { checkDuplicateEmail } from '@/app/register/actions'

describe('app/register/actions validation', () => {
  it('rejects invalid email before database lookup', async () => {
    const result = await checkDuplicateEmail('not-an-email')
    expect(result).toMatchObject({ error: expect.any(String) })
    expect(result).not.toHaveProperty('exists')
  })
})
