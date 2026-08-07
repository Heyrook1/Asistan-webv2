/**
 * Güvenli Response → JSON okuma (boş gövde / HTML / parse hatası).
 * Ham SyntaxError kullanıcıya gösterilmez.
 */

export class HttpJsonError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, code: string, status = 0) {
    super(message)
    this.name = 'HttpJsonError'
    this.code = code
    this.status = status
  }
}

const AVAILABILITY_MSG =
  'Uygun saatler şu anda alınamıyor. Lütfen tekrar deneyin.'
const GENERIC_MSG = 'İstek tamamlanamadı. Lütfen tekrar deneyin.'

export type ReadJsonOptions = {
  /** Override default Turkish user-facing message on parse/empty failures. */
  emptyMessage?: string
  /** When true, prefer availability-oriented copy. */
  kind?: 'availability' | 'generic'
}

function defaultMessage(kind: ReadJsonOptions['kind']) {
  return kind === 'availability' ? AVAILABILITY_MSG : GENERIC_MSG
}

/**
 * Read a fetch Response as JSON without throwing SyntaxError to callers.
 * Empty body, non-JSON Content-Type, or parse failure → HttpJsonError with safe TR message.
 */
export async function readJsonResponse<T = unknown>(
  res: Response,
  options: ReadJsonOptions = {},
): Promise<{ ok: boolean; status: number; data: T }> {
  const safeMsg = options.emptyMessage ?? defaultMessage(options.kind)
  const status = res.status

  const raw = await res.text().catch(() => '')
  const trimmed = raw.trim()

  if (!trimmed) {
    if (!res.ok) {
      throw new HttpJsonError(safeMsg, 'EMPTY_ERROR_BODY', status)
    }
    throw new HttpJsonError(safeMsg, 'EMPTY_BODY', status)
  }

  const contentType = res.headers.get('content-type') ?? ''
  const looksJson =
    contentType.includes('application/json') ||
    trimmed.startsWith('{') ||
    trimmed.startsWith('[')

  if (!looksJson) {
    throw new HttpJsonError(safeMsg, 'NON_JSON_BODY', status)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed) as unknown
  } catch {
    throw new HttpJsonError(safeMsg, 'JSON_PARSE_ERROR', status)
  }

  return { ok: res.ok, status, data: parsed as T }
}

/** Extract slots from legacy `{ slots }` or `{ ok, data: { slots } }` shapes. */
export function extractAvailabilitySlots(data: unknown): {
  slots: Array<{ startTime: string; endTime: string }>
  errorMessage: string | null
} {
  if (!data || typeof data !== 'object') {
    return { slots: [], errorMessage: AVAILABILITY_MSG }
  }
  const obj = data as Record<string, unknown>

  if (typeof obj.error === 'string' && obj.error.trim()) {
    // Prefer API's user-facing error when present (already Turkish in our routes).
    return { slots: [], errorMessage: obj.error }
  }

  if (Array.isArray(obj.slots)) {
    return { slots: obj.slots as Array<{ startTime: string; endTime: string }>, errorMessage: null }
  }

  const nested = obj.data
  if (nested && typeof nested === 'object' && Array.isArray((nested as { slots?: unknown }).slots)) {
    return {
      slots: (nested as { slots: Array<{ startTime: string; endTime: string }> }).slots,
      errorMessage: null,
    }
  }

  return { slots: [], errorMessage: null }
}

export function userMessageFromUnknown(error: unknown, fallback: string): string {
  if (error instanceof HttpJsonError) return error.message
  // Never surface SyntaxError / stack snippets.
  if (error instanceof SyntaxError) return fallback
  if (error instanceof Error) {
    const msg = error.message
    if (/json|unexpected end|syntax/i.test(msg)) return fallback
    // Allow our own short TR API messages through.
    if (msg.length > 0 && msg.length < 160 && !/at\s+\S+\s+\(/.test(msg)) return msg
  }
  return fallback
}
