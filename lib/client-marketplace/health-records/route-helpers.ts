import 'server-only'

import { type NextRequest } from 'next/server'
import { apiError, noStore } from '@/lib/api-response'
import { requireClientAuth, type ClientAuthContext } from '@/lib/client-marketplace/auth'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { HealthRecordError, isHealthRecordError } from './errors'
import { resolvePersonId } from './identity'

/** Map a service-layer HealthRecordError (or unknown) to a safe API response. */
export function mapHealthRecordError(error: unknown) {
  if (isHealthRecordError(error)) {
    switch (error.code) {
      case 'not_found':
        return noStore(apiError('Kayıt bulunamadı', 404, 'not_found'))
      case 'not_editable':
        return noStore(apiError('Bu kayıt klinik tarafından oluşturuldu ve düzenlenemez', 403, 'not_editable'))
      case 'invalid_file':
        return noStore(apiError('Dosya doğrulanamadı', 400, 'invalid_file'))
      case 'storage_unavailable':
        return noStore(apiError('Güvenli depolama şu an kullanılamıyor', 503, 'storage_unavailable'))
      case 'storage_failed':
        return noStore(apiError('Dosya işlenemedi, lütfen tekrar deneyin', 502, 'storage_failed'))
    }
  }
  // Never surface raw PHI/DB detail — log the category only, no record content.
  console.error('[health-records] unexpected error', {
    name: error instanceof Error ? error.name : 'unknown',
  })
  return noStore(apiError('Beklenmeyen bir hata oluştu', 500))
}

export type HealthRouteContext = {
  auth: ClientAuthContext
  personId: string
}

/**
 * Shared guard for health-record routes: auth → rate-limit → resolve Person.
 * Returns either a ready-to-send NextResponse (error) or the resolved context.
 * When `requirePerson` is false, a missing Person yields `{ personId: null }`
 * so read routes can return an empty passport instead of an error.
 */
export async function guardHealthRoute(
  request: NextRequest,
  options: {
    action: string
    requirePerson?: boolean
    rate?: { limit: number; window: string }
  } = { action: 'health' }
): Promise<
  | { ok: true; auth: ClientAuthContext; personId: string | null }
  | { ok: false; response: ReturnType<typeof apiError> }
> {
  let auth: ClientAuthContext | null
  try {
    auth = await requireClientAuth(request)
  } catch {
    return { ok: false, response: noStore(apiError('Oturum doğrulanamadı', 503)) }
  }
  if (!auth) return { ok: false, response: noStore(apiError('Unauthorized', 401)) }

  const rate = options.rate ?? RATE_LIMITS.api
  const allowed = await checkRateLimit(
    `health:${options.action}:${auth.clientUser.id}`,
    rate.limit,
    rate.window
  )
  if (!allowed) return { ok: false, response: noStore(apiError('Too many requests', 429)) }

  const personId = await resolvePersonId(auth)
  if (!personId && options.requirePerson) {
    return {
      ok: false,
      response: noStore(
        apiError('Pasaport kimliğiniz henüz hazır değil. Profil bilgilerinizi tamamlayın.', 409, 'no_person')
      ),
    }
  }

  return { ok: true, auth, personId }
}

export { HealthRecordError }
