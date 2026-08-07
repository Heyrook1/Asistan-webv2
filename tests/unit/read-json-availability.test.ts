import { describe, expect, it } from 'vitest'

import {
  extractAvailabilitySlots,
  HttpJsonError,
  readJsonResponse,
  userMessageFromUnknown,
} from '@/lib/http/read-json'
import {
  hashBookingPayload,
  stripIdempotencyMeta,
  IDEMPOTENCY_PAYLOAD_HASH_FIELD,
} from '@/lib/public-booking/idempotency-key'

function mockResponse(
  body: string,
  init: { status?: number; contentType?: string | null } = {},
): Response {
  const headers = new Headers()
  if (init.contentType !== null) {
    headers.set('content-type', init.contentType ?? 'application/json')
  }
  return new Response(body, { status: init.status ?? 200, headers })
}

describe('readJsonResponse', () => {
  it('parses valid JSON', async () => {
    const res = mockResponse(JSON.stringify({ slots: [{ startTime: '10:00', endTime: '10:30' }] }))
    const out = await readJsonResponse<{ slots: unknown[] }>(res, { kind: 'availability' })
    expect(out.ok).toBe(true)
    expect(out.data.slots).toHaveLength(1)
  })

  it('throws safe TR message on empty body', async () => {
    const res = mockResponse('', { status: 200 })
    await expect(readJsonResponse(res, { kind: 'availability' })).rejects.toMatchObject({
      name: 'HttpJsonError',
      code: 'EMPTY_BODY',
      message: expect.stringContaining('Uygun saatler'),
    })
  })

  it('throws safe TR message on HTML body', async () => {
    const res = mockResponse('<html>error</html>', {
      status: 502,
      contentType: 'text/html',
    })
    await expect(readJsonResponse(res, { kind: 'availability' })).rejects.toBeInstanceOf(
      HttpJsonError,
    )
  })

  it('throws on invalid JSON text', async () => {
    const res = mockResponse('{not-json', { contentType: 'application/json' })
    await expect(readJsonResponse(res, { kind: 'availability' })).rejects.toMatchObject({
      code: 'JSON_PARSE_ERROR',
    })
  })
})

describe('extractAvailabilitySlots', () => {
  it('reads legacy top-level slots', () => {
    const { slots, errorMessage } = extractAvailabilitySlots({
      slots: [{ startTime: '09:00', endTime: '09:30' }],
    })
    expect(slots).toHaveLength(1)
    expect(errorMessage).toBeNull()
  })

  it('reads apiSuccess nested data.slots', () => {
    const { slots } = extractAvailabilitySlots({
      ok: true,
      data: { slots: [{ startTime: '11:00', endTime: '11:30' }] },
    })
    expect(slots[0]?.startTime).toBe('11:00')
  })

  it('surfaces API error string', () => {
    const { slots, errorMessage } = extractAvailabilitySlots({
      ok: false,
      error: 'Çok fazla istek',
    })
    expect(slots).toHaveLength(0)
    expect(errorMessage).toBe('Çok fazla istek')
  })
})

describe('userMessageFromUnknown', () => {
  it('hides SyntaxError details', () => {
    const msg = userMessageFromUnknown(
      new SyntaxError("Unexpected end of JSON input"),
      'Güvenli mesaj',
    )
    expect(msg).toBe('Güvenli mesaj')
  })
})

describe('idempotency payload hash', () => {
  it('is stable across key order', () => {
    expect(hashBookingPayload({ a: 1, b: 2 })).toBe(hashBookingPayload({ b: 2, a: 1 }))
  })

  it('differs for different payloads', () => {
    expect(hashBookingPayload({ startTime: '10:00' })).not.toBe(
      hashBookingPayload({ startTime: '11:00' }),
    )
  })

  it('stripIdempotencyMeta removes internal hash', () => {
    const stripped = stripIdempotencyMeta({
      appointmentId: 'x',
      [IDEMPOTENCY_PAYLOAD_HASH_FIELD]: 'abc',
    })
    expect(stripped).toEqual({ appointmentId: 'x' })
    expect(stripped[IDEMPOTENCY_PAYLOAD_HASH_FIELD]).toBeUndefined()
  })
})
