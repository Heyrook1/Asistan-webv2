import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Alert, Modal, Pressable, RefreshControl, ScrollView, View } from 'react-native'
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
  ALLERGY_SEVERITY_LABELS,
  createAllergy,
  deleteAllergy,
  getAllergies,
  type AllergyDto,
  type AllergySeverity,
} from '@/lib/health-records'

const SEVERITIES: AllergySeverity[] = ['MILD', 'MODERATE', 'SEVERE', 'UNKNOWN']

function severityTone(s: AllergySeverity): 'success' | 'warning' | 'danger' | 'info' {
  if (s === 'SEVERE') return 'danger'
  if (s === 'MODERATE') return 'warning'
  if (s === 'MILD') return 'success'
  return 'info'
}

export default function AllergiesScreen() {
  const theme = useAppTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<AllergyDto[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [reaction, setReaction] = useState('')
  const [severity, setSeverity] = useState<AllergySeverity>('UNKNOWN')
  const [notes, setNotes] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true)
    if (mode === 'refresh') setRefreshing(true)
    setError(null)
    try {
      setItems(await getAllergies())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Alerjiler yüklenemedi')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function openAdd() {
    setName('')
    setReaction('')
    setSeverity('UNKNOWN')
    setNotes('')
    setNameError(null)
    setFormOpen(true)
  }

  async function handleSave() {
    if (!name.trim()) {
      setNameError('Alerji adı zorunludur')
      return
    }
    setSaving(true)
    try {
      await createAllergy({
        name: name.trim(),
        reaction: reaction.trim() || null,
        severity,
        notes: notes.trim() || null,
      })
      setFormOpen(false)
      await load('refresh')
    } catch (e) {
      Alert.alert('Kaydedilemedi', e instanceof Error ? e.message : 'Tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  function confirmDelete(a: AllergyDto) {
    Alert.alert('Alerji kaydını sil', `"${a.name}" kaydı kalıcı olarak silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAllergy(a.id)
            await load('refresh')
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
          <RefreshControl refreshing={refreshing} onRefresh={() => void load('refresh')} tintColor={theme.colors.primary} />
        }
      >
        <ScreenHeader
          title="Alerjilerim"
          subtitle="Bilinen alerji ve hassasiyetlerinizi kaydedin."
          rightSlot={
            <Pressable accessibilityRole="button" accessibilityLabel="Geri dön" onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="close" size={22} color={theme.colors.textMuted} />
            </Pressable>
          }
        />

        {loading ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Skeleton height={64} />
            <Skeleton height={64} />
          </View>
        ) : error ? (
          <EmptyState icon="warning-outline" title="Alerjiler yüklenemedi" description={error} primaryActionLabel="Yeniden dene" onPrimaryAction={() => void load()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="shield-outline"
            title="Kayıtlı alerji bulunmuyor"
            description="Bilinen bir alerjiniz veya hassasiyetiniz varsa Pasaportunuza ekleyebilirsiniz."
            primaryActionLabel="Alerji ekle"
            onPrimaryAction={openAdd}
          />
        ) : (
          <>
            {items.map((a) => (
              <AppCard key={a.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText variant="caption">{a.name}</AppText>
                    <AppText variant="micro" color={theme.colors.textMuted}>
                      {a.reaction || 'Reaksiyon belirtilmedi'}
                    </AppText>
                  </View>
                  <Badge label={ALLERGY_SEVERITY_LABELS[a.severity]} tone={severityTone(a.severity)} />
                </View>
                {a.editable ? (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    <AppButton label="Sil" variant="ghost" onPress={() => confirmDelete(a)} style={{ flex: 1, minHeight: 40 }} />
                  </View>
                ) : (
                  <AppText variant="micro" color={theme.colors.textMuted} style={{ marginTop: 8 }}>
                    Klinik tarafından eklendi · yalnızca görüntülenebilir
                  </AppText>
                )}
              </AppCard>
            ))}
            <AppButton label="Alerji ekle" onPress={openAdd} style={{ marginTop: theme.spacing.sm }} />
          </>
        )}
      </ScrollView>

      <Modal visible={formOpen} transparent animationType="slide" onRequestClose={() => setFormOpen(false)}>
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
              <AppText variant="subtitle">Alerji ekle</AppText>
              <Pressable accessibilityRole="button" onPress={() => setFormOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={theme.colors.textMuted} />
              </Pressable>
            </View>
            <AppInput label="Alerji / hassasiyet *" value={name} onChangeText={(v) => { setName(v); if (nameError) setNameError(null) }} error={nameError} placeholder="Örn. Penisilin" />
            <AppInput label="Reaksiyon" value={reaction} onChangeText={setReaction} placeholder="Örn. Döküntü" />
            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="label" color={theme.colors.textMuted}>Şiddet</AppText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SEVERITIES.map((s) => {
                  const active = severity === s
                  return (
                    <Pressable
                      key={s}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setSeverity(s)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 9,
                        borderRadius: theme.radii.pill,
                        borderWidth: 1,
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                        backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface,
                      }}
                    >
                      <AppText variant="caption" color={active ? theme.colors.primary : theme.colors.textMuted}>
                        {ALLERGY_SEVERITY_LABELS[s]}
                      </AppText>
                    </Pressable>
                  )
                })}
              </View>
            </View>
            <AppInput label="Not" value={notes} onChangeText={setNotes} placeholder="Kısa bir not ekleyin" multiline />
            <AppButton label={saving ? 'Kaydediliyor…' : 'Kaydet'} loading={saving} onPress={() => void handleSave()} />
          </View>
        </View>
      </Modal>
    </Screen>
  )
}
