import { useCallback, useEffect, useState } from 'react'
import { type Href, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Pressable, RefreshControl, ScrollView, View } from 'react-native'
import {
  AppButton,
  AppCard,
  AppText,
  Badge,
  EmptyState,
  Screen,
  ScreenHeader,
  Skeleton,
} from '@/components/ui'
import { apiGet } from '@/lib/api'
import { appointmentStatusLabel } from '@/lib/status-labels'
import { useAppTheme } from '@/lib/use-app-theme'
import type { ClientPassport } from '@/lib/types'

type PassportApiResponse = {
  ok?: boolean
  data?: ClientPassport
  error?: string
}

export default function ClientHealthScreen() {
  const theme = useAppTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passport, setPassport] = useState<ClientPassport | null>(null)

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true)
    if (mode === 'refresh') setRefreshing(true)
    setError(null)
    try {
      const response = await apiGet<PassportApiResponse>('/api/client/passport')
      if (!response.data) {
        throw new Error(response.error ?? 'Pasaport yüklenemedi')
      }
      setPassport(response.data)
    } catch (e) {
      setPassport(null)
      setError(
        e instanceof Error
          ? e.message
          : 'Asistan pasaportu yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const title = passport?.honesty.titleTr ?? 'Asistan pasaportu'
  const disclaimer =
    passport?.honesty.disclaimerTr ??
    'Klinikler arası ziyaret ve üyelik özeti. Klinik notları, tahliller ve FHIR / tıbbi pasaport değildir.'

  const timeline =
    passport?.timeline?.length
      ? passport.timeline
      : (passport?.visits ?? []).map((visit) => ({
          id: visit.id,
          kind: 'visit',
          occurredAt: `${visit.date}T${visit.startTime || '00:00'}`,
          title: visit.service?.name || 'Hizmet',
          subtitle: visit.doctor?.fullName ?? null,
          status: visit.status,
          clinicName: visit.clinic.name,
        }))

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 120, gap: theme.spacing.sm }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load('refresh')}
            tintColor={theme.colors.primary}
          />
        }
      >
        <ScreenHeader title={title} subtitle={disclaimer} />

        {loading && !passport ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Skeleton height={88} />
            <Skeleton height={64} />
            <Skeleton height={64} />
            <Skeleton height={120} />
          </View>
        ) : null}

        {error ? (
          <EmptyState
            icon="warning-outline"
            title="Pasaport yüklenemedi"
            description={error}
            primaryActionLabel="Yeniden dene"
            onPrimaryAction={() => void load()}
          />
        ) : null}

        {!error && passport ? (
          <>
            <AppCard>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: theme.radii.md,
                    backgroundColor: theme.colors.surfaceSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <Ionicons name="finger-print-outline" size={20} color={theme.colors.text} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <AppText variant="subtitle">{passport.fullName}</AppText>
                  {passport.gpiDisplay ? (
                    <AppText variant="caption" color={theme.colors.primary}>
                      {passport.gpiDisplay}
                    </AppText>
                  ) : (
                    <AppText variant="caption" color={theme.colors.textMuted}>
                      GPI henüz bağlanmadı — profilde telefon veya e-posta ekleyin.
                    </AppText>
                  )}
                  <AppText variant="micro" color={theme.colors.textMuted}>
                    Opak kimlik kodu · sıralı tıbbi numara değildir
                  </AppText>
                </View>
              </View>
            </AppCard>

            <AppText variant="subtitle">Kliniklerim</AppText>
            {!passport.clinics.length ? (
              <EmptyState
                icon="business-outline"
                title="Henüz bağlı klinik yok"
                description="Klinik bulun ve randevu alın; üyelikleriniz burada listelenir."
                primaryActionLabel="Klinik keşfet"
                onPrimaryAction={() => router.push('/client/search' as Href)}
              />
            ) : (
              passport.clinics.map((clinic) => (
                <Pressable
                  key={clinic.businessId}
                  accessibilityRole="button"
                  accessibilityLabel={`${clinic.name} kliniğini aç`}
                  onPress={() => router.push(`/client/clinics/${clinic.businessId}` as Href)}
                  style={{
                    minHeight: 56,
                    borderRadius: theme.radii.lg,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Ionicons name="business-outline" size={18} color={theme.colors.primary} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="caption">{clinic.name}</AppText>
                    <AppText variant="micro" color={theme.colors.textMuted}>
                      {[clinic.city, clinic.patientNumber ? `No: ${clinic.patientNumber}` : null]
                        .filter(Boolean)
                        .join(' · ') || 'Üyelik'}
                    </AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                </Pressable>
              ))
            )}

            <AppText variant="subtitle">Ziyaretler</AppText>
            {!timeline.length ? (
              <EmptyState
                icon="heart-outline"
                title="Henüz ziyaret yok"
                description="İlk randevunuzu alın; klinikler arası ziyaret geçmişiniz burada birikir."
                primaryActionLabel="Klinik keşfet →"
                onPrimaryAction={() => router.push('/client/search' as Href)}
              />
            ) : (
              timeline.map((item) => (
                <AppCard key={item.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText variant="caption">{item.title}</AppText>
                      <AppText variant="micro" color={theme.colors.textMuted}>
                        {[item.clinicName, item.subtitle].filter(Boolean).join(' · ')}
                      </AppText>
                      <AppText variant="micro" color={theme.colors.textMuted}>
                        {new Date(item.occurredAt).toLocaleString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </AppText>
                    </View>
                    {item.status ? (
                      <Badge label={appointmentStatusLabel(item.status)} tone="info" />
                    ) : null}
                  </View>
                </AppCard>
              ))
            )}

            <AppCard style={{ backgroundColor: theme.colors.surfaceSoft }}>
              <AppText variant="caption" color={theme.colors.textMuted}>
                Yönetim, iptal ve yeniden planlama için Randevular sekmesini kullanın.
              </AppText>
              <AppButton
                label="Randevulara git"
                variant="secondary"
                onPress={() => router.push('/client/appointments' as Href)}
                style={{ marginTop: theme.spacing.sm }}
              />
            </AppCard>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  )
}
