type SentryLikeEvent = {
  request?: {
    url?: string
    query_string?: unknown
    data?: unknown
    cookies?: unknown
    headers?: Record<string, unknown>
  }
  user?: Record<string, unknown>
  extra?: Record<string, unknown>
  contexts?: Record<string, unknown>
}

const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-supabase-auth',
])

const PHI_EXTRA_KEYS = /^(phone|email|fullName|name|identity|tc|password|token|otp|address)/i

/** Remove likely PHI/auth material before errors or transactions leave the app. */
export function scrubSentryEvent<T extends SentryLikeEvent>(event: T): T {
  if (event.request) {
    if (event.request.url) {
      event.request.url = event.request.url.split('?')[0]
    }
    delete event.request.query_string
    delete event.request.data
    delete event.request.cookies

    if (event.request.headers) {
      event.request.headers = Object.fromEntries(
        Object.entries(event.request.headers).filter(
          ([name]) => !SENSITIVE_HEADERS.has(name.toLowerCase())
        )
      )
    }
  }

  if (event.user) {
    event.user = event.user.id ? { id: event.user.id } : {}
  }

  if (event.extra) {
    event.extra = Object.fromEntries(
      Object.entries(event.extra).filter(([key]) => !PHI_EXTRA_KEYS.test(key))
    )
  }

  return event
}
