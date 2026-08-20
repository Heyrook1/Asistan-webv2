import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  TRUST_CONTROL_MATRIX,
  getPublicTrustControlMatrix,
  listPlannedTrustControls,
} from '@/lib/brand/trust-control-matrix'

describe('trust control matrix', () => {
  it('covers the five public trust claims with owner + verification date', () => {
    expect(TRUST_CONTROL_MATRIX.map((r) => r.id).sort()).toEqual(
      ['audit-log', 'erasure', 'rbac', 'server-session', 'tenant-isolation'].sort(),
    )
    for (const row of TRUST_CONTROL_MATRIX) {
      expect(row.publicClaim.length).toBeGreaterThan(3)
      expect(row.codeControl.length).toBeGreaterThan(3)
      expect(row.automatedTest.length).toBeGreaterThan(3)
      expect(row.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(['Security', 'Backend', 'Platform', 'Privacy']).toContain(row.owner)
    }
  })

  it('labels erasure as planned until integration proof exists', () => {
    const erasure = TRUST_CONTROL_MATRIX.find((r) => r.id === 'erasure')
    expect(erasure?.posture).toBe('planned')
    expect(listPlannedTrustControls().some((r) => r.id === 'erasure')).toBe(true)
    expect(erasure?.publicDetail.toLowerCase()).toContain('planlanan')
  })

  it('keeps audit as partial — not absolute durability claim', () => {
    const audit = TRUST_CONTROL_MATRIX.find((r) => r.id === 'audit-log')
    expect(audit?.posture).toBe('partial')
    expect(audit?.publicDetail.toLowerCase()).not.toMatch(/kesintisiz|garanti/)
  })

  it('public DTO omits internal file paths', () => {
    const payload = JSON.stringify(getPublicTrustControlMatrix())
    expect(payload).not.toContain('lib/')
    expect(payload).not.toContain('tests/')
    expect(payload).toContain('Planlanan kontrol')
    expect(payload).toContain('Aktif kontrol')
  })

  it('/guven page consumes the matrix and does not assert absolute erasure as a live control', () => {
    const page = readFileSync(join(process.cwd(), 'app/guven/page.tsx'), 'utf8')
    expect(page).toContain('getPublicTrustControlMatrix')
    expect(page).toContain('planlanan')
    // Absolute erasure may appear only as an anti-pattern we refuse to claim.
    expect(page).toMatch(/Kanıtsız kesin .*anonimleştirilir/)
    expect(page).not.toMatch(/detail:\s*'[^']*kişisel alanlar anonimleştirilir/)
  })
})
