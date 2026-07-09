import { useCallback, useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { FlatList, Pressable, RefreshControl, View } from 'react-native'
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
import { apiGet, apiPost } from '@/lib/api'
import { useAppTheme } from '@/lib/use-app-theme'

type AppointmentRow = {
  id: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  date: string
  startTime: string
  clinic: { id: string; name: string }
  doctor: { id: string; fullName: string; specialty: string | null } | null
  service: { id: string; name: string }
  location: { id: string; name: string; address: string | null } | null
}

type ListResponse = { appointments: AppointmentRow[] }

const STATUS_LABELS: Record<AppointmentRow['status'], string> = {
  SCHEDULED: 'Onay Bekliyor',
  CONFIRMED: 'Onaylandi',
  COMPLETED: 'Tamamlandi',
  CANCELLED: 'Iptal',
  NO_SHOW: 'Gelinmedi',
}

const STATUS_TONE: Record<AppointmentRow['status'], 'warning' | 'info' | 'success' | 'danger'> = {
  SCHEDULED: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  NO_SHOW: 'danger',
}

export default function ClientAppointmentsScreen() {
  const theme = useAppTheme()
  const [rows, setRows] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewOpenId, setReviewOpenId] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewSaving, setReviewSaving] = useState(false)

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true)
    if (mode === 'refresh') setRefreshing(true)
    setError(null)
    try {
      const response = await apiGet<ListResponse>('/api/client/appointments')
      setRows(response.appointments)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Randevular yuklenemedi')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function submitReview(appointmentId: string) {
    setReviewSaving(true)
    try {
      await apiPost('/api/client/reviews', {
        appointmentId,
        rating,
        comment: comment.trim() || undefined,
        serviceQuality: rating,
        waitingTime: rating,
        communication: rating,
      })
      setReviewOpenId(null)
      setComment('')
      setRating(5)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yorum kaydedilemedi')
    } finally {
      setReviewSaving(false)
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Randevularim" subtitle="Tarihler, durumlar ve geri bildirim" />

      {loading ? (
        <View style={{ padding: theme.spacing.md, gap: theme.spacing.sm }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <AppCard key={`appointment-skeleton-${index}`}>
              <Skeleton height={16} width="55%" />
              <Skeleton height={12} width="80%" style={{ marginTop: theme.spacing.sm }} />
              <Skeleton height={36} width="100%" style={{ marginTop: theme.spacing.md }} />
            </AppCard>
          ))}
        </View>
      ) : error ? (
        <EmptyState
          icon="warning-outline"
          title="Randevular yuklenemedi"
          description={error}
          primaryActionLabel="Tekrar Dene"
          onPrimaryAction={() => load()}
        />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 120, gap: theme.spacing.sm }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} tintColor={theme.colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title="Henuz randevunuz yok"
              description="Kesfet sekmesinden doktor secip randevu olusturun."
            />
          }
          renderItem={({ item }) => (
            <AppCard>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: theme.radii.sm,
                    backgroundColor: theme.colors.primarySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="subtitle">
                    {item.date} {item.startTime}
                  </AppText>
                  <AppText variant="caption" color={theme.colors.textMuted}>
                    {item.clinic.name} - {item.doctor?.fullName ?? 'Doktor atanmamis'}
                  </AppText>
                </View>
                <Badge label={STATUS_LABELS[item.status]} tone={STATUS_TONE[item.status]} />
              </View>

              <AppText variant="caption" style={{ marginTop: theme.spacing.xs }}>
                {item.service.name}
              </AppText>

              {item.status === 'COMPLETED' ? (
                <>
                  <AppButton
                    label="Bu randevuyu degerlendir"
                    variant="secondary"
                    onPress={() => setReviewOpenId((prev) => (prev === item.id ? null : item.id))}
                    style={{ marginTop: theme.spacing.sm }}
                  />

                  {reviewOpenId === item.id ? (
                    <View style={{ marginTop: theme.spacing.sm, gap: theme.spacing.sm }}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Pressable
                            key={star}
                            accessibilityRole="button"
                            accessibilityLabel={`${star} yildiz`}
                            onPress={() => setRating(star)}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: theme.radii.sm,
                              borderWidth: 1,
                              borderColor: rating >= star ? theme.colors.warning : theme.colors.border,
                              backgroundColor: rating >= star ? 'rgba(216, 138, 29, 0.12)' : theme.colors.surfaceSoft,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Ionicons
                              name={rating >= star ? 'star' : 'star-outline'}
                              size={14}
                              color={rating >= star ? '#F59E0B' : theme.colors.textMuted}
                            />
                          </Pressable>
                        ))}
                      </View>

                      <AppInput
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Yorumunuz (opsiyonel)"
                        multiline
                        style={{ minHeight: 76, textAlignVertical: 'top' }}
                      />

                      <AppButton
                        label="Yorumu Gonder"
                        loading={reviewSaving}
                        onPress={() => submitReview(item.id)}
                      />
                    </View>
                  ) : null}
                </>
              ) : null}
            </AppCard>
          )}
        />
      )}
    </Screen>
  )
}
