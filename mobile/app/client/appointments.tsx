import { useCallback, useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { apiGet, apiPost } from '@/lib/api'
import { palette, radii, shadows, spacing } from '@/lib/theme'

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

const STATUS_COLOR: Record<AppointmentRow['status'], string> = {
  SCHEDULED: '#D97706',
  CONFIRMED: '#0284C7',
  COMPLETED: '#0F9D6A',
  CANCELLED: '#DC2626',
  NO_SHOW: '#7C3AED',
}

export default function ClientAppointmentsScreen() {
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
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Randevularim</Text>
        <Text style={styles.subtitle}>Tarihler, durumlar ve geri bildirim</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retry} onPress={() => load()}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>Henuz randevunuz yok</Text>
              <Text style={styles.emptySubtitle}>Kesfet sekmesinden doktor secip randevu olusturun.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.calendarIcon}>
                  <Ionicons name="calendar-outline" size={16} color={palette.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {item.date} {item.startTime}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {item.clinic.name} - {item.doctor?.fullName ?? 'Doktor atanmamis'}
                  </Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: `${STATUS_COLOR[item.status]}1A` }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
                    {STATUS_LABELS[item.status]}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardSubMeta}>{item.service.name}</Text>

              {item.status === 'COMPLETED' ? (
                <>
                  <Pressable
                    style={styles.reviewToggle}
                    onPress={() => setReviewOpenId((prev) => (prev === item.id ? null : item.id))}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={14} color={palette.accent} />
                    <Text style={styles.reviewToggleText}>Bu randevuyu degerlendir</Text>
                  </Pressable>

                  {reviewOpenId === item.id ? (
                    <View style={styles.reviewBox}>
                      <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Pressable
                            key={star}
                            style={[styles.star, rating >= star && styles.starActive]}
                            onPress={() => setRating(star)}
                          >
                            <Ionicons
                              name={rating >= star ? 'star' : 'star-outline'}
                              size={14}
                              color={rating >= star ? '#F59E0B' : '#7A8BA6'}
                            />
                          </Pressable>
                        ))}
                      </View>

                      <TextInput
                        style={styles.textarea}
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Yorumunuz (opsiyonel)"
                        placeholderTextColor="#94a3b8"
                        multiline
                      />

                      <Pressable
                        style={styles.submitReview}
                        onPress={() => submitReview(item.id)}
                        disabled={reviewSaving}
                      >
                        {reviewSaving ? (
                          <ActivityIndicator color="#ffffff" />
                        ) : (
                          <Text style={styles.submitReviewText}>Yorumu Gonder</Text>
                        )}
                      </Pressable>
                    </View>
                  ) : null}
                </>
              ) : null}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: 2,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: palette.text },
  subtitle: { color: palette.textMuted, fontSize: 13 },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    padding: spacing.md,
    gap: 8,
    ...shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calendarIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontWeight: '700', color: palette.text, fontSize: 15 },
  cardMeta: { color: palette.textMuted, fontSize: 12 },
  cardSubMeta: { color: '#344969', fontSize: 13, fontWeight: '600' },
  statusChip: {
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: palette.danger, textAlign: 'center' },
  retry: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  retryText: { color: palette.primary, fontWeight: '700' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: palette.text },
  emptySubtitle: { marginTop: 6, color: palette.textMuted, textAlign: 'center' },
  reviewToggle: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#BCD6FF',
    backgroundColor: '#F5F9FF',
    borderRadius: radii.sm,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  reviewToggleText: { color: palette.accent, fontWeight: '700' },
  reviewBox: {
    marginTop: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 10,
  },
  ratingRow: { flexDirection: 'row', gap: 8 },
  star: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: '#CAD8EC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  starActive: { borderColor: '#F3C26D', backgroundColor: '#FFF8EC' },
  textarea: {
    minHeight: 76,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
    color: palette.text,
  },
  submitReview: {
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReviewText: { color: '#ffffff', fontWeight: '700' },
})
