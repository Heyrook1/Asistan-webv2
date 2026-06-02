import { API_BASE_URL } from './config'
import { supabase } from './supabase'

let resolvedApiBaseUrl: string | null = null

function normalizeBaseUrl(value: string | undefined | null) {
  if (!value) return null
  const normalized = value.trim().replace(/\/$/, '')
  return normalized.length > 0 ? normalized : null
}

function dedupe(values: Array<string | null>) {
  const unique = new Set<string>()
  for (const value of values) {
    if (!value) continue
    unique.add(value)
  }
  return Array.from(unique)
}

function buildWebFallbackBaseUrls() {
  if (typeof window === 'undefined') return []

  const protocol = window.location.protocol || 'http:'
  const host = window.location.hostname || 'localhost'

  return dedupe([
    `${protocol}//${host}:3000`,
    `${protocol}//localhost:3000`,
    `${protocol}//127.0.0.1:3000`,
  ])
}

function buildApiBaseUrlCandidates() {
  return dedupe([
    normalizeBaseUrl(resolvedApiBaseUrl),
    normalizeBaseUrl(API_BASE_URL),
    normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL_WEB),
    normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL),
    ...buildWebFallbackBaseUrls(),
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ])
}

async function getAccessToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken()
  const baseCandidates = buildApiBaseUrlCandidates()
  const networkErrors: string[] = []

  let response: Response | null = null
  let activeBaseUrl: string | null = null

  for (const baseUrl of baseCandidates) {
    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(init?.headers ?? {}),
        },
      })
      activeBaseUrl = baseUrl
      resolvedApiBaseUrl = baseUrl
      break
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Bilinmeyen ag hatasi'
      networkErrors.push(`${baseUrl} -> ${reason}`)
    }
  }

  if (!response || !activeBaseUrl) {
    const details = networkErrors.length > 0 ? ` Detay: ${networkErrors.join(' | ')}` : ''
    const startHint =
      "Backend ulasilamaz durumda. Kok klasorde `npm run mobile:web:full` komutunu calistirin. `mobile/` klasorundeyseniz `npm run web:full` kullanin (alternatif: ayri terminallerde `npm run dev` ve `npm --prefix mobile run web`). PowerShell execution policy hatasi alirsaniz `npm` yerine `npm.cmd` kullanin."
    throw new Error(
      `${startHint} Denenen adresler: ${baseCandidates.join(', ')}.${details}`
    )
  }

  const rawBody = await response.text()
  let payload: unknown = null
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody)
    } catch {
      payload = null
    }
  }
  if (!response.ok) {
    let message =
      (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : null) ?? `Istek basarisiz (${response.status})`

    if (
      response.status >= 500 &&
      /can't reach database server|prismaclientinitializationerror|internal server error/i.test(rawBody)
    ) {
      message =
        "Backend calisiyor ama veritabanina erisemiyor. .env.local icindeki DATABASE_URL ayarini ve internet baglantisini kontrol edin."
    }

    throw new Error(message)
  }

  return payload as T
}

export function apiGet<T>(path: string) {
  return request<T>(path, { method: 'GET' })
}

export function apiPost<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function apiPut<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function apiPatch<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
