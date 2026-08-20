import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HealthRecordError } from '@/lib/client-marketplace/health-records/errors'

const tx = {
  personMedication: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  personAllergy: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  personDocument: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}

vi.mock('@/lib/passport/person-db', () => ({
  withPersonDb: vi.fn(async (_personId: string, fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
}))

const uploadPersonDocument = vi.fn()
const signPersonDocumentUrl = vi.fn()
const deletePersonDocument = vi.fn()

vi.mock('@/lib/storage/documents-storage', () => ({
  validateDocumentBytes: (bytes: Uint8Array, declaredMime: string) => {
    if (bytes.byteLength === 0) return { ok: false as const, code: 'EMPTY' as const }
    return { ok: true as const, mimeType: declaredMime, size: bytes.byteLength }
  },
  uploadPersonDocument: (...args: unknown[]) => uploadPersonDocument(...args),
  signPersonDocumentUrl: (...args: unknown[]) => signPersonDocumentUrl(...args),
  deletePersonDocument: (...args: unknown[]) => deletePersonDocument(...args),
  storageKeyBelongsToPerson: (key: string, personId: string) =>
    Boolean(personId) && key.startsWith(`persons/${personId}/documents/`) && !key.includes('..'),
}))

import {
  createMedication,
  deleteMedication,
  getMedication,
  listMedications,
  updateMedication,
} from '@/lib/client-marketplace/health-records/medications'
import { deleteAllergy, updateAllergy } from '@/lib/client-marketplace/health-records/allergies'
import {
  createDocument,
  deleteDocument,
  getDocumentSignedUrl,
} from '@/lib/client-marketplace/health-records/documents'

const now = new Date('2026-08-20T10:00:00.000Z')

function medRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'med-1',
    name: 'Metformin',
    strength: '500 mg',
    form: null,
    frequency: '2x',
    startDate: null,
    endDate: null,
    stoppedAt: null,
    instructions: null,
    notes: null,
    status: 'ACTIVE',
    sourceType: 'PATIENT_ENTERED',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

describe('medication ownership + provenance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('scopes list queries to the session personId', async () => {
    tx.personMedication.findMany.mockResolvedValue([])
    await listMedications('person-A')
    expect(tx.personMedication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ personId: 'person-A', deletedAt: null }),
      })
    )
  })

  it('denies cross-person reads (record not in this person scope)', async () => {
    tx.personMedication.findFirst.mockResolvedValue(null)
    await expect(getMedication('person-B', 'med-1')).rejects.toMatchObject({ code: 'not_found' })
    expect(tx.personMedication.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'med-1', personId: 'person-B' }),
      })
    )
  })

  it('creates patient-entered rows only', async () => {
    tx.personMedication.create.mockResolvedValue(medRow())
    await createMedication('person-A', 'client-1', { name: 'Metformin' } as never)
    expect(tx.personMedication.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          personId: 'person-A',
          createdByClientUserId: 'client-1',
          sourceType: 'PATIENT_ENTERED',
          name: 'Metformin',
        }),
      })
    )
  })

  it('rejects edits to clinic-entered medications', async () => {
    tx.personMedication.findFirst.mockResolvedValue({ id: 'med-1', sourceType: 'CLINIC_ENTERED' })
    await expect(updateMedication('person-A', 'med-1', { name: 'X' })).rejects.toBeInstanceOf(HealthRecordError)
    await expect(updateMedication('person-A', 'med-1', { name: 'X' })).rejects.toMatchObject({
      code: 'not_editable',
    })
    expect(tx.personMedication.update).not.toHaveBeenCalled()
  })

  it('soft-deletes patient-entered medications', async () => {
    tx.personMedication.findFirst.mockResolvedValue({ id: 'med-1', sourceType: 'PATIENT_ENTERED' })
    tx.personMedication.update.mockResolvedValue(medRow())
    await deleteMedication('person-A', 'med-1')
    expect(tx.personMedication.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'med-1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    )
  })
})

describe('allergy source-type edit rules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects delete of a clinic-entered allergy', async () => {
    tx.personAllergy.findFirst.mockResolvedValue({ id: 'alg-1', sourceType: 'CLINIC_ENTERED' })
    await expect(deleteAllergy('person-A', 'alg-1')).rejects.toMatchObject({ code: 'not_editable' })
    expect(tx.personAllergy.update).not.toHaveBeenCalled()
  })

  it('rejects update of a provider-entered allergy', async () => {
    tx.personAllergy.findFirst.mockResolvedValue({ id: 'alg-1', sourceType: 'PROVIDER_ENTERED' })
    await expect(updateAllergy('person-A', 'alg-1', { name: 'X' })).rejects.toMatchObject({
      code: 'not_editable',
    })
  })
})

describe('document signed URL + delete cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('refuses to sign a key that does not belong to the person', async () => {
    tx.personDocument.findFirst.mockResolvedValue({
      storageKey: 'persons/person-OTHER/documents/abc.pdf',
      mimeType: 'application/pdf',
    })
    await expect(getDocumentSignedUrl('person-A', 'doc-1')).rejects.toMatchObject({ code: 'not_found' })
    expect(signPersonDocumentUrl).not.toHaveBeenCalled()
  })

  it('returns a short-lived signed URL after ownership is verified', async () => {
    tx.personDocument.findFirst.mockResolvedValue({
      storageKey: 'persons/person-A/documents/abc.pdf',
      mimeType: 'application/pdf',
    })
    signPersonDocumentUrl.mockResolvedValue({
      ok: true,
      value: { url: 'https://signed.example/tmp', expiresInSeconds: 300 },
    })
    const result = await getDocumentSignedUrl('person-A', 'doc-1')
    expect(result.expiresInSeconds).toBe(300)
    expect(result.url).toContain('https://')
    expect(signPersonDocumentUrl).toHaveBeenCalledWith('persons/person-A/documents/abc.pdf')
  })

  it('deletes the storage object after removing a patient-entered document', async () => {
    tx.personDocument.findFirst.mockResolvedValue({
      id: 'doc-1',
      sourceType: 'PATIENT_ENTERED',
      storageKey: 'persons/person-A/documents/abc.pdf',
    })
    tx.personDocument.delete.mockResolvedValue({})
    deletePersonDocument.mockResolvedValue({ ok: true, value: true })
    await deleteDocument('person-A', 'doc-1')
    expect(tx.personDocument.delete).toHaveBeenCalledWith({ where: { id: 'doc-1' } })
    expect(deletePersonDocument).toHaveBeenCalledWith('persons/person-A/documents/abc.pdf')
  })

  it('compensates by deleting the uploaded object if the DB insert fails', async () => {
    uploadPersonDocument.mockResolvedValue({
      ok: true,
      value: { storageKey: 'persons/person-A/documents/new.pdf', size: 12 },
    })
    tx.personDocument.create.mockRejectedValue(new Error('db'))
    deletePersonDocument.mockResolvedValue({ ok: true, value: true })
    await expect(
      createDocument('person-A', 'client-1', {
        bytes: new Uint8Array([1, 2, 3]),
        declaredMime: 'application/pdf',
        metadata: { title: 'Lab' } as never,
      })
    ).rejects.toThrow()
    expect(deletePersonDocument).toHaveBeenCalledWith('persons/person-A/documents/new.pdf')
  })
})
