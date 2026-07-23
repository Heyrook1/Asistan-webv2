/**
 * Structured JSON logging for server runtimes.
 * Never put raw PHI (name, phone, email, identity) in fields — ids + counts only.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogFields = Record<string, string | number | boolean | null | undefined>

const BLOCKED_FIELD_KEYS = new Set([
  'phone',
  'email',
  'fullName',
  'name',
  'identityNumber',
  'patientIdentityNumber',
  'password',
  'token',
  'authorization',
  'cookie',
  'query',
  'search',
  'body',
])

export function sanitizeLogFields(fields?: LogFields): LogFields | undefined {
  if (!fields) return undefined
  const out: LogFields = {}
  for (const [key, value] of Object.entries(fields)) {
    if (BLOCKED_FIELD_KEYS.has(key)) continue
    if (value === undefined) continue
    out[key] = value
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function emit(level: LogLevel, message: string, fields?: LogFields) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    service: 'asistan-web',
    env: process.env.NODE_ENV ?? 'development',
    release: process.env.NEXT_PUBLIC_APP_VERSION ?? undefined,
    ...sanitizeLogFields(fields),
  }
  const line = JSON.stringify(entry)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else if (level === 'debug' && process.env.NODE_ENV === 'production') {
    if (process.env.LOG_LEVEL !== 'debug') return
    console.log(line)
  } else console.log(line)
}

export const log = {
  debug: (message: string, fields?: LogFields) => emit('debug', message, fields),
  info: (message: string, fields?: LogFields) => emit('info', message, fields),
  warn: (message: string, fields?: LogFields) => emit('warn', message, fields),
  error: (message: string, fields?: LogFields) => emit('error', message, fields),
}

/** Capture exception to Sentry + structured log (no PHI fields). */
export async function captureError(
  error: unknown,
  context?: { message?: string; tags?: Record<string, string>; fields?: LogFields }
) {
  const err = error instanceof Error ? error : new Error(String(error))
  log.error(context?.message ?? err.message, {
    ...context?.fields,
    errorName: err.name,
  })
  try {
    const Sentry = await import('@sentry/nextjs')
    Sentry.withScope((scope) => {
      if (context?.tags) {
        for (const [k, v] of Object.entries(context.tags)) scope.setTag(k, v)
      }
      if (context?.fields) {
        scope.setContext('fields', sanitizeLogFields(context.fields) ?? {})
      }
      Sentry.captureException(err)
    })
  } catch {
    /* Sentry unavailable in some test/runtime contexts */
  }
}

/** Lightweight performance span via Sentry (sampled by tracesSampleRate). */
export async function withPerfSpan<T>(
  name: string,
  op: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  try {
    const Sentry = await import('@sentry/nextjs')
    return await Sentry.startSpan(
      {
        name,
        op,
        attributes,
      },
      fn
    )
  } catch {
    return fn()
  }
}
