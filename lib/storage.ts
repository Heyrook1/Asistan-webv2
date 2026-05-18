import { createClient } from '@/lib/supabase/client'
import { PATIENT_FILES_BUCKET } from '@/lib/storage-constants'

const MAX_PATIENT_FILE_SIZE = 25 * 1024 * 1024

export type UploadedFileMeta = {
  fileName: string
  fileType: string
  fileSize: number
  storageKey: string
  fileUrl: string
}

function sanitizeFileName(name: string) {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140)

  return cleaned || 'patient-file'
}

export async function uploadPatientFile(
  file: File,
  options: { businessId: string; patientId: string }
): Promise<UploadedFileMeta> {
  if (!file.size) throw new Error('Boş dosya yüklenemez')
  if (file.size > MAX_PATIENT_FILE_SIZE) throw new Error('Dosya 25 MB sınırını aşıyor')

  const supabase = createClient()
  const safeName = sanitizeFileName(file.name)
  const storageKey = `${options.businessId}/${options.patientId}/${crypto.randomUUID()}-${safeName}`

  const { error } = await supabase.storage
    .from(PATIENT_FILES_BUCKET)
    .upload(storageKey, file, {
      cacheControl: '3600',
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (error) throw new Error(error.message)

  return {
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
    storageKey,
    fileUrl: `storage://${PATIENT_FILES_BUCKET}/${storageKey}`,
  }
}
