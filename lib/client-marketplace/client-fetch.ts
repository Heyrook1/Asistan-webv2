import { createClient } from '@/lib/supabase/client'

/**
 * Shared client-side (browser) authenticated fetch for the patient app.
 *
 * Attaches the Supabase Bearer token expected by `requireClientAuth`. Extracted
 * from the per-panel duplicates (bookings/profile/health) so every /client
 * surface uses one auth+error contract. Throws `AUTH_REQUIRED` when signed out.
 */
export async function getAccessToken(): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export async function clientFetch<T>(
  path: string,
  init?: RequestInit,
  fallbackError = 'Request failed',
): Promise<T> {
  const token = await getAccessToken()
  if (!token) {
    throw new Error('AUTH_REQUIRED')
  }
  const response = await fetch(path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error((body as { error?: string }).error ?? fallbackError)
  }
  return body as T
}

/**
 * Authenticated JSON fetch that unwraps the `{ ok, data }` envelope used by the
 * patient API routes and returns `data` directly. Throws with the server-provided
 * (already user-safe) error message on non-2xx.
 */
export async function clientFetchData<T>(
  path: string,
  init?: RequestInit,
  fallbackError = 'Request failed',
): Promise<T> {
  const body = await clientFetch<{ ok?: boolean; data?: T; error?: string }>(path, init, fallbackError)
  if (body?.ok === false || body?.data === undefined) {
    throw new Error(body?.error ?? fallbackError)
  }
  return body.data as T
}

/** Multipart upload variant — does not set content-type (browser sets boundary). */
export async function clientUploadData<T>(
  path: string,
  form: FormData,
  fallbackError = 'Upload failed',
): Promise<T> {
  const token = await getAccessToken()
  if (!token) throw new Error('AUTH_REQUIRED')
  const response = await fetch(path, {
    method: 'POST',
    body: form,
    headers: { authorization: `Bearer ${token}` },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || (body as { ok?: boolean }).ok === false) {
    throw new Error((body as { error?: string }).error ?? fallbackError)
  }
  return (body as { data: T }).data
}
