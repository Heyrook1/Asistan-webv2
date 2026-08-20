import { describe, expect, it } from 'vitest'

import {
  buildPersonDocumentStorageKey,
  isAllowedDocumentMime,
  sniffDocumentMime,
  storageKeyBelongsToPerson,
  validateDocumentBytes,
} from '@/lib/storage/document-validation'

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])
const WEBP = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50])
const EXE = new Uint8Array([0x4d, 0x5a, 0x90, 0x00])

describe('sniffDocumentMime', () => {
  it('detects each allowed type from magic bytes', () => {
    expect(sniffDocumentMime(PDF)).toBe('application/pdf')
    expect(sniffDocumentMime(JPEG)).toBe('image/jpeg')
    expect(sniffDocumentMime(PNG)).toBe('image/png')
    expect(sniffDocumentMime(WEBP)).toBe('image/webp')
  })

  it('returns null for unknown signatures', () => {
    expect(sniffDocumentMime(EXE)).toBeNull()
    expect(sniffDocumentMime(new Uint8Array([]))).toBeNull()
  })
})

describe('isAllowedDocumentMime', () => {
  it('allow-lists only the four supported types', () => {
    expect(isAllowedDocumentMime('application/pdf')).toBe(true)
    expect(isAllowedDocumentMime('image/gif')).toBe(false)
    expect(isAllowedDocumentMime('application/x-msdownload')).toBe(false)
  })
})

describe('validateDocumentBytes', () => {
  it('accepts a genuine PDF declared as pdf', () => {
    const result = validateDocumentBytes(PDF, 'application/pdf')
    expect(result).toEqual({ ok: true, mimeType: 'application/pdf', size: PDF.byteLength })
  })

  it('tolerates a charset suffix on the declared MIME', () => {
    const result = validateDocumentBytes(JPEG, 'image/jpeg; charset=binary')
    expect(result.ok).toBe(true)
  })

  it('rejects an empty file', () => {
    expect(validateDocumentBytes(new Uint8Array([]), 'application/pdf')).toEqual({ ok: false, code: 'EMPTY' })
  })

  it('rejects an oversized file', () => {
    const big = new Uint8Array(26 * 1024 * 1024)
    big.set(PDF, 0)
    expect(validateDocumentBytes(big, 'application/pdf')).toEqual({ ok: false, code: 'TOO_LARGE' })
  })

  it('rejects a disallowed declared type', () => {
    expect(validateDocumentBytes(PDF, 'application/zip')).toEqual({ ok: false, code: 'UNSUPPORTED_TYPE' })
  })

  it('rejects an executable disguised as a PDF (signature mismatch)', () => {
    expect(validateDocumentBytes(EXE, 'application/pdf')).toEqual({ ok: false, code: 'SIGNATURE_MISMATCH' })
  })

  it('rejects a real PNG declared as PDF (declared/sniffed disagree)', () => {
    expect(validateDocumentBytes(PNG, 'application/pdf')).toEqual({ ok: false, code: 'SIGNATURE_MISMATCH' })
  })
})

describe('storage keys', () => {
  it('builds an opaque key under persons/{id}/documents with the right extension', () => {
    const key = buildPersonDocumentStorageKey('person-123', 'image/png')
    expect(key.startsWith('persons/person-123/documents/')).toBe(true)
    expect(key.endsWith('.png')).toBe(true)
    expect(key).not.toContain(' ')
  })

  it('does not embed a predictable/original filename', () => {
    const key = buildPersonDocumentStorageKey('person-123', 'application/pdf')
    const tail = key.slice('persons/person-123/documents/'.length)
    expect(tail).toMatch(/^[0-9a-f-]{36}\.pdf$/)
  })

  it('confirms ownership by path prefix and blocks cross-person keys', () => {
    const key = buildPersonDocumentStorageKey('person-A', 'image/jpeg')
    expect(storageKeyBelongsToPerson(key, 'person-A')).toBe(true)
    expect(storageKeyBelongsToPerson(key, 'person-B')).toBe(false)
  })

  it('rejects path traversal and empty person ids', () => {
    expect(storageKeyBelongsToPerson('persons/person-A/documents/../other.pdf', 'person-A')).toBe(false)
    expect(storageKeyBelongsToPerson('persons/person-A/documents/x.pdf', '')).toBe(false)
  })
})
