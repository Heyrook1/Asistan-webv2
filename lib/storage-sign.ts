import 'server-only'

/**
 * Batch-sign private storage object paths. Callers must already have verified
 * ownership of every key; this helper never checks path prefixes.
 */
import { createClient } from '@/lib/supabase/server'

export async function batchSignStorageKeys(
  bucket: string,
  storageKeys: string[],
  ttlSeconds: number
): Promise<Map<string, string>> {
  if (storageKeys.length === 0) return new Map()
  const supabase = await createClient()
  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(storageKeys, ttlSeconds)
  if (error || !data) return new Map()
  const result = new Map<string, string>()
  for (const item of data) {
    if (item.path && !item.error && item.signedUrl) {
      result.set(item.path, item.signedUrl)
    }
  }
  return result
}
