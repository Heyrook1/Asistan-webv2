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

type ClinicDetailResponse = {
  clinic: {
    id: string
    name: string
    description: string | null
    story: string
    address: string | null
    city: string | null
    phone: string | null
    email: string | null
    ratingAverage: number | null
    reviewCount: number
    ratingDistribution: Array<{
      rating: number
      count: number
    }>
    credentials: Array<{
      id: string
      title: string
      issuer: string
      status: string
    }>
    analytics: {
      completedAppointments: number
      uniqueClients: number
      doctorCount: number
      serviceCount: number
      locationCount: number
      activeSinceYear: number
    }
    qualityHighlights: string[]
    patientVoice: Array<{
      id: string
      rating: number
      comment: string | null
      clientName: string
      createdAt: string
    }>
    services: Array<{
      id: string
      name: string
      durationMin: number
      price: number | null
      currency: string
      description: string | null
    }>
    doctors: Array<{
      id: string
      fullName: string
      specialty: string | null
      story: string
      nextSlots: Array<{ startTime: string; endTime: string }>
      reviews: {
        averageRating: number | null
        reviewCount: number
      }
    }>
  }
}

function formatScore(value: number | null) {
  if (value == null) return '-'
  return value.toFixed(1)
}

function formatDateLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Tarih bilgisi yok'
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatMoney(price: number | null, currency: string) {
  if (price == null) return 'Fiyat bilgisi yok'
  return `${price} ${currency}`
}

function getDistributionPercent(count: number, total: number) {
  if (total <= 0) return 0
  return Math.max(6, Math.round((count / total) * 100))
}

export default function ClinicDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id: string }>()
  const clinicId = useMemo(() => String(params.id ?? ''), [params.id])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clinic, setClinic] = useState<ClinicDetailResponse['clinic'] | null>(null)

  useEffect(() => {
    if (!clinicId) return
    setLoading(true)
    setError(null)
    apiGet<ClinicDetailResponse>(`/api/client/clinics/${clinicId}`)
      .then((response) => setClinic(response.clinic))
      .catch((e) => setError(e instanceof Error ? e.message : 'Klinik bilgisi alinamadi'))
      .finally(() => setLoading(false))
  }, [clinicId])

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (error || !clinic) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.error}>{error ?? 'Klinik bulunamadi'}</Text>
        </View>
      </SafeAreaView>
    )
  }

  const reviewTotal = clinic.reviewCount

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>{clinic.name}</Text>
          <Text style={styles.meta}>
            {clinic.city ?? 'Sehir bilgisi yok'} - Ortalama {formatScore(clinic.ratingAverage)} / 5
          </Text>
          <View style={styles.heroBadges}>
            <View style={styles.badge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.badgeText}>{reviewTotal} yorum</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="people-outline" size={14} color="#9FDBD3" />
              <Text style={styles.badgeText}>{clinic.analytics.doctorCount} uzman</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="medkit-outline" size={14} color="#9FDBD3" />
              <Text style={styles.badgeText}>{clinic.analytics.serviceCount} hizmet</Text>
            </View>
          </View>
          {clinic.address ? <Text style={styles.address}>{clinic.address}</Text> : null}
          <Text style={styles.story}>{clinic.story}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kurumsal Ozet</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Tamamlanan randevu</Text>
              <Text style={styles.kpiValue}>{clinic.analytics.completedAppointments}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Benzersiz danisan</Text>
              <Text style={styles.kpiValue}>{clinic.analytics.uniqueClients}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Lokasyon</Text>
              <Text style={styles.kpiValue}>{clinic.analytics.locationCount}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Kayit yili</Text>
              <Text style={styles.kpiValue}>{clinic.analytics.activeSinceYear}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sertifika ve Kalite Belgeleri</Text>
          {clinic.credentials.map((credential) => (
            <View key={credential.id} style={styles.credentialRow}>
              <View style={styles.credentialIcon}>
                <Ionicons name="shield-checkmark-outline" size={16} color={palette.primary} />
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
          <Text style={styles.sectionTitle}>Hasta Memnuniyeti Analizi</Text>
          <Text style={styles.ratingHeadline}>
            Ortalama {formatScore(clinic.ratingAverage)} / 5 ({reviewTotal} degerlendirme)
          </Text>
          {clinic.ratingDistribution.map((row) => (
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hizmet Yaklasimi</Text>
          {clinic.qualityHighlights.map((item) => (
            <View key={item} style={styles.approachRow}>
              <Ionicons name="checkmark-circle" size={16} color={palette.primary} />
              <Text style={styles.approachText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hizmetler</Text>
          {clinic.services.map((service) => (
            <View key={service.id} style={styles.rowCard}>
              <View style={styles.rowTop}>
                <Text style={styles.rowTitle}>{service.name}</Text>
                <Text style={styles.rowPrice}>{formatMoney(service.price, service.currency)}</Text>
              </View>
              <Text style={styles.rowMeta}>{service.durationMin} dk</Text>
              {service.description ? (
                <Text style={styles.rowDesc}>{service.description}</Text>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uzman Kadro</Text>
          {clinic.doctors.map((doctor) => (
            <Pressable
              key={doctor.id}
              style={styles.rowCard}
              onPress={() => router.push(`/client/doctors/${doctor.id}`)}
            >
              <View style={styles.rowTop}>
                <Text style={styles.rowTitle}>{doctor.fullName}</Text>
                <Ionicons name="chevron-forward" size={16} color="#6A7A95" />
              </View>
              <Text style={styles.rowMeta}>{doctor.specialty ?? 'Uzmanlik bilgisi yakinda eklenecek'}</Text>
              <Text style={styles.rowDesc} numberOfLines={2}>
                {doctor.story}
              </Text>
              <View style={styles.doctorMetrics}>
                <Text style={styles.doctorMetric}>
                  Puan: {formatScore(doctor.reviews.averageRating)} ({doctor.reviews.reviewCount})
                </Text>
                <Text style={styles.doctorMetric}>
                  Bugun musait: {doctor.nextSlots.length > 0 ? doctor.nextSlots[0].startTime : 'Yok'}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {clinic.patientVoice.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Son Hasta Yorumlari</Text>
            {clinic.patientVoice.slice(0, 4).map((review) => (
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
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  container: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: palette.danger },
  hero: {
    borderRadius: radii.lg,
    backgroundColor: palette.heroMid,
    padding: spacing.lg,
    gap: 8,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  meta: { color: '#96F5EA', fontWeight: '700' },
  heroBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
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
  badgeText: { color: '#D4E1F6', fontSize: 12, fontWeight: '600' },
  address: { color: '#C6D7F1', fontSize: 12 },
  story: { color: '#D4E1F6', lineHeight: 19 },
  section: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    padding: spacing.md,
    gap: 8,
    ...shadows.card,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: palette.text },
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
  ratingHeadline: { color: palette.text, fontWeight: '700' },
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
  approachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approachText: { color: '#415575', lineHeight: 20, flex: 1 },
  rowCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    padding: 10,
    gap: 4,
    backgroundColor: '#FFFFFF',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowTitle: { fontWeight: '700', color: palette.text, flex: 1 },
  rowPrice: { color: palette.primaryDark, fontWeight: '700', fontSize: 12 },
  rowMeta: { color: '#475A79', fontSize: 12 },
  rowDesc: { color: '#6A7A95', fontSize: 12, lineHeight: 17 },
  doctorMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  doctorMetric: {
    color: '#415575',
    fontSize: 11,
    borderWidth: 1,
    borderColor: '#DBE8F8',
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: palette.surfaceSoft,
  },
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
})
