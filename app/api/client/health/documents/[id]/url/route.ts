/**
 * GET /api/client/health/documents/[id]/url — mint a short-lived signed URL for
 * secure preview/download. Ownership is verified server-side before signing; the
 * URL expires quickly and is never persisted.
 */
import { type NextRequest } from 'next/server'
import { apiError, apiSuccess, noStore, parsePathId } from '@/lib/api-response'
import { getDocumentSignedUrl } from '@/lib/client-marketplace/health-records'
import { guardHealthRoute, mapHealthRecordError } from '@/lib/client-marketplace/health-records/route-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await guardHealthRoute(request, { action: 'documents:url', requirePerson: true })
  if (!guard.ok) return guard.response
  const id = parsePathId((await context.params).id)
  if (!id) return noStore(apiError('Geçersiz kayıt kimliği', 400))

  try {
    return noStore(apiSuccess(await getDocumentSignedUrl(guard.personId!, id)))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}
