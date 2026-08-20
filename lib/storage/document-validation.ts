/**
 * Pure (no server-only, no Supabase) validation + storage-key helpers for
 * patient documents. Kept separate so they can be unit-tested without env/admin.
 */
import { PERSON_DOCUMENT_MAX_SIZE_BYTES } from '@/lib/storage-constants'

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const
export type AllowedDocumentMime = (typeof ALLOWED_MIME_TYPES)[number]

export function isAllowedDocumentMime(value: string): value is AllowedDocumentMime {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(value)
}

/**
 * Sniff the real MIME from the file's leading bytes so a renamed `.pdf` that is
 * actually an executable is rejected. Returns null when nothing matches.
 */
export function sniffDocumentMime(bytes: Uint8Array): AllowedDocumentMime | null {
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'application/pdf' // %PDF
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png'
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp'
  }
  return null
}

export type DocumentValidationResult =
  | { ok: true; mimeType: AllowedDocumentMime; size: number }
  | { ok: false; code: 'EMPTY' | 'TOO_LARGE' | 'UNSUPPORTED_TYPE' | 'SIGNATURE_MISMATCH' }

/** Authoritative server-side validation: size + declared MIME + magic bytes. */
export function validateDocumentBytes(bytes: Uint8Array, declaredMime: string): DocumentValidationResult {
  const size = bytes.byteLength
  if (size === 0) return { ok: false, code: 'EMPTY' }
  if (size > PERSON_DOCUMENT_MAX_SIZE_BYTES) return { ok: false, code: 'TOO_LARGE' }

  const normalizedDeclared = declaredMime.split(';')[0]?.trim().toLowerCase() ?? ''
  if (!isAllowedDocumentMime(normalizedDeclared)) return { ok: false, code: 'UNSUPPORTED_TYPE' }

  const sniffed = sniffDocumentMime(bytes)
  if (!sniffed) return { ok: false, code: 'SIGNATURE_MISMATCH' }
  if (sniffed !== normalizedDeclared) return { ok: false, code: 'SIGNATURE_MISMATCH' }

  return { ok: true, mimeType: sniffed, size }
}

const EXTENSION_BY_MIME: Record<AllowedDocumentMime, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/**
 * Opaque, unguessable object path under `persons/{personId}/documents/`.
 * We deliberately do NOT embed the original file name (avoid leaking PHI).
 */
export function buildPersonDocumentStorageKey(personId: string, mimeType: AllowedDocumentMime): string {
  return `persons/${personId}/documents/${crypto.randomUUID()}.${EXTENSION_BY_MIME[mimeType]}`
}

/** Guard: a stored key must live under the owner's person prefix (no traversal). */
export function storageKeyBelongsToPerson(storageKey: string, personId: string): boolean {
  if (!personId || storageKey.includes('..') || storageKey.includes('\\')) return false
  return storageKey.startsWith(`persons/${personId}/documents/`)
}
