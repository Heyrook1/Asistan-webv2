/**
 * GET    /api/client/health/documents/[id] — metadata + short-lived signed URL
 * PATCH  /api/client/health/documents/[id] — rename / edit metadata (patient uploads)
 * DELETE /api/client/health/documents/[id] — delete row + private object
 */
import { type NextRequest } from 'next/server'
import { apiError, apiSuccess, apiValidationError, noStore, parsePathId } from '@/lib/api-response'
import {
  DocumentUpdateSchema,
  deleteDocument,
  getDocumentWithAccess,
  updateDocumentMetadata,
} from '@/lib/client-marketplace/health-records'
import { guardHealthRoute, mapHealthRecordError } from '@/lib/client-marketplace/health-records/route-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await guardHealthRoute(request, { action: 'documents:get', requirePerson: true })
  if (!guard.ok) return guard.response
  const id = parsePathId((await context.params).id)
  if (!id) return noStore(apiError('Geçersiz kayıt kimliği', 400))

  try {
    return noStore(apiSuccess(await getDocumentWithAccess(guard.personId!, id)))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await guardHealthRoute(request, { action: 'documents:update', requirePerson: true })
  if (!guard.ok) return guard.response
  const id = parsePathId((await context.params).id)
  if (!id) return noStore(apiError('Geçersiz kayıt kimliği', 400))

  const body = await request.json().catch(() => null)
  const parsed = DocumentUpdateSchema.safeParse(body)
  if (!parsed.success) return noStore(apiValidationError('Geçersiz belge bilgisi', parsed.error.issues))

  try {
    return noStore(apiSuccess(await updateDocumentMetadata(guard.personId!, id, parsed.data)))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await guardHealthRoute(request, { action: 'documents:delete', requirePerson: true })
  if (!guard.ok) return guard.response
  const id = parsePathId((await context.params).id)
  if (!id) return noStore(apiError('Geçersiz kayıt kimliği', 400))

  try {
    await deleteDocument(guard.personId!, id)
    return noStore(apiSuccess({ deleted: true }))
  } catch (error) {
    return mapHealthRecordError(error)
  }
}
