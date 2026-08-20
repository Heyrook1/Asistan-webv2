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
  MEDICATION_STATUS_LABELS,
  createMedication,
  deleteMedication,
  getMedications,
  stopMedication,
  type MedicationDto,
} from '@/lib/health-records'

export default function MedicationsScreen() {
  const theme = useAppTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{ active: MedicationDto[]; previous: MedicationDto[] }>({ active: [], previous: [] })
  const [tab, setTab] = useState<'active' | 'previous'>('active')

  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [strength, setStrength] = useState('')
  const [frequency, setFrequency] = useState('')
  const [notes, setNotes] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true)
    if (mode === 'refresh') setRefreshing(true)
    setError(null)
    try {
      setData(await getMedications())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'İlaçlar yüklenemedi')
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
    setStrength('')
    setFrequency('')
    setNotes('')
    setNameError(null)
    setFormOpen(true)
  }

  async function handleSave() {
    if (!name.trim()) {
      setNameError('İlaç adı zorunludur')
      return
    }
    setSaving(true)
    try {
      await createMedication({
        name: name.trim(),
        strength: strength.trim() || null,
        frequency: frequency.trim() || null,
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

  function confirmStop(m: MedicationDto) {
    Alert.alert('İlacı sonlandır', `"${m.name}" ilacını sonlandırıldı olarak işaretlemek istiyor musunuz?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sonlandır',
        onPress: async () => {
          try {
            await stopMedication(m.id)
            await load('refresh')
          } catch {
            Alert.alert('İşlem tamamlanamadı', 'Tekrar deneyin.')
          }
        },
      },
    ])
  }

  function confirmDelete(m: MedicationDto) {
    Alert.alert('İlaç kaydını sil', `"${m.name}" kaydı kalıcı olarak silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMedication(m.id)
            await load('refresh')
          } catch {
            Alert.alert('Silinemedi', 'Tekrar deneyin.')
          }
        },
      },
    ])
  }

  const list = tab === 'active' ? data.active : data.previous

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 140, gap: theme.spacing.sm }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void load('refresh')} tintColor={theme.colors.primary} />
        }
      >
        <ScreenHeader
          title="İlaçlarım"
          subtitle="Kullandığınız ilaçları güvenle kaydedin. Bu alan reçeteleme aracı değildir."
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
          <EmptyState icon="warning-outline" title="İlaçlar yüklenemedi" description={error} primaryActionLabel="Yeniden dene" onPrimaryAction={() => void load()} />
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['active', 'previous'] as const).map((key) => (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: tab === key }}
                  onPress={() => setTab(key)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: theme.radii.pill,
                    alignItems: 'center',
                    backgroundColor: tab === key ? theme.colors.primary : theme.colors.surfaceSoft,
                  }}
                >
                  <AppText variant="caption" color={tab === key ? '#FFFFFF' : theme.colors.textMuted}>
                    {key === 'active' ? `Aktif (${data.active.length})` : `Önceki (${data.previous.length})`}
                  </AppText>
                </Pressable>
              ))}
            </View>

            {list.length === 0 ? (
              <EmptyState
                icon="medkit-outline"
                title={tab === 'active' ? 'Aktif ilaç kaydınız yok' : 'Önceki ilaç kaydı yok'}
                description="Kullandığınız bir ilacı Pasaportunuza ekleyebilirsiniz."
                primaryActionLabel={tab === 'active' ? 'İlaç ekle' : undefined}
                onPrimaryAction={tab === 'active' ? openAdd : undefined}
              />
            ) : (
              list.map((m) => (
                <AppCard key={m.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText variant="caption">
                        {m.name}
                        {m.strength ? ` · ${m.strength}` : ''}
                      </AppText>
                      <AppText variant="micro" color={theme.colors.textMuted}>
                        {[m.frequency, MEDICATION_STATUS_LABELS[m.status]].filter(Boolean).join(' · ')}
                      </AppText>
                    </View>
                    <Badge label={MEDICATION_STATUS_LABELS[m.status]} tone={m.status === 'ACTIVE' ? 'success' : 'info'} />
                  </View>
                  {m.editable ? (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                      {m.status === 'ACTIVE' ? (
                        <AppButton label="Sonlandır" variant="secondary" onPress={() => confirmStop(m)} style={{ flex: 1, minHeight: 40 }} />
                      ) : null}
                      <AppButton label="Sil" variant="ghost" onPress={() => confirmDelete(m)} style={{ flex: 1, minHeight: 40 }} />
                    </View>
                  ) : (
                    <AppText variant="micro" color={theme.colors.textMuted} style={{ marginTop: 8 }}>
                      Klinik tarafından eklendi · yalnızca görüntülenebilir
                    </AppText>
                  )}
                </AppCard>
              ))
            )}

            {list.length > 0 && tab === 'active' ? (
              <AppButton label="İlaç ekle" onPress={openAdd} style={{ marginTop: theme.spacing.sm }} />
            ) : null}
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
              <AppText variant="subtitle">İlaç ekle</AppText>
              <Pressable accessibilityRole="button" onPress={() => setFormOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={theme.colors.textMuted} />
              </Pressable>
            </View>
            <AppInput label="İlaç adı *" value={name} onChangeText={(v) => { setName(v); if (nameError) setNameError(null) }} error={nameError} placeholder="Örn. Metformin" />
            <AppInput label="Doz / güç" value={strength} onChangeText={setStrength} placeholder="500 mg" />
            <AppInput label="Kullanım sıklığı" value={frequency} onChangeText={setFrequency} placeholder="Günde 2 kez" />
            <AppInput label="Not" value={notes} onChangeText={setNotes} placeholder="Örn. Yemeklerle birlikte" multiline />
            <AppButton label={saving ? 'Kaydediliyor…' : 'İlacı kaydet'} loading={saving} onPress={() => void handleSave()} />
          </View>
        </View>
      </Modal>
    </Screen>
  )
}
