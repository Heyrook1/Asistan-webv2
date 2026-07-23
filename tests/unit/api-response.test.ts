import { describe, expect, it } from 'vitest'

import {
  apiError,
  apiSuccess,
  apiValidationError,
  parsePathId,
  pathIdSchema,
} from '@/lib/api-response'

describe('path id validation (A5)', () => {
  it('accepts uuid and legacy 32-char hex ids', () => {
    expect(parsePathId('550e8400-e29b-41d4-a716-446655440000')).toBe(
      '550e8400-e29b-41d4-a716-446655440000'
    )
    expect(parsePathId('a'.repeat(32))).toBe('a'.repeat(32))
    expect(parsePathId('  trimmed-id  ')).toBe('trimmed-id')
  })

  it('rejects empty, oversized, and non-string ids', () => {
    expect(parsePathId('')).toBeNull()
    expect(parsePathId('   ')).toBeNull()
    expect(parsePathId('x'.repeat(65))).toBeNull()
    expect(parsePathId(null)).toBeNull()
    expect(parsePathId(undefined)).toBeNull()
    expect(parsePathId(123)).toBeNull()
  })

  it('schema caps length at 64', () => {
    expect(pathIdSchema.safeParse('x'.repeat(64)).success).toBe(true)
    expect(pathIdSchema.safeParse('x'.repeat(65)).success).toBe(false)
  })
})

describe('standard API response contract (A5)', () => {
  it('apiError keeps the legacy error key and adds ok:false', async () => {
    const response = apiError('Randevu bulunamadi', 404)
    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body).toEqual({ ok: false, error: 'Randevu bulunamadi' })
  })

  it('apiError carries an optional machine code', async () => {
    const response = apiError('Çok fazla istek', 429, 'rate_limited')
    const body = await response.json()
    expect(body.ok).toBe(false)
    expect(body.code).toBe('rate_limited')
  })

  it('apiValidationError exposes zod issues with validation code', async () => {
    const issues = [{ path: ['date'], message: 'Invalid' }]
    const response = apiValidationError('Gecersiz istek', issues)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({
      ok: false,
      error: 'Gecersiz istek',
      code: 'validation',
      issues,
    })
  })

  it('apiSuccess wraps payloads with ok:true', async () => {
    const response = apiSuccess({ id: 'x' }, 201)
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ ok: true, data: { id: 'x' } })
  })
})
