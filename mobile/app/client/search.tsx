import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { BrandLogo } from '@/components/brand-logo'
import { apiGet } from '@/lib/api'
import { palette, radii, shadows, spacing } from '@/lib/theme'
import type { DiscoveryItem } from '@/lib/types'

type SearchResponse = { items: DiscoveryItem[] }

function formatPrice(price: number | null) {
  if (price == null) return '-'
  return `${price} TRY`
}

function formatDateLabel(value: string | null) {
  if (!value) return 'Musait saat bilgisi yok'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Musait saat bilgisi yok'
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function parseAttemptedAddresses(errorMessage: string | null) {
  if (!errorMessage) return null
  const match = errorMessage.match(/Denenen adresler:\s*([^.]*)\./i)
  return match?.[1]?.trim() || null
}

export default function ClientSearchScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'nearest' | 'highest-rated' | 'earliest-available' | 'most-reviewed'>('nearest')
  const [availableToday, setAvailableToday] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [items, setItems] = useState<DiscoveryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isBackendUnavailable = Boolean(error?.includes('Backend ulasilamaz durumda'))
  const attemptedAddresses = useMemo(() => parseAttemptedAddresses(error), [error])

  const searchParams = useMemo(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('query', query.trim())
    params.set('sort', sort)
    if (availableToday) params.set('availableToday', 'true')
    return params.toString()
  }, [query, sort, availableToday])

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') setLoading(true)
      if (mode === 'refresh') setRefreshing(true)
      setError(null)
      try {
        const response = await apiGet<SearchResponse>(`/api/client/search?${searchParams}`)
        setItems(response.items)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Klinik aramasi basarisiz')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [searchParams]
  )

  useEffect(() => {
    load()
  }, [load])

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <BrandLogo variant="light" height={30} />
        <Text style={styles.heroTitle}>Kendine en uygun doktoru bul</Text>
        <Text style={styles.heroSubtitle}>Konumuna ve degerlendirmelere gore hizli secim yap.</Text>
      </View>

      <View style={styles.headerCard}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="#6A7A95" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Doktor, klinik veya uzmanlik ara"
            placeholderTextColor="#94a3b8"
            style={styles.search}
            onSubmitEditing={() => load()}
          />
        </View>

        <View style={styles.segment}>
          <Pressable
            style={[styles.segmentItem, viewMode === 'list' && styles.segmentItemActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name={viewMode === 'list' ? 'list' : 'list-outline'}
              size={16}
              color={viewMode === 'list' ? '#FFFFFF' : '#5A6A85'}
            />
            <Text style={[styles.segmentText, viewMode === 'list' && styles.segmentTextActive]}>Liste</Text>
          </Pressable>
          <Pressable
            style={[styles.segmentItem, viewMode === 'map' && styles.segmentItemActive]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons
              name={viewMode === 'map' ? 'map' : 'map-outline'}
              size={16}
              color={viewMode === 'map' ? '#FFFFFF' : '#5A6A85'}
            />
            <Text style={[styles.segmentText, viewMode === 'map' && styles.segmentTextActive]}>Harita</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <Pressable
            style={[styles.chip, sort === 'nearest' && styles.chipActive]}
            onPress={() => setSort('nearest')}
          >
            <Text style={[styles.chipText, sort === 'nearest' && styles.chipTextActive]}>En yakin</Text>
          </Pressable>
          <Pressable
            style={[styles.chip, sort === 'highest-rated' && styles.chipActive]}
            onPress={() => setSort('highest-rated')}
          >
            <Text style={[styles.chipText, sort === 'highest-rated' && styles.chipTextActive]}>En iyi puan</Text>
          </Pressable>
          <Pressable
            style={[styles.chip, sort === 'most-reviewed' && styles.chipActive]}
            onPress={() => setSort('most-reviewed')}
          >
            <Text style={[styles.chipText, sort === 'most-reviewed' && styles.chipTextActive]}>Cok yorum</Text>
          </Pressable>
          <Pressable
            style={[styles.chip, availableToday && styles.chipActive]}
            onPress={() => setAvailableToday((value) => !value)}
          >
            <Text style={[styles.chipText, availableToday && styles.chipTextActive]}>Bugun musait</Text>
          </Pressable>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>
            {isBackendUnavailable ? 'API sunucusuna baglanilamadi.' : 'Bir hata olustu.'}
          </Text>
          <Text style={styles.error}>
            {isBackendUnavailable
              ? '`mobile` klasorunden `npm.cmd run web:full` (veya kokten `npm.cmd run mobile:web:full`) komutunu calistirin, sonra tekrar deneyin.'
              : error}
          </Text>
          {isBackendUnavailable ? (
            <View style={styles.helpBox}>
              <Text style={styles.helpLine}>
                `mobile` klasoru: `npm.cmd run web:full`
              </Text>
              <Text style={styles.helpLine}>
                Kok klasor: `npm.cmd run mobile:web:full`
              </Text>
              {attemptedAddresses ? (
                <Text style={styles.helpMeta}>Denenen adresler: {attemptedAddresses}</Text>
              ) : null}
            </View>
          ) : null}
          <Pressable style={styles.retry} onPress={() => load()}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </Pressable>
        </View>
      ) : viewMode === 'map' ? (
        <View style={styles.center}>
          <View style={styles.mapIconWrap}>
            <Ionicons name="map-outline" size={26} color={palette.primary} />
          </View>
          <Text style={styles.emptyTitle}>Harita Gorunumu</Text>
          <Text style={styles.emptySubtitle}>Harita modulu hazirlaniyor, liste ile devam edebilirsin.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `${item.businessId}-${item.doctorId}`}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} />}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/client/doctors/${item.doctorId}`)}
            >
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={18} color={palette.primary} />
                </View>
                <View style={styles.cardTopContent}>
                  <Text style={styles.cardTitle}>{item.doctorName}</Text>
                  <Text style={styles.cardSubtitle}>
                    {item.specialty ?? 'Uzmanlik belirtilmedi'} - {item.businessName}
                  </Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {item.ratingAverage ? item.ratingAverage.toFixed(1) : '-'}
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Fiyat</Text>
                <Text style={styles.metaValue}>{formatPrice(item.minPrice)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Yorum</Text>
                <Text style={styles.metaValue}>{item.reviewCount}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Sonraki saat</Text>
                <Text style={styles.metaValue}>{formatDateLabel(item.nextAvailableAt)}</Text>
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  style={styles.secondaryAction}
                  onPress={() => router.push(`/client/clinics/${item.businessId}`)}
                >
                  <Ionicons name="business-outline" size={14} color={palette.accent} />
                  <Text style={styles.secondaryActionText}>Klinik</Text>
                </Pressable>
                <Pressable
                  style={styles.primaryAction}
                  onPress={() =>
                    router.push({
                      pathname: '/client/book/[doctorId]',
                      params: { doctorId: item.doctorId },
                    })
                  }
                >
                  <Ionicons name="calendar-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.primaryActionText}>Randevu Al</Text>
                </Pressable>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>Sonuc bulunamadi</Text>
              <Text style={styles.emptySubtitle}>Filtreleri degistirip tekrar deneyin.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  hero: {
    backgroundColor: palette.heroDark,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  heroTitle: {
    marginTop: 6,
    fontSize: 23,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    color: '#B8CBE8',
    fontSize: 13,
  },
  headerCard: {
    marginHorizontal: spacing.md,
    marginTop: -16,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    gap: spacing.sm,
    ...shadows.floating,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceSoft,
    paddingHorizontal: 12,
  },
  search: {
    flex: 1,
    paddingVertical: 11,
    color: palette.text,
    fontSize: 14,
  },
  segment: {
    borderRadius: radii.md,
    backgroundColor: palette.primarySoft,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    height: 34,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segmentItemActive: {
    backgroundColor: palette.accent,
  },
  segmentText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  filterRow: {
    gap: 8,
    paddingRight: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: palette.surface,
  },
  chipActive: {
    borderColor: palette.primary,
    backgroundColor: palette.successSoft,
  },
  chipText: { color: palette.textMuted, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: palette.primaryDark },
  listContent: {
    padding: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTopContent: {
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFF7E5',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  cardSubtitle: { color: palette.textMuted, fontSize: 12 },
  ratingText: { color: '#B45309', fontSize: 12, fontWeight: '700' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  metaLabel: { color: palette.textMuted, fontSize: 12 },
  metaValue: { color: palette.text, fontSize: 12, fontWeight: '600' },
  cardActions: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#BFD7FF',
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    height: 38,
    backgroundColor: '#F4F9FF',
  },
  secondaryActionText: { color: palette.accent, fontWeight: '700', fontSize: 13 },
  primaryAction: {
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    height: 38,
  },
  primaryActionText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorTitle: { color: palette.danger, textAlign: 'center', fontWeight: '700', marginBottom: 6 },
  error: { color: palette.text, textAlign: 'center', lineHeight: 20 },
  helpBox: {
    marginTop: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    gap: 6,
  },
  helpLine: { color: palette.textMuted, fontSize: 12, lineHeight: 18 },
  helpMeta: { color: palette.textMuted, fontSize: 11, lineHeight: 16 },
  retry: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  retryText: { color: palette.primary, fontWeight: '700' },
  mapIconWrap: {
    width: 54,
    height: 54,
    borderRadius: radii.lg,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: palette.text },
  emptySubtitle: { marginTop: 6, color: palette.textMuted, textAlign: 'center', lineHeight: 19 },
})
