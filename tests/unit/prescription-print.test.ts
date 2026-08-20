import { describe, expect, it, vi, beforeEach } from 'vitest'

const { findFirst, tenantTransaction } = vi.hoisted(() => {
  const findFirstFn = vi.fn()
  return {
    findFirst: findFirstFn,
    tenantTransaction: vi.fn(async (_biz: string, fn: (tx: unknown) => Promise<unknown>) =>
      fn({ prescription: { findFirst: findFirstFn } }),
    ),
  }
})

vi.mock('server-only', () => ({}))
vi.mock('@/lib/prisma', () => ({
  prisma: { prescription: { findFirst } },
}))
vi.mock('@/lib/security/tenant-db-context', () => ({
  tenantTransaction,
}))
vi.mock('@/lib/security/tenant-guard', () => ({
  runWithTenantBypassAsync: async (_reason: string, fn: () => Promise<unknown>) => fn(),
}))

import {
  createPrescriptionVerifyToken,
  parsePrescriptionVerifyToken,
  prescriptionVerifyAbsoluteUrl,
  hashPrescriptionShareToken,
} from '@/lib/prescriptions/share-token'
import { renderPrescriptionQrSvg } from '@/lib/prescriptions/qr'
import { getPrescriptionForPrint } from '@/lib/prescriptions/queries'

describe('prescription verify token', () => {
  const businessId = '11111111-1111-4111-8111-111111111111'
  const prescriptionId = '22222222-2222-4222-8222-222222222222'

  it('round-trips a valid HMAC token', () => {
    const token = createPrescriptionVerifyToken({ businessId, prescriptionId })
    const parsed = parsePrescriptionVerifyToken(token)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.businessId).toBe(businessId)
    expect(parsed.prescriptionId).toBe(prescriptionId)
  })

  it('rejects tampered tokens', () => {
    const token = createPrescriptionVerifyToken({ businessId, prescriptionId })
    const [body, sig] = token.split('.')
    expect(parsePrescriptionVerifyToken(`${body}.${sig}x`)).toEqual({ ok: false })
    expect(parsePrescriptionVerifyToken('not-a-token')).toEqual({ ok: false })
  })

  it('rejects expired tokens', () => {
    const token = createPrescriptionVerifyToken({
      businessId,
      prescriptionId,
      expSec: Math.floor(Date.now() / 1000) - 10,
    })
    expect(parsePrescriptionVerifyToken(token)).toEqual({ ok: false })
  })

  it('builds absolute verify URL under /rx/', () => {
    const prev = process.env.NEXT_PUBLIC_APP_URL
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.test'
    const token = createPrescriptionVerifyToken({ businessId, prescriptionId })
    expect(prescriptionVerifyAbsoluteUrl(token)).toBe(
      `https://example.test/rx/${encodeURIComponent(token)}`,
    )
    process.env.NEXT_PUBLIC_APP_URL = prev
  })

  it('hashes share tokens stably', () => {
    expect(hashPrescriptionShareToken('abc')).toBe(hashPrescriptionShareToken('abc'))
    expect(hashPrescriptionShareToken('abc')).not.toBe(hashPrescriptionShareToken('abd'))
  })
})

describe('prescription QR', () => {
  it('renders SVG for the verify URL', async () => {
    const url = 'https://example.test/rx/demo-token'
    const svg = await renderPrescriptionQrSvg(url)
    expect(svg).toContain('<svg')
    expect(svg.length).toBeGreaterThan(100)
  })
})

describe('getPrescriptionForPrint', () => {
  beforeEach(() => {
    findFirst.mockReset()
    tenantTransaction.mockClear()
  })

  it('queries with tenant scope + explicit select (no shareTokenHash)', async () => {
    findFirst.mockResolvedValue({
      id: 'rx-1',
      businessId: 'biz-1',
      patientId: 'p-1',
      protocolNo: 'RX-1',
      lines: [],
    })
    const row = await getPrescriptionForPrint('biz-1', 'p-1', 'rx-1')
    expect(row?.protocolNo).toBe('RX-1')
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'rx-1', businessId: 'biz-1', patientId: 'p-1' },
        select: expect.objectContaining({
          protocolNo: true,
          lines: expect.any(Object),
        }),
      }),
    )
    const selectArg = findFirst.mock.calls[0]?.[0]?.select as Record<string, unknown>
    expect(selectArg).not.toHaveProperty('shareTokenHash')
  })

  it('returns null for missing / cross-tenant row', async () => {
    findFirst.mockResolvedValue(null)
    await expect(getPrescriptionForPrint('biz-1', 'p-1', 'other')).resolves.toBeNull()
  })
})
