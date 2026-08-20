import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFocusEffect, type Href, useRouter } from 'expo-router'
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
import { appointmentStatusLabel } from '@/lib/status-labels'
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
  const router = useRouter()
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

  const dateOptions = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 14 }).map((_, index) => {
      const value = new Date(today)
      value.setDate(today.getDate() + index)
      return {
        iso: value.toISOString().slice(0, 10),
        label: value.toLocaleDateString('tr-TR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      }
    })
  }, [])

  const load = useCallback(async (mode: 'initial' | 'refresh' | 'soft' = 'initial') => {
    if (mode === 'initial') setLoading(true)
    if (mode === 'refresh') setRefreshing(true)
    if (mode !== 'soft') setError(null)
    try {
      const response = await apiGet<ListResponse>('/api/client/appointments')
      setRows(response.appointments)
    } catch (e) {
      if (mode !== 'soft') {
        setError(e instanceof Error ? e.message : 'Randevular yüklenemedi')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load('initial')
  }, [load])

  useFocusEffect(
    useCallback(() => {
      void load('soft')
      const timer = setInterval(() => {
        void load('soft')
      }, 30_000)
      return () => clearInterval(timer)
    }, [load])
  )

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
      'Bu randevuyu iptal etmek istiyor musunuz?',
      [
        { text: 'Hayır, geri dön', style: 'cancel' },
        { text: 'Evet, iptal et', style: 'destructive', onPress: () => cancelAppointment(appointmentId) },
      ]
    )
  }

  async function submitReschedule(appointmentId: string) {
    if (!rescheduleDate || !rescheduleStart) {
      setError('Lütfen yeni tarih ve saat seçin')
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
      await load('refresh')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yorum kaydedilemedi')
    } finally {
      setReviewSaving(false)
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Randevularım" subtitle="İptal, erteleme ve geri bildirim" />

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
          title="Randevular yüklenemedi"
          description={error}
          primaryActionLabel="Tekrar dene"
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
              title="Henüz randevunuz yok"
              description="Keşfet sekmesinden klinik veya doktor seçip randevu oluşturun."
              primaryActionLabel="Klinik keşfet"
              onPrimaryAction={() => router.push('/client/search' as Href)}
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
                    {item.clinic.name} · {item.doctor?.fullName ?? 'Doktor atanmamış'}
                  </AppText>
                </View>
                <Badge label={appointmentStatusLabel(item.status)} tone={STATUS_TONE[item.status]} />
              </View>

              <AppText variant="caption" style={{ marginTop: theme.spacing.xs }}>
                {item.service?.name ?? 'Hizmet'}
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
                    label="İptal et"
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
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {dateOptions.map((option) => (
                      <Chip
                        key={option.iso}
                        label={option.label}
                        selected={rescheduleDate === option.iso}
                        onPress={() => setRescheduleDate(option.iso)}
                      />
                    ))}
                  </View>
                  {slotsLoading ? (
                    <Skeleton height={36} width="100%" />
                  ) : rescheduleSlots.length === 0 ? (
                    <AppText variant="caption" color={theme.colors.textMuted}>
                      Bu tarihte uygun saat bulunamadı.
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
                    <AppButton label="Vazgeç" variant="ghost" onPress={closeReschedule} style={{ flex: 1 }} />
                    <AppButton
                      label="Ertelemeyi kaydet"
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
                    label="Bu randevuyu değerlendir"
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
                            accessibilityLabel={`${star} yıldız`}
                            onPress={() => setRating(star)}
                            style={{
                              width: 44,
                              height: 44,
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
                        label="Yorumu gönder"
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
