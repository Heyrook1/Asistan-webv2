import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

interface ApiSuccessResponse<T> {
  ok: true
  data: T
}

interface ApiErrorResponse {
  ok: false
  error: string
  code?: string
  details?: unknown
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

export function apiSuccess<T>(data: T, statusCode = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ ok: true, data }, { status: statusCode })
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
