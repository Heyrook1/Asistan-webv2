import 'server-only'

/**
 * Patient-owned medical documents (Person-scoped). Metadata lives in Postgres
 * (RLS via app.person_id); the file lives in the private `person-documents`
 * bucket and is only ever reached via a short-lived signed URL after ownership
 * is verified here. We never return the storageKey to clients.
 */
import { withPersonDb } from '@/lib/passport/person-db'
import {
  deletePersonDocument,
  signPersonDocumentUrl,
  storageKeyBelongsToPerson,
  uploadPersonDocument,
  validateDocumentBytes,
} from '@/lib/storage/documents-storage'
import { HealthRecordError } from './errors'
import { emitHealthRecordEvent } from './events'
import type {
  DocumentCategory,
  DocumentMetadataInput,
  DocumentUpdateInput,
  HealthRecordSourceValue,
} from './schemas'
import type { DocumentDto, DocumentListResult } from './types'

type DocumentRow = {
  id: string
  title: string
  category: DocumentCategory
  mimeType: string
  fileSize: number
  documentDate: Date | null
  notes: string | null
  sourceType: HealthRecordSourceValue
  createdAt: Date
  updatedAt: Date
}

const SELECT = {
  id: true,
  title: true,
  category: true,
  mimeType: true,
  fileSize: true,
  documentDate: true,
  notes: true,
  sourceType: true,
  createdAt: true,
  updatedAt: true,
} as const

function toDto(row: DocumentRow): DocumentDto {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    mimeType: row.mimeType,
    fileSize: row.fileSize,
    documentDate: row.documentDate ? row.documentDate.toISOString() : null,
    notes: row.notes,
    source: row.sourceType,
    editable: row.sourceType === 'PATIENT_ENTERED',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

const DEFAULT_PAGE_SIZE = 30
const MAX_PAGE_SIZE = 100

export async function listDocuments(
  personId: string,
  options: { category?: DocumentCategory | 'ALL'; cursor?: string | null; limit?: number } = {}
): Promise<DocumentListResult> {
  const limit = Math.min(Math.max(options.limit ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE)
  const category = options.category && options.category !== 'ALL' ? options.category : undefined

  const rows = await withPersonDb(personId, (tx) =>
    tx.personDocument.findMany({
      where: { personId, deletedAt: null, ...(category ? { category } : {}) },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      select: SELECT,
    })
  )

  const page = rows as DocumentRow[]
  const hasMore = page.length > limit
  const items = (hasMore ? page.slice(0, limit) : page).map(toDto)
  return { items, nextCursor: hasMore ? page[limit - 1]!.id : null }
}

export async function getDocument(personId: string, id: string): Promise<DocumentDto> {
  const row = await withPersonDb(personId, (tx) =>
    tx.personDocument.findFirst({ where: { id, personId, deletedAt: null }, select: SELECT })
  )
  if (!row) throw new HealthRecordError('not_found')
  return toDto(row as DocumentRow)
}

/**
 * Detail + short-lived signed URL. GET /documents/[id] uses this so the client
 * never sees a storageKey and never persists a URL.
 */
export async function getDocumentWithAccess(
  personId: string,
  id: string
): Promise<DocumentDto & { url: string; expiresInSeconds: number }> {
  const row = await withPersonDb(personId, (tx) =>
    tx.personDocument.findFirst({
      where: { id, personId, deletedAt: null },
      select: { ...SELECT, storageKey: true },
    })
  )
  if (!row) throw new HealthRecordError('not_found')
  const typed = row as DocumentRow & { storageKey: string }
  if (!storageKeyBelongsToPerson(typed.storageKey, personId)) throw new HealthRecordError('not_found')

  const signed = await signPersonDocumentUrl(typed.storageKey)
  if (!signed.ok) throw new HealthRecordError('storage_failed')
  return { ...toDto(typed), url: signed.value.url, expiresInSeconds: signed.value.expiresInSeconds }
}

/** Verifies ownership, then mints a short-lived signed URL for the private object. */
export async function getDocumentSignedUrl(
  personId: string,
  id: string
): Promise<{ url: string; expiresInSeconds: number; mimeType: string }> {
  const row = await withPersonDb(personId, (tx) =>
    tx.personDocument.findFirst({
      where: { id, personId, deletedAt: null },
      select: { storageKey: true, mimeType: true },
    })
  )
  if (!row) throw new HealthRecordError('not_found')
  const typed = row as { storageKey: string; mimeType: string }
  // Defense in depth: the object path must live under this person's prefix.
  if (!storageKeyBelongsToPerson(typed.storageKey, personId)) throw new HealthRecordError('not_found')

  const signed = await signPersonDocumentUrl(typed.storageKey)
  if (!signed.ok) throw new HealthRecordError('storage_failed')
  return { url: signed.value.url, expiresInSeconds: signed.value.expiresInSeconds, mimeType: typed.mimeType }
}

export async function createDocument(
  personId: string,
  uploadedByClientUserId: string | null,
  params: { bytes: Uint8Array; declaredMime: string; metadata: DocumentMetadataInput }
): Promise<DocumentDto> {
  const validation = validateDocumentBytes(params.bytes, params.declaredMime)
  if (!validation.ok) throw new HealthRecordError('invalid_file', validation.code)

  const uploaded = await uploadPersonDocument({
    personId,
    bytes: params.bytes,
    mimeType: validation.mimeType,
  })
  if (!uploaded.ok) {
    throw new HealthRecordError(
      uploaded.error === 'storage-unavailable' ? 'storage_unavailable' : 'storage_failed'
    )
  }

  try {
    const row = await withPersonDb(personId, (tx) =>
      tx.personDocument.create({
        data: {
          personId,
          uploadedByClientUserId,
          sourceType: 'PATIENT_ENTERED',
          title: params.metadata.title,
          category: params.metadata.category ?? 'OTHER',
          documentDate: params.metadata.documentDate,
          notes: params.metadata.notes,
          storageKey: uploaded.value.storageKey,
          mimeType: validation.mimeType,
          fileSize: uploaded.value.size,
        },
        select: SELECT,
      })
    )
    const dto = toDto(row as DocumentRow)
    emitHealthRecordEvent('document_uploaded', { id: dto.id, category: dto.category })
    return dto
  } catch (error) {
    // Compensate: the DB row failed, so the orphaned object must not linger.
    await deletePersonDocument(uploaded.value.storageKey).catch(() => undefined)
    throw error
  }
}

export async function updateDocumentMetadata(
  personId: string,
  id: string,
  input: DocumentUpdateInput
): Promise<DocumentDto> {
  return withPersonDb(personId, async (tx) => {
    const existing = await tx.personDocument.findFirst({
      where: { id, personId, deletedAt: null },
      select: { id: true, sourceType: true },
    })
    if (!existing) throw new HealthRecordError('not_found')
    if (existing.sourceType !== 'PATIENT_ENTERED') throw new HealthRecordError('not_editable')

    const row = await tx.personDocument.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.documentDate !== undefined ? { documentDate: input.documentDate } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
      select: SELECT,
    })
    const dto = toDto(row as DocumentRow)
    emitHealthRecordEvent('document_updated', { id: dto.id, category: dto.category })
    return dto
  })
}

export async function deleteDocument(personId: string, id: string): Promise<void> {
  const storageKey = await withPersonDb(personId, async (tx) => {
    const existing = await tx.personDocument.findFirst({
      where: { id, personId, deletedAt: null },
      select: { id: true, sourceType: true, storageKey: true },
    })
    if (!existing) throw new HealthRecordError('not_found')
    const typed = existing as { id: string; sourceType: HealthRecordSourceValue; storageKey: string }
    if (typed.sourceType !== 'PATIENT_ENTERED') throw new HealthRecordError('not_editable')
    // Hard-delete the row (file must not outlive it), then remove the object.
    await tx.personDocument.delete({ where: { id } })
    return typed.storageKey
  })

  const removed = await deletePersonDocument(storageKey)
  emitHealthRecordEvent('document_deleted', { id })
  if (!removed.ok) {
    // Never log the storage key (contains personId). Record id is enough to retry cleanup.
    console.warn('[health-records] document object cleanup failed', { id })
  }
}
