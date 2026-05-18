/**
 * File upload helpers.
 *
 * TODO Supabase Storage / S3 integration:
 *   - Create a bucket (e.g. "patient-files") with RLS limiting access to
 *     authenticated users from the owning business.
 *   - Replace `uploadPatientFile` below with a Supabase signed-upload call:
 *
 *     const supabase = createClient()
 *     const { data, error } = await supabase.storage
 *       .from('patient-files')
 *       .upload(`${businessId}/${patientId}/${crypto.randomUUID()}-${file.name}`, file)
 *
 *   - After upload, get a signed URL valid for ~1 hour and pass
 *     { storageKey: data.path, fileUrl: signed.signedUrl } to addPatientFile.
 *
 * Until then we fall back to a base64 data URL so the UI is fully usable
 * end-to-end without an external bucket. The Prisma row is still real.
 */

export type UploadedFileMeta = {
  fileName: string
  fileType: string
  fileSize: number
  storageKey: string
  fileUrl: string
}

export async function uploadPatientFile(
  file: File,
  options: { businessId: string; patientId: string }
): Promise<UploadedFileMeta> {
  // Reject anything larger than 8 MB for the local data-url fallback.
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Dosya 8 MB sınırını aşıyor. Supabase Storage entegrasyonu eklenmeli.')
  }
  const buf = await file.arrayBuffer()
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
  const dataUrl = `data:${file.type || 'application/octet-stream'};base64,${base64}`
  const storageKey = `${options.businessId}/${options.patientId}/${crypto.randomUUID()}-${file.name}`
  return {
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
    storageKey,
    fileUrl: dataUrl,
  }
}
