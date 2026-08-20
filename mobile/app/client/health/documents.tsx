import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Alert, Linking, Modal, Platform, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import {
  AppButton,
  AppCard,
  AppInput,
  AppText,
  Badge,
  EmptyState,
  Screen,
  ScreenHeader,
  Skeleton,
} from '@/components/ui'
import { useAppTheme } from '@/lib/use-app-theme'
import {
  DOCUMENT_CATEGORY_LABELS,
  deleteDocument,
  getDocumentSignedUrl,
  getDocuments,
  uploadDocument,
  type DocumentCategory,
  type DocumentDto,
} from '@/lib/health-records'

const CATEGORIES = Object.keys(DOCUMENT_CATEGORY_LABELS) as DocumentCategory[]
const ACCEPTED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE = 25 * 1024 * 1024

type PendingPick = { uri: string; name: string; type: string; size: number | null }

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function HealthDocumentsScreen() {
  const theme = useAppTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<DocumentDto[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [category, setCategory] = useState<DocumentCategory | 'ALL'>('ALL')
  const [loadingMore, setLoadingMore] = useState(false)

  const [pending, setPending] = useState<PendingPick | null>(null)
  const [title, setTitle] = useState('')
  const [docCategory, setDocCategory] = useState<DocumentCategory>('OTHER')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(
    async (cat: DocumentCategory | 'ALL', mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') setLoading(true)
      if (mode === 'refresh') setRefreshing(true)
      setError(null)
      try {
        const result = await getDocuments(cat)
        setItems(result.items)
        setNextCursor(result.nextCursor)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Belgeler yüklenemedi')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [],
  )

  useEffect(() => {
    void load(category)
  }, [load, category])

  async function loadMore() {
    if (!nextCursor) return
    setLoadingMore(true)
    try {
      const result = await getDocuments(category, nextCursor)
      setItems((prev) => [...prev, ...result.items])
      setNextCursor(result.nextCursor)
    } catch {
      Alert.alert('Yüklenemedi', 'Daha fazla belge getirilemedi.')
    } finally {
      setLoadingMore(false)
    }
  }

  function validate(pick: PendingPick): boolean {
    if (pick.type && !ACCEPTED_TYPES.has(pick.type)) {
      Alert.alert('Desteklenmeyen tür', 'PDF, JPEG, PNG veya WEBP yükleyin.')
      return false
    }
    if (pick.size && pick.size > MAX_SIZE) {
      Alert.alert('Dosya çok büyük', 'Dosya 25 MB sınırını aşıyor.')
      return false
    }
    return true
  }

  function openForm(pick: PendingPick) {
    if (!validate(pick)) return
    setPending(pick)
    setTitle(pick.name.replace(/\.[^.]+$/, ''))
    setDocCategory('OTHER')
    setNotes('')
  }

  async function pickFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Galeriye erişim izni verilmedi.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 })
    if (result.canceled || !result.assets?.[0]) return
    const a = result.assets[0]
    openForm({ uri: a.uri, name: a.fileName ?? `foto_${Date.now()}.jpg`, type: a.mimeType ?? 'image/jpeg', size: a.fileSize ?? null })
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Kamera erişim izni verilmedi.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 })
    if (result.canceled || !result.assets?.[0]) return
    const a = result.assets[0]
    openForm({ uri: a.uri, name: a.fileName ?? `belge_${Date.now()}.jpg`, type: a.mimeType ?? 'image/jpeg', size: a.fileSize ?? null })
  }

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
      copyToCacheDirectory: true,
    })
    if (result.canceled || !result.assets?.[0]) return
    const a = result.assets[0]
    openForm({ uri: a.uri, name: a.name ?? `dosya_${Date.now()}`, type: a.mimeType ?? 'application/octet-stream', size: a.size ?? null })
  }

  function promptAdd() {
    const options: Array<{ text: string; onPress?: () => void; style?: 'cancel' }> = [
      { text: 'Dosya seç', onPress: () => void pickDocument() },
      { text: 'Galeriden seç', onPress: () => void pickFromLibrary() },
    ]
    if (Platform.OS !== 'web') options.unshift({ text: 'Kamera ile çek', onPress: () => void pickFromCamera() })
    options.push({ text: 'Vazgeç', style: 'cancel' })
    Alert.alert('Belge ekle', 'Sağlık belgenizi nasıl eklemek istersiniz?', options)
  }

  async function handleSave() {
    if (!pending) return
    if (!title.trim()) {
      Alert.alert('Belge adı gerekli', 'Lütfen bir belge adı girin.')
      return
    }
    setSaving(true)
    try {
      await uploadDocument({
        file: { uri: pending.uri, name: pending.name, type: pending.type || 'application/octet-stream' },
        title: title.trim(),
        category: docCategory,
        notes: notes.trim() || null,
      })
      setPending(null)
      await load(category, 'refresh')
    } catch (e) {
      Alert.alert('Yüklenemedi', e instanceof Error ? e.message : 'Tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  async function viewDocument(doc: DocumentDto) {
    try {
      const { url } = await getDocumentSignedUrl(doc.id)
      await Linking.openURL(url)
    } catch {
      Alert.alert('Açılamadı', 'Belge açılamadı, tekrar deneyin.')
    }
  }

  function confirmDelete(doc: DocumentDto) {
    Alert.alert('Belgeyi sil', `"${doc.title}" belgesi ve dosyası kalıcı olarak silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDocument(doc.id)
            await load(category, 'refresh')
          } catch {
            Alert.alert('Silinemedi', 'Tekrar deneyin.')
          }
        },
      },
    ])
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 140, gap: theme.spacing.sm }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void load(category, 'refresh')} tintColor={theme.colors.primary} />
        }
      >
        <ScreenHeader
          title="Belgelerim"
          subtitle="Sağlık belgeleriniz özel olarak saklanır; yalnızca sizin erişiminize açıktır."
          rightSlot={
            <Pressable accessibilityRole="button" accessibilityLabel="Geri dön" onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="close" size={22} color={theme.colors.textMuted} />
            </Pressable>
          }
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
          {(['ALL', ...CATEGORIES] as const).map((c) => {
            const active = category === c
            return (
              <Pressable
                key={c}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setCategory(c)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: theme.radii.pill,
                  backgroundColor: active ? theme.colors.primary : theme.colors.surfaceSoft,
                }}
              >
                <AppText variant="caption" color={active ? '#FFFFFF' : theme.colors.textMuted}>
                  {c === 'ALL' ? 'Tümü' : DOCUMENT_CATEGORY_LABELS[c]}
                </AppText>
              </Pressable>
            )
          })}
        </ScrollView>

        {loading ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Skeleton height={72} />
            <Skeleton height={72} />
          </View>
        ) : error ? (
          <EmptyState icon="warning-outline" title="Belgeler yüklenemedi" description={error} primaryActionLabel="Yeniden dene" onPrimaryAction={() => void load(category)} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="folder-open-outline"
            title="Henüz sağlık belgesi eklenmedi"
            description="Rapor, sonuç veya diğer sağlık belgelerinizi güvenli şekilde saklayabilirsiniz."
            primaryActionLabel="Belge ekle"
            onPrimaryAction={promptAdd}
          />
        ) : (
          <>
            {items.map((doc) => (
              <AppCard key={doc.id}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: theme.radii.sm,
                      backgroundColor: theme.colors.primarySoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="document-text-outline" size={22} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText variant="caption" numberOfLines={1}>{doc.title}</AppText>
                    <AppText variant="micro" color={theme.colors.textMuted} numberOfLines={1}>
                      {[DOCUMENT_CATEGORY_LABELS[doc.category], formatSize(doc.fileSize)].join(' · ')}
                    </AppText>
                  </View>
                  {doc.source !== 'PATIENT_ENTERED' ? <Badge label="Klinik" tone="info" /> : null}
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <AppButton label="Görüntüle" variant="secondary" onPress={() => void viewDocument(doc)} style={{ flex: 1, minHeight: 40 }} />
                  {doc.editable ? (
                    <AppButton label="Sil" variant="ghost" onPress={() => confirmDelete(doc)} style={{ flex: 1, minHeight: 40 }} />
                  ) : null}
                </View>
              </AppCard>
            ))}
            {nextCursor ? (
              <AppButton label={loadingMore ? 'Yükleniyor…' : 'Daha fazla göster'} loading={loadingMore} variant="secondary" onPress={() => void loadMore()} />
            ) : null}
            <AppButton label="Belge ekle" onPress={promptAdd} style={{ marginTop: theme.spacing.sm }} />
          </>
        )}
      </ScrollView>

      <Modal visible={pending !== null} transparent animationType="slide" onRequestClose={() => setPending(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radii.xl,
              borderTopRightRadius: theme.radii.xl,
              padding: theme.spacing.lg,
              paddingBottom: theme.spacing.xxl,
              gap: theme.spacing.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <AppText variant="subtitle">Belge ayrıntıları</AppText>
              <Pressable accessibilityRole="button" onPress={() => setPending(null)} hitSlop={8}>
                <Ionicons name="close" size={22} color={theme.colors.textMuted} />
              </Pressable>
            </View>
            {pending ? (
              <AppText variant="micro" color={theme.colors.textMuted} numberOfLines={1}>
                {pending.name}
                {pending.size ? ` · ${formatSize(pending.size)}` : ''}
              </AppText>
            ) : null}
            <AppInput label="Belge adı *" value={title} onChangeText={setTitle} placeholder="Örn. Kan tahlili" />
            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="label" color={theme.colors.textMuted}>Kategori</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {CATEGORIES.map((c) => {
                  const active = c === docCategory
                  return (
                    <Pressable
                      key={c}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setDocCategory(c)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 9,
                        borderRadius: theme.radii.pill,
                        borderWidth: 1,
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                        backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                      }}
                    >
                      <AppText variant="caption" color={active ? theme.colors.primary : theme.colors.textMuted}>
                        {DOCUMENT_CATEGORY_LABELS[c]}
                      </AppText>
                    </Pressable>
                  )
                })}
              </ScrollView>
            </View>
            <AppInput label="Not (isteğe bağlı)" value={notes} onChangeText={setNotes} placeholder="Kısa bir not ekleyin" multiline />
            <AppButton label={saving ? 'Yükleniyor…' : 'Güvenli şekilde yükle'} loading={saving} onPress={() => void handleSave()} />
          </View>
        </View>
      </Modal>
    </Screen>
  )
}
