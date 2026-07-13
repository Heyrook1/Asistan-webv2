import { useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { apiGet } from '@/lib/api'
import { palette, radii, shadows, spacing } from '@/lib/theme'
import type { AvailabilitySlot } from '@/lib/types'

type RatingBreakdown = {
  serviceQuality: number | null
  waitingTime: number | null
  communication: number | null
}

type DoctorDetailResponse = {
  doctor: {
    id: string
    fullName: string
    specialty: string | null
    bio: string | null
    story: string
    clinic: {
      id: string
      name: string
      address: string | null
      city: string | null
    }
    services: Array<{
      id: string
      name: string
      description: string | null
      durationMin: number
      price: number | null
      currency: string
    }>
    workingHours: Array<{
      weekday: number
      startTime: string
      endTime: string
      locationId: string | null
      slotIntervalMin: number
    }>
    slots: AvailabilitySlot[]
    reviews: {
      averageRating: number | null
      reviewCount: number
      averages: RatingBreakdown
      recent: Array<{
        id: string
        rating: number
        serviceQuality: number | null
        waitingTime: number | null
        communication: number | null
        comment: string | null
        clientName: string
        createdAt: string
      }>
    }
    ratingDistribution: Array<{
      rating: number
      count: number
    }>
    verification?: {
      level: 'verified' | 'partial' | 'unverified'
      label: string
      labelEn: string
      reasons: string[]
    }
    credentials: Array<{
      id: string
      title: string
      issuer: string
      status: string
    }>
    careApproach: string[]
    analytics: {
      completedAppointments: number
      uniquePatients: number
      activeServiceCount: number
      workingDayCount: number
      nextAvailableAt: string | null
      experienceSinceYear: number
    }
  }
}

const weekdayLabels = ['Pazar', 'Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi']

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part.charAt(0).toUpperCase()).join('') || 'DR'
}

function formatMoney(price: number | null, currency: string) {
  if (price == null) return 'Fiyat bilgisi yok'
  return `${price} ${currency}`
}

function formatDateLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Tarih bilgisi yok'
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatScore(value: number | null) {
  if (value == null) return '-'
  return value.toFixed(1)
}

function getDistributionPercent(count: number, total: number) {
  if (total <= 0) return 0
  return Math.max(6, Math.round((count / total) * 100))
}

export default function DoctorDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id: string }>()
  const doctorId = useMemo(() => String(params.id ?? ''), [params.id])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DoctorDetailResponse['doctor'] | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

  useEffect(() => {
    if (!doctorId) return
    setLoading(true)
    setError(null)
    apiGet<DoctorDetailResponse>(`/api/client/doctors/${doctorId}`)
      .then((response) => {
        setData(response.doctor)
        setSelectedServiceId(response.doctor.services[0]?.id ?? null)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Doktor bilgisi yuklenemedi'))
      .finally(() => setLoading(false))
  }, [doctorId])

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.error}>{error ?? 'Doktor bulunamadi'}</Text>
        </View>
      </SafeAreaView>
    )
  }

  const reviewTotal = data.reviews.reviewCount

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(data.fullName)}</Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.title}>{data.fullName}</Text>
              <Text style={styles.subtitle}>{data.specialty ?? 'Uzmanlik bilgisi yakinda eklenecek'}</Text>
              {data.verification ? (
                <View
                  style={[
                    styles.verificationBadge,
                    data.verification.level === 'verified'
                      ? styles.verificationVerified
                      : data.verification.level === 'partial'
                        ? styles.verificationPartial
                        : styles.verificationPending,
                  ]}
                >
                  <Ionicons
                    name={data.verification.level === 'verified' ? 'shield-checkmark' : 'shield-outline'}
                    size={12}
                    color={data.verification.level === 'verified' ? '#047857' : data.verification.level === 'partial' ? '#B45309' : '#475569'}
                  />
                  <Text style={styles.verificationText}>{data.verification.label}</Text>
                </View>
              ) : null}
              <Text style={styles.clinic}>
                {data.clinic.name}
                {data.clinic.city ? ` - ${data.clinic.city}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.heroMetrics}>
            <View style={styles.metricChip}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.metricChipText}>{formatScore(data.reviews.averageRating)} / 5</Text>
            </View>
            <View style={styles.metricChip}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#9FDBD3" />
              <Text style={styles.metricChipText}>{reviewTotal} degerlendirme</Text>
            </View>
            <View style={styles.metricChip}>
              <Ionicons name="calendar-outline" size={14} color="#9FDBD3" />
              <Text style={styles.metricChipText}>{data.analytics.completedAppointments} tamamlanan randevu</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uzmanlik Hikayesi</Text>
          <Text style={styles.storyText}>{data.story}</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Aktif hasta</Text>
              <Text style={styles.kpiValue}>{data.analytics.uniquePatients}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Calisma gunu</Text>
              <Text style={styles.kpiValue}>{data.analytics.workingDayCount}/7</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Deneyim kaydi</Text>
              <Text style={styles.kpiValue}>{data.analytics.experienceSinceYear}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Hizmet alani</Text>
              <Text style={styles.kpiValue}>{data.analytics.activeServiceCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sertifika ve Yetkinlikler</Text>
          {data.credentials.map((credential) => (
            <View key={credential.id} style={styles.credentialRow}>
              <View style={styles.credentialIcon}>
                <Ionicons name="ribbon-outline" size={16} color={palette.primary} />
              </View>
              <View style={styles.credentialContent}>
                <Text style={styles.credentialTitle}>{credential.title}</Text>
                <Text style={styles.credentialMeta}>{credential.issuer}</Text>
              </View>
              <Text style={styles.credentialStatus}>{credential.status}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tedavi Yaklasimi</Text>
          {data.careApproach.map((item) => (
            <View key={item} style={styles.approachRow}>
              <Ionicons name="checkmark-circle" size={16} color={palette.primary} />
              <Text style={styles.approachText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hizmet Portfoyu</Text>
          {data.services.map((service) => (
            <Pressable
              key={service.id}
              style={[
                styles.serviceCard,
                selectedServiceId === service.id && styles.serviceCardActive,
              ]}
              onPress={() => setSelectedServiceId(service.id)}
            >
              <View style={styles.serviceTop}>
                <Text style={styles.serviceTitle}>{service.name}</Text>
                <Text style={styles.servicePrice}>{formatMoney(service.price, service.currency)}</Text>
              </View>
              <Text style={styles.serviceMeta}>{service.durationMin} dk</Text>
              {service.description ? <Text style={styles.serviceDesc}>{service.description}</Text> : null}
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Degerlendirme Analizi</Text>
          <Text style={styles.ratingHeadline}>
            Ortalama {formatScore(data.reviews.averageRating)} / 5 ({reviewTotal} yorum)
          </Text>

          <View style={styles.subScores}>
            <View style={styles.subScoreCard}>
              <Text style={styles.subScoreLabel}>Hizmet Kalitesi</Text>
              <Text style={styles.subScoreValue}>{formatScore(data.reviews.averages.serviceQuality)}</Text>
            </View>
            <View style={styles.subScoreCard}>
              <Text style={styles.subScoreLabel}>Bekleme Suresi</Text>
              <Text style={styles.subScoreValue}>{formatScore(data.reviews.averages.waitingTime)}</Text>
            </View>
            <View style={styles.subScoreCard}>
              <Text style={styles.subScoreLabel}>Iletisim</Text>
              <Text style={styles.subScoreValue}>{formatScore(data.reviews.averages.communication)}</Text>
            </View>
          </View>

          {data.ratingDistribution.map((row) => (
            <View key={row.rating} style={styles.distRow}>
              <Text style={styles.distLabel}>{row.rating} yildiz</Text>
              <View style={styles.distBarTrack}>
                <View
                  style={[
                    styles.distBarFill,
                    { width: `${getDistributionPercent(row.count, reviewTotal)}%` },
                  ]}
                />
              </View>
              <Text style={styles.distCount}>{row.count}</Text>
            </View>
          ))}

          {data.reviews.recent.slice(0, 5).map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewName}>{review.clientName}</Text>
                <Text style={styles.reviewScore}>{review.rating}/5</Text>
              </View>
              <Text style={styles.reviewDate}>{formatDateLabel(review.createdAt)}</Text>
              {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calisma Saatleri</Text>
          {data.workingHours.length === 0 ? (
            <Text style={styles.empty}>Calisma saati bilgisi henuz paylasilmadi.</Text>
          ) : (
            data.workingHours.map((row, index) => (
              <View key={`${row.weekday}-${row.startTime}-${index}`} style={styles.hoursRow}>
                <Text style={styles.hoursDay}>{weekdayLabels[row.weekday] ?? 'Gun'}</Text>
                <Text style={styles.hoursTime}>
                  {row.startTime} - {row.endTime}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bugun Musait Saatler</Text>
          <View style={styles.slotWrap}>
            {data.slots.length === 0 ? (
              <Text style={styles.empty}>Bugun gorunen bos saat yok.</Text>
            ) : (
              data.slots.slice(0, 12).map((slot) => (
                <Pressable
                  key={`${slot.startTime}-${slot.endTime}`}
                  style={styles.slot}
                  onPress={() =>
                    router.push({
                      pathname: '/client/book/[doctorId]',
                      params: {
                        doctorId,
                        serviceId: selectedServiceId ?? undefined,
                        startTime: slot.startTime,
                      },
                    })
                  }
                >
                  <Ionicons name="time-outline" size={13} color={palette.primary} />
                  <Text style={styles.slotText}>{slot.startTime}</Text>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.sticky}>
        <Pressable
          style={styles.bookButton}
          onPress={() =>
            router.push({
              pathname: '/client/book/[doctorId]',
              params: {
                doctorId,
                serviceId: selectedServiceId ?? undefined,
              },
            })
          }
        >
          <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
          <Text style={styles.bookButtonText}>Randevu Al</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  container: {
    padding: spacing.md,
    paddingBottom: 110,
    gap: spacing.sm,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: palette.danger },
  hero: {
    borderRadius: radii.lg,
    backgroundColor: palette.heroMid,
    padding: spacing.lg,
    gap: 12,
  },
  heroTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#13427C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 18 },
  heroInfo: { flex: 1, gap: 3 },
  title: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: '#96F5EA', fontWeight: '700' },
  verificationBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verificationVerified: { backgroundColor: 'rgba(16,185,129,0.18)' },
  verificationPartial: { backgroundColor: 'rgba(245,158,11,0.18)' },
  verificationPending: { backgroundColor: 'rgba(148,163,184,0.2)' },
  verificationText: { fontSize: 11, fontWeight: '700', color: '#E2E8F0' },
  clinic: { color: '#BCD1EF', fontSize: 12 },
  heroMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#29528D',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#0D3568',
  },
  metricChipText: { color: '#D4E1F6', fontSize: 12, fontWeight: '600' },
  section: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: spacing.md,
    gap: 10,
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  storyText: { color: '#415575', lineHeight: 20 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#D8E6F8',
    borderRadius: radii.md,
    padding: 10,
    backgroundColor: palette.surfaceSoft,
  },
  kpiLabel: { color: '#6A7A95', fontSize: 11 },
  kpiValue: { color: palette.text, fontWeight: '700', fontSize: 14, marginTop: 2 },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF3FB',
  },
  credentialIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  credentialContent: { flex: 1, gap: 2 },
  credentialTitle: { color: palette.text, fontWeight: '700', fontSize: 13 },
  credentialMeta: { color: '#6A7A95', fontSize: 12 },
  credentialStatus: {
    color: palette.primaryDark,
    fontWeight: '700',
    fontSize: 11,
    backgroundColor: palette.successSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  approachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approachText: { color: '#415575', lineHeight: 20, flex: 1 },
  serviceCard: {
    borderWidth: 1,
    borderColor: '#CAD8EC',
    borderRadius: radii.md,
    padding: 10,
    gap: 4,
    backgroundColor: '#FFFFFF',
  },
  serviceCardActive: {
    borderColor: palette.primary,
    backgroundColor: '#ECFFFA',
  },
  serviceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  serviceTitle: { color: palette.text, fontWeight: '700', flex: 1 },
  servicePrice: { color: palette.primaryDark, fontWeight: '700', fontSize: 12 },
  serviceMeta: { color: '#475A79', fontSize: 12 },
  serviceDesc: { color: '#6A7A95', fontSize: 12 },
  ratingHeadline: { color: palette.text, fontWeight: '700' },
  subScores: { flexDirection: 'row', gap: 8 },
  subScoreCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D8E6F8',
    borderRadius: radii.md,
    padding: 10,
    backgroundColor: palette.surfaceSoft,
    gap: 3,
  },
  subScoreLabel: { color: '#6A7A95', fontSize: 11 },
  subScoreValue: { color: palette.text, fontWeight: '700', fontSize: 16 },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distLabel: { width: 54, fontSize: 12, color: '#5A6A85' },
  distBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: '#E7EEF8',
    overflow: 'hidden',
  },
  distBarFill: {
    height: '100%',
    backgroundColor: palette.primary,
  },
  distCount: { width: 20, textAlign: 'right', color: '#5A6A85', fontWeight: '600' },
  reviewCard: {
    borderTopWidth: 1,
    borderTopColor: '#EDF3FB',
    paddingTop: 10,
    gap: 3,
  },
  reviewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewName: { color: palette.text, fontWeight: '700' },
  reviewScore: { color: '#B45309', fontWeight: '700', fontSize: 12 },
  reviewDate: { color: '#6A7A95', fontSize: 11 },
  reviewComment: { color: '#415575', lineHeight: 18 },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5EDF8',
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  hoursDay: { color: palette.text, fontWeight: '600' },
  hoursTime: { color: '#415575', fontWeight: '600' },
  slotWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    borderWidth: 1,
    borderColor: '#B8EFE4',
    backgroundColor: '#ECFFFA',
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotText: { color: palette.primaryDark, fontWeight: '700' },
  empty: { color: palette.textMuted },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  bookButton: {
    height: 48,
    borderRadius: radii.md,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  bookButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
})
