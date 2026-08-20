import 'server-only'

/**
 * Server-mediated storage for patient-owned Passport documents.
 *
 * The `person-documents` bucket is private with NO storage RLS policies, so the
 * only path in/out is the service-role client AFTER a route handler has verified
 * patient auth + Person ownership. We never store or return a public URL — reads
 * hand back a short-lived signed URL only.
 *
 * PHI safety: never log file contents, titles, or raw file names here.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import {
  PERSON_DOCUMENTS_BUCKET,
  PERSON_DOCUMENT_SIGNED_URL_TTL_SECONDS,
} from '@/lib/storage-constants'
import {
  buildPersonDocumentStorageKey,
  type AllowedDocumentMime,
} from '@/lib/storage/document-validation'

export {
  buildPersonDocumentStorageKey,
  isAllowedDocumentMime,
  sniffDocumentMime,
  storageKeyBelongsToPerson,
  validateDocumentBytes,
  type AllowedDocumentMime,
  type DocumentValidationResult,
} from '@/lib/storage/document-validation'

export type StorageResult<T> = { ok: true; value: T } | { ok: false; error: string }

export async function uploadPersonDocument(params: {
  personId: string
  bytes: Uint8Array
  mimeType: AllowedDocumentMime
}): Promise<StorageResult<{ storageKey: string; size: number }>> {
  const admin = createAdminClient()
  if (!admin) return { ok: false, error: 'storage-unavailable' }

  const storageKey = buildPersonDocumentStorageKey(params.personId, params.mimeType)
  const { error } = await admin.storage.from(PERSON_DOCUMENTS_BUCKET).upload(storageKey, params.bytes, {
    cacheControl: 'private, no-store',
    contentType: params.mimeType,
    upsert: false,
  })
  if (error) return { ok: false, error: 'upload-failed' }

  return { ok: true, value: { storageKey, size: params.bytes.byteLength } }
}

export async function signPersonDocumentUrl(
  storageKey: string,
  ttlSeconds: number = PERSON_DOCUMENT_SIGNED_URL_TTL_SECONDS
): Promise<StorageResult<{ url: string; expiresInSeconds: number }>> {
  const admin = createAdminClient()
  if (!admin) return { ok: false, error: 'storage-unavailable' }

  const { data, error } = await admin.storage
    .from(PERSON_DOCUMENTS_BUCKET)
    .createSignedUrl(storageKey, ttlSeconds)
  if (error || !data?.signedUrl) return { ok: false, error: 'sign-failed' }

  return { ok: true, value: { url: data.signedUrl, expiresInSeconds: ttlSeconds } }
}

export async function deletePersonDocument(storageKey: string): Promise<StorageResult<true>> {
  const admin = createAdminClient()
  if (!admin) return { ok: false, error: 'storage-unavailable' }

  const { error } = await admin.storage.from(PERSON_DOCUMENTS_BUCKET).remove([storageKey])
  if (error) return { ok: false, error: 'delete-failed' }
  return { ok: true, value: true }
}
