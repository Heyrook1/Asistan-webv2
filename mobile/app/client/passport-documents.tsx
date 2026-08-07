import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import * as Sharing from 'expo-sharing'
import {
  AppButton,
  AppCard,
  AppInput,
  AppText,
  Badge,
  FadeInView,
  EmptyState,
  Screen,
  ScreenHeader,
  Skeleton,
} from '@/components/ui'
import { useAppTheme } from '@/lib/use-app-theme'
import {
  VAULT_CATEGORIES,
  addDocument,
  categoryIcon,
  categoryLabel,
  deleteDocument,
  formatFileSize,
  listDocuments,
  type NewVaultDocumentInput,
  type VaultCategoryId,
  type VaultDocument,
} from '@/lib/passport-vault'

type PendingPick = {
  fileName: string
  mimeType: string | null
  size: number | null
  uri: string
}

function isImage(doc: { mimeType: string | null; fileName: string }): boolean {
  if (doc.mimeType?.startsWith('image/')) return true
  return /\.(png|jpe?g|gif|webp|heic|bmp)$/i.test(doc.fileName)
}

export default function PassportDocumentsScreen() {
  const theme = useAppTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [documents, setDocuments] = useState<VaultDocument[]>([])
  const [saving, setSaving] = useState(false)

  const [pending, setPending] = useState<PendingPick | null>(null)
  const [category, setCategory] = useState<VaultCategoryId>('document')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true)
    if (mode === 'refresh') setRefreshing(true)
    try {
      setDocuments(await listDocuments())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const grouped = useMemo(() => {
    return VAULT_CATEGORIES.map((cat) => ({
      ...cat,
      items: documents.filter((d) => d.category === cat.id),
    })).filter((group) => group.items.length > 0)
  }, [documents])

  function openForm(pick: PendingPick) {
    setPending(pick)
    setTitle(pick.fileName.replace(/\.[^.]+$/, ''))
    setNote('')
    setCategory('document')
  }

  async function pickFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Galeriye erişim izni verilmedi.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    })
    if (result.canceled || !result.assets?.[0]) return
    const asset = result.assets[0]
    openForm({
      fileName: asset.fileName ?? `foto_${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize ?? null,
      uri: asset.uri,
    })
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      Alert.alert('İzin gerekli', 'Kamera erişim izni verilmedi.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 })
    if (result.canceled || !result.assets?.[0]) return
    const asset = result.assets[0]
    openForm({
      fileName: asset.fileName ?? `belge_${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize ?? null,
      uri: asset.uri,
    })
  }

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    })
    if (result.canceled || !result.assets?.[0]) return
    const asset = result.assets[0]
    openForm({
      fileName: asset.name ?? `dosya_${Date.now()}`,
      mimeType: asset.mimeType ?? null,
      size: asset.size ?? null,
      uri: asset.uri,
    })
  }

  function promptAdd() {
    const options: Array<{ text: string; onPress?: () => void; style?: 'cancel' }> = [
      { text: 'Dosya seç', onPress: () => void pickDocument() },
      { text: 'Galeriden seç', onPress: () => void pickFromLibrary() },
    ]
    if (Platform.OS !== 'web') {
      options.unshift({ text: 'Kamera ile çek', onPress: () => void pickFromCamera() })
    }
    options.push({ text: 'Vazgeç', style: 'cancel' })
    Alert.alert('Belge ekle', 'Sağlık belgenizi nasıl eklemek istersiniz?', options)
  }

  async function handleSave() {
    if (!pending) return
    setSaving(true)
    try {
      const input: NewVaultDocumentInput = {
        category,
        title,
        note,
        fileName: pending.fileName,
        mimeType: pending.mimeType,
        size: pending.size,
        uri: pending.uri,
      }
      await addDocument(input)
      setPending(null)
      await load('refresh')
    } catch {
      Alert.alert('Kaydedilemedi', 'Belge kaydedilirken bir sorun oluştu. Tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  function confirmDelete(doc: VaultDocument) {
    Alert.alert('Belgeyi sil', `"${doc.title}" belgesi cihazınızdan kalıcı olarak silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await deleteDocument(doc.id)
          await load('refresh')
        },
      },
    ])
  }

  async function shareDocument(doc: VaultDocument) {
    try {
      const available = await Sharing.isAvailableAsync()
      if (!available) {
        Alert.alert('Paylaşım kullanılamıyor', 'Bu cihazda paylaşım desteklenmiyor.')
        return
      }
      await Sharing.shareAsync(doc.uri, {
        mimeType: doc.mimeType ?? undefined,
        dialogTitle: doc.title,
      })
    } catch {
      Alert.alert('Paylaşılamadı', 'Belge paylaşılırken bir sorun oluştu.')
    }
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 140, gap: theme.spacing.sm }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load('refresh')}
            tintColor={theme.colors.primary}
          />
        }
      >
        <ScreenHeader
          title="Belgelerim"
          subtitle="Sağlık belgelerinizi cihazınızda güvenle saklayın ve kontrol edin."
          rightSlot={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Geri dön"
              onPress={() => router.back()}
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color={theme.colors.textMuted} />
            </Pressable>
          }
        />

        <AppCard style={{ backgroundColor: theme.colors.surfaceSoft, flexDirection: 'row', gap: 10 }}>
          <Ionicons name="lock-closed-outline" size={18} color={theme.colors.primary} />
          <AppText variant="caption" color={theme.colors.textMuted} style={{ flex: 1 }}>
            Belgeler yalnızca bu cihazda saklanır. İstediğinizde paylaşabilir veya silebilirsiniz.
          </AppText>
        </AppCard>

        {loading ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Skeleton height={72} />
            <Skeleton height={72} />
            <Skeleton height={72} />
          </View>
        ) : documents.length === 0 ? (
          <EmptyState
            icon="folder-open-outline"
            title="Henüz belge yok"
            description="Aşı kartı, reçete, tahlil veya görüntüleme sonuçlarınızı ekleyerek pasaportunuzu oluşturun."
            primaryActionLabel="Belge ekle"
            onPrimaryAction={promptAdd}
          />
        ) : (
          grouped.map((group, groupIndex) => (
            <FadeInView key={group.id} delay={groupIndex * 80}>
            <View style={{ gap: theme.spacing.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <Ionicons name={group.icon} size={16} color={theme.colors.primary} />
                <AppText variant="subtitle">{group.labelTr}</AppText>
                <Badge label={String(group.items.length)} tone="info" />
              </View>
              {group.items.map((doc) => (
                <AppCard key={doc.id}>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    {isImage(doc) ? (
                      <Image
                        source={{ uri: doc.uri }}
                        style={{ width: 48, height: 48, borderRadius: theme.radii.sm }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: theme.radii.sm,
                          backgroundColor: theme.colors.primarySoft,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name={categoryIcon(doc.category)} size={22} color={theme.colors.primary} />
                      </View>
                    )}
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText variant="caption" numberOfLines={1}>
                        {doc.title}
                      </AppText>
                      <AppText variant="micro" color={theme.colors.textMuted} numberOfLines={1}>
                        {[
                          categoryLabel(doc.category),
                          formatFileSize(doc.size),
                          new Date(doc.createdAt).toLocaleDateString('tr-TR'),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </AppText>
                      {doc.note ? (
                        <AppText variant="micro" color={theme.colors.textMuted} numberOfLines={2}>
                          {doc.note}
                        </AppText>
                      ) : null}
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    <AppButton
                      label="Paylaş"
                      variant="secondary"
                      onPress={() => void shareDocument(doc)}
                      style={{ flex: 1, minHeight: 40 }}
                    />
                    <AppButton
                      label="Sil"
                      variant="ghost"
                      onPress={() => confirmDelete(doc)}
                      style={{ flex: 1, minHeight: 40 }}
                    />
                  </View>
                </AppCard>
              ))}
            </View>
            </FadeInView>
          ))
        )}

        {documents.length > 0 ? (
          <AppButton label="Belge ekle" onPress={promptAdd} style={{ marginTop: theme.spacing.sm }} />
        ) : null}
      </ScrollView>

      <Modal
        visible={pending !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPending(null)}
      >
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
                {pending.fileName} · {formatFileSize(pending.size)}
              </AppText>
            ) : null}

            <AppInput
              label="Başlık"
              value={title}
              onChangeText={setTitle}
              placeholder="Örn. Tetanoz aşısı"
            />

            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Kategori
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {VAULT_CATEGORIES.map((cat) => {
                  const active = cat.id === category
                  return (
                    <Pressable
                      key={cat.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setCategory(cat.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 9,
                        borderRadius: theme.radii.pill,
                        borderWidth: 1,
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                        backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                      }}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={14}
                        color={active ? theme.colors.primary : theme.colors.textMuted}
                      />
                      <AppText
                        variant="caption"
                        color={active ? theme.colors.primary : theme.colors.textMuted}
                      >
                        {cat.labelTr}
                      </AppText>
                    </Pressable>
                  )
                })}
              </ScrollView>
            </View>

            <AppInput
              label="Not (isteğe bağlı)"
              value={note}
              onChangeText={setNote}
              placeholder="Kısa bir not ekleyin"
              multiline
            />

            <AppButton
              label={saving ? 'Kaydediliyor…' : 'Kaydet'}
              loading={saving}
              onPress={() => void handleSave()}
            />
            {saving ? <ActivityIndicator color={theme.colors.primary} /> : null}
          </View>
        </View>
      </Modal>
    </Screen>
  )
}