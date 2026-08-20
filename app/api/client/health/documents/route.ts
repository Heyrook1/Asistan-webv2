/**
 * GET  /api/client/health/documents — paginated, category-filtered document list.
 * POST /api/client/health/documents — multipart upload (file + metadata).
 *
 * The raw file never touches a public bucket: it is validated (size/MIME/magic
 * bytes) and stored via the service role, and only its metadata is returned.
 */
import { type NextRequest } from 'next/server'
import { apiError, apiSuccess, apiValidationError, noStore } from '@/lib/api-response'
import {
  DocumentListQuerySchema,
  DocumentMetadataSchema,
  createDocument,
  listDocuments,
} from '@/lib/client-marketplace/health-records'
import { PERSON_DOCUMENT_MAX_SIZE_BYTES } from '@/lib/storage-constants'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { guardHealthRoute, mapHealthRecordError } from '@/lib/client-marketplace/health-records/route-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const guard = await guardHealthRoute(request, { action: 'documents:list' })
  if (!guard.ok) return guard.response
  if (!guard.personId) return noStore(apiSuccess({ items: [], nextCursor: null }))

  const url = new URL(request.url)
  const parsedQuery = DocumentListQuerySchema.safeParse({
    category: url.searchParams.get('category') ?? undefined,
  })
  const category = parsedQuery.success ? parsedQuery.data.category : 'ALL'
  const cursor = url.searchParams.get('cursor')
  const limitRaw = Number(url.searchParams.get('limit'))
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : undefined

  try {
    const result = await listDocuments(guard.personId, { category, cursor, limit })
    return noStore(apiSuccess(result))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}

export async function POST(request: NextRequest) {
  const guard = await guardHealthRoute(request, {
    action: 'documents:upload',
    requirePerson: true,
    rate: RATE_LIMITS.upload,
  })
  if (!guard.ok) return guard.response

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return noStore(apiError('Geçersiz istek gövdesi', 400))
  }

  const file = form.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return noStore(apiError('Yüklenecek dosya bulunamadı', 400, 'no_file'))
  }
  if (file.size > PERSON_DOCUMENT_MAX_SIZE_BYTES) {
    return noStore(apiError('Dosya 25 MB sınırını aşıyor', 413, 'too_large'))
  }

  const parsed = DocumentMetadataSchema.safeParse({
    title: form.get('title') ?? undefined,
    category: form.get('category') ?? undefined,
    documentDate: form.get('documentDate') ?? undefined,
    notes: form.get('notes') ?? undefined,
  })
  if (!parsed.success) return noStore(apiValidationError('Geçersiz belge bilgisi', parsed.error.issues))

  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const created = await createDocument(guard.personId!, guard.auth.clientUser.id, {
      bytes,
      declaredMime: file.type || 'application/octet-stream',
      metadata: parsed.data,
    })
    return noStore(apiSuccess(created, 201))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}
