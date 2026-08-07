import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import * as FileSystem from 'expo-file-system/legacy'
import type { Ionicons } from '@expo/vector-icons'

/**
 * Local-first health document vault ("Sağlık Pasaportu — Belgelerim").
 *
 * Documents are stored ON DEVICE only:
 * - Metadata (index) lives in AsyncStorage.
 * - Files are copied into the app document directory on native platforms.
 * - On web the picked object URL / data URI is kept as-is.
 *
 * This is intentionally self-contained and does NOT sync to the backend,
 * keeping the existing "Asistan pasaportu is not a medical/FHIR record"
 * product decision intact while letting users keep their own copies.
 */

export type VaultCategoryId =
  | 'vaccine'
  | 'prescription'
  | 'lab'
  | 'imaging'
  | 'allergy'
  | 'document'

export type VaultCategory = {
  id: VaultCategoryId
  labelTr: string
  icon: keyof typeof Ionicons.glyphMap
}

export const VAULT_CATEGORIES: VaultCategory[] = [
  { id: 'vaccine', labelTr: 'Aşılar', icon: 'shield-checkmark-outline' },
  { id: 'prescription', labelTr: 'Reçeteler', icon: 'document-text-outline' },
  { id: 'lab', labelTr: 'Tahliller', icon: 'flask-outline' },
  { id: 'imaging', labelTr: 'Görüntüleme', icon: 'scan-outline' },
  { id: 'allergy', labelTr: 'Alerjiler', icon: 'alert-circle-outline' },
  { id: 'document', labelTr: 'Diğer Belgeler', icon: 'folder-outline' },
]

export function categoryLabel(id: VaultCategoryId): string {
  return VAULT_CATEGORIES.find((c) => c.id === id)?.labelTr ?? 'Belge'
}

export function categoryIcon(id: VaultCategoryId): keyof typeof Ionicons.glyphMap {
  return VAULT_CATEGORIES.find((c) => c.id === id)?.icon ?? 'document-outline'
}

export type VaultDocument = {
  id: string
  category: VaultCategoryId
  title: string
  note: string | null
  fileName: string
  mimeType: string | null
  size: number | null
  uri: string
  createdAt: string
}

export type NewVaultDocumentInput = {
  category: VaultCategoryId
  title: string
  note?: string | null
  fileName: string
  mimeType?: string | null
  size?: number | null
  uri: string
}

const STORAGE_KEY = 'asistan.passport.vault.v1'
const isNative = Platform.OS !== 'web'
const vaultDir = isNative ? `${FileSystem.documentDirectory ?? ''}passport-vault/` : ''

function makeId(): string {
  return `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

async function ensureDir(): Promise<void> {
  if (!isNative || !vaultDir) return
  try {
    const info = await FileSystem.getInfoAsync(vaultDir)
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(vaultDir, { intermediates: true })
    }
  } catch {
    // Directory creation is best-effort; addDocument falls back to source uri.
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80) || 'belge'
}

export async function listDocuments(): Promise<VaultDocument[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as VaultDocument[]
    if (!Array.isArray(parsed)) return []
    return parsed.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } catch {
    return []
  }
}

async function persist(documents: VaultDocument[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
}

export async function addDocument(input: NewVaultDocumentInput): Promise<VaultDocument> {
  const id = makeId()
  let storedUri = input.uri

  if (isNative && vaultDir) {
    await ensureDir()
    const target = `${vaultDir}${id}_${sanitizeFileName(input.fileName)}`
    try {
      await FileSystem.copyAsync({ from: input.uri, to: target })
      storedUri = target
    } catch {
      storedUri = input.uri
    }
  }

  const doc: VaultDocument = {
    id,
    category: input.category,
    title: input.title.trim() || input.fileName,
    note: input.note?.trim() ? input.note.trim() : null,
    fileName: input.fileName,
    mimeType: input.mimeType ?? null,
    size: input.size ?? null,
    uri: storedUri,
    createdAt: new Date().toISOString(),
  }

  const existing = await listDocuments()
  await persist([doc, ...existing])
  return doc
}

export async function deleteDocument(id: string): Promise<void> {
  const existing = await listDocuments()
  const target = existing.find((d) => d.id === id)
  if (target && isNative && target.uri.startsWith(vaultDir)) {
    try {
      await FileSystem.deleteAsync(target.uri, { idempotent: true })
    } catch {
      // File may already be gone; ignore.
    }
  }
  await persist(existing.filter((d) => d.id !== id))
}

export function formatFileSize(size: number | null): string {
  if (size == null || size <= 0) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
