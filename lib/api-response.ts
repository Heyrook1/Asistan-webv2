import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'

/**
 * Path-param id: hyphenated UUID or legacy 32-char hex — same contract as the
 * availability route. Reject anything longer/empty before it reaches Prisma.
 */
export const pathIdSchema = z.string().trim().min(1).max(64)

/** Validate a dynamic route [id]/[slug] param; null when invalid. */
export function parsePathId(raw: unknown): string | null {
  const parsed = pathIdSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

interface ApiSuccessResponse<T> {
  ok: true
  data: T
}

interface ApiErrorResponse {
  ok: false
  error: string
  code?: string
  /** Zod validation issues — safe to expose (field paths, not values). */
  issues?: unknown
  details?: unknown
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

export function apiSuccess<T>(data: T, statusCode = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ ok: true, data }, { status: statusCode })
}

/**
 * Force a private, uncacheable response — required for PHI / health-record routes
 * so nothing lands in browser, PWA, CDN, or shared caches.
 */
export function noStore<T extends NextResponse>(response: T): T {
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  return response
}

export function apiError(
  message: string,
  statusCode = 500,
  code?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  if (statusCode === 500) {
    Sentry.captureMessage(`API Error: ${message}`, 'error')
  }

  const body: ApiErrorResponse = {
    ok: false,
    error: message,
  }
  if (code) body.code = code
  if (process.env.NODE_ENV === 'development' && details != null) {
    body.details = details
  }

  return NextResponse.json(body, { status: statusCode })
}

/** 400 with Zod issues in the body (issues stay visible in production — forms need them). */
export function apiValidationError(
  message: string,
  issues: unknown,
  statusCode = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { ok: false as const, error: message, code: 'validation', issues },
    { status: statusCode }
  )
}

export class ApiErrorClass extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
