import 'server-only'

/**
 * Plan-specified import path. Implementation lives in lib/storage (no Prisma,
 * testable validation split) and is re-exported here so health-record callers
 * can import from this module.
 */
export {
  uploadPersonDocument,
  signPersonDocumentUrl,
  signPersonDocumentUrl as signPersonDocument,
  deletePersonDocument,
  buildPersonDocumentStorageKey,
  isAllowedDocumentMime,
  sniffDocumentMime,
  storageKeyBelongsToPerson,
  validateDocumentBytes,
  type AllowedDocumentMime,
  type DocumentValidationResult,
  type StorageResult,
} from '@/lib/storage/documents-storage'
