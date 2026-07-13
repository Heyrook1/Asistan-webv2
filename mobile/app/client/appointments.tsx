import { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, Pressable, RefreshControl, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {
  AppButton,
  AppCard,
  AppInput,
  AppText,
  Badge,
  Chip,
  EmptyState,
  Screen,
  ScreenHeader,
  Skeleton,
} from '@/components/ui'
import { apiGet, apiPost } from '@/lib/api'
import { useAppTheme } from '@/lib/use-app-theme'
import type { AvailabilitySlot } from '@/lib/types'

type AppointmentRow = {
  id: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  date: string
  startTime: string
  businessId: string
  serviceId: string
  doctorId: string | null
  locationId: string | null
  hasReview?: boolean
  clinic: { id: string; name: string }
  doctor: { id: string; fullName: string; specialty: string | null } | null
  service: { id: string; name: string }
  location: { id: string; name: string; address: string | null } | null
}

type ListResponse = { appointments: AppointmentRow[] }
type SlotsResponse = { slots: AvailabilitySlot[] }

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

function isActive(status: AppointmentRow['status']) {
  return status === 'SCHEDULED' || status === 'CONFIRMED'
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
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleSlots, setRescheduleSlots] = useState<AvailabilitySlot[]>([])
  const [rescheduleStart, setRescheduleStart] = useState<string | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [lifecycleSaving, setLifecycleSaving] = useState(false)

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

  const activeReschedule = rows.find((row) => row.id === rescheduleId) ?? null

  useEffect(() => {
    if (!activeReschedule?.doctorId || !rescheduleDate) {
      setRescheduleSlots([])
      setRescheduleStart(null)
      return
    }

    let cancelled = false
    setSlotsLoading(true)
    const params = new URLSearchParams({
      businessId: activeReschedule.businessId,
      doctorId: activeReschedule.doctorId,
      serviceId: activeReschedule.serviceId,
      date: rescheduleDate,
    })
    if (activeReschedule.locationId) {
      params.set('locationId', activeReschedule.locationId)
    }

    apiGet<SlotsResponse>(`/api/client/availability?${params.toString()}`)
      .then((response) => {
        if (cancelled) return
        setRescheduleSlots(response.slots)
        setRescheduleStart((prev) =>
          prev && response.slots.some((slot) => slot.startTime === prev) ? prev : null
        )
      })
      .catch(() => {
        if (!cancelled) setRescheduleSlots([])
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeReschedule, rescheduleDate])

  function openReschedule(item: AppointmentRow) {
    setRescheduleId(item.id)
    setRescheduleDate(item.date)
    setRescheduleStart(item.startTime)
    setReviewOpenId(null)
  }

  function closeReschedule() {
    setRescheduleId(null)
    setRescheduleDate('')
    setRescheduleSlots([])
    setRescheduleStart(null)
  }

  async function cancelAppointment(appointmentId: string) {
    setLifecycleSaving(true)
    setError(null)
    try {
      await apiPost(`/api/client/appointments/${appointmentId}/cancel`, {})
      closeReschedule()
      await load('refresh')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Randevu iptal edilemedi')
    } finally {
      setLifecycleSaving(false)
    }
  }

  function confirmCancel(appointmentId: string) {
    Alert.alert(
      'Randevuyu iptal et',
      'Bu randevuyu iptal etmek istediginize emin misiniz?',
      [
        { text: 'Vazgec', style: 'cancel' },
        { text: 'Iptal Et', style: 'destructive', onPress: () => cancelAppointment(appointmentId) },
      ]
    )
  }

  async function submitReschedule(appointmentId: string) {
    if (!rescheduleDate || !rescheduleStart) {
      setError('Lutfen yeni tarih ve saat secin')
      return
    }

    setLifecycleSaving(true)
    setError(null)
    try {
      await apiPost(`/api/client/appointments/${appointmentId}/reschedule`, {
        date: rescheduleDate,
        startTime: rescheduleStart,
      })
      closeReschedule()
      await load('refresh')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Randevu ertelenemedi')
    } finally {
      setLifecycleSaving(false)
    }
  }

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
      <ScreenHeader title="Randevularim" subtitle="Iptal, erteleme ve geri bildirim" />

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

              {isActive(item.status) ? (
                <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
                  <AppButton
                    label="Ertele"
                    variant="secondary"
                    onPress={() => openReschedule(item)}
                    style={{ flex: 1 }}
                  />
                  <AppButton
                    label="Iptal Et"
                    variant="ghost"
                    onPress={() => confirmCancel(item.id)}
                    style={{ flex: 1 }}
                    disabled={lifecycleSaving}
                  />
                </View>
              ) : null}

              {rescheduleId === item.id ? (
                <View style={{ marginTop: theme.spacing.sm, gap: theme.spacing.sm }}>
                  <AppText variant="subtitle">Yeni tarih ve saat</AppText>
                  <AppInput
                    value={rescheduleDate}
                    onChangeText={setRescheduleDate}
                    placeholder="YYYY-MM-DD"
                    autoCapitalize="none"
                  />
                  {slotsLoading ? (
                    <Skeleton height={36} width="100%" />
                  ) : rescheduleSlots.length === 0 ? (
                    <AppText variant="caption" color={theme.colors.textMuted}>
                      Bu tarihte uygun saat bulunamadi.
                    </AppText>
                  ) : (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {rescheduleSlots.map((slot) => (
                        <Chip
                          key={slot.startTime}
                          label={slot.startTime}
                          selected={rescheduleStart === slot.startTime}
                          onPress={() => setRescheduleStart(slot.startTime)}
                        />
                      ))}
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                    <AppButton label="Vazgec" variant="ghost" onPress={closeReschedule} style={{ flex: 1 }} />
                    <AppButton
                      label="Ertelemeyi Kaydet"
                      loading={lifecycleSaving}
                      onPress={() => submitReschedule(item.id)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              ) : null}

              {item.status === 'COMPLETED' && !item.hasReview ? (
                <>
                  <AppButton
                    label="Bu randevuyu degerlendir"
                    variant="secondary"
                    onPress={() => {
                      setReviewOpenId((prev) => (prev === item.id ? null : item.id))
                      closeReschedule()
                    }}
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
