import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { BrandLogo } from '@/components/brand-logo'
import {
  AppButton,
  AppCard,
  AppText,
  Badge,
  Chip,
  EmptyState,
  FloatingActionButton,
  SearchField,
  SectionHeader,
  Skeleton,
} from '@/components/ui'
import { apiGet } from '@/lib/api'
import { useAppTheme } from '@/lib/use-app-theme'
import { palette } from '@/lib/theme'
import type { DiscoveryItem } from '@/lib/types'

type SearchResponse = { items: DiscoveryItem[] }

type MobileSearchPref = {
  sort?: 'nearest' | 'highest-rated' | 'earliest-available' | 'most-reviewed'
  availableToday?: boolean
  viewMode?: 'list' | 'map'
}

const MOBILE_SEARCH_PREF_KEY = 'asistan.mobile-search.v1'

function formatPrice(price: number | null) {
  if (price == null) return '-'
  return `${price} TRY`
}

function formatDateLabel(value: string | null) {
  if (!value) return 'Müsait saat bilgisi yok'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Müsait saat bilgisi yok'
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
  const theme = useAppTheme()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'nearest' | 'highest-rated' | 'earliest-available' | 'most-reviewed'>('highest-rated')
  const [availableToday, setAvailableToday] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [prefsReady, setPrefsReady] = useState(false)
  const [items, setItems] = useState<DiscoveryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isBackendUnavailable = Boolean(error?.includes('Backend ulasilamaz durumda'))
  const attemptedAddresses = useMemo(() => parseAttemptedAddresses(error), [error])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(MOBILE_SEARCH_PREF_KEY)
        if (raw && !cancelled) {
          const saved = JSON.parse(raw) as MobileSearchPref
          if (saved.sort) setSort(saved.sort)
          if (typeof saved.availableToday === 'boolean') setAvailableToday(saved.availableToday)
          if (saved.viewMode === 'list' || saved.viewMode === 'map') setViewMode(saved.viewMode)
        }
      } catch {
        // ignore corrupt prefs
      } finally {
        if (!cancelled) setPrefsReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!prefsReady) return
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => {
      void AsyncStorage.setItem(
        MOBILE_SEARCH_PREF_KEY,
        JSON.stringify({ sort, availableToday, viewMode } satisfies MobileSearchPref),
      )
    }, 200)
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current)
    }
  }, [availableToday, prefsReady, sort, viewMode])

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
    if (!prefsReady) return
    load()
  }, [load, prefsReady])

  const now = useMemo(
    () =>
      new Date().toLocaleDateString('tr-TR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      }),
    []
  )
  const topRecommended = items.slice(0, 4)
  const featuredClinics = useMemo(() => {
    const map = new Map<string, { id: string; name: string; reviewCount: number }>()
    for (const item of items) {
      if (!map.has(item.businessId)) {
        map.set(item.businessId, { id: item.businessId, name: item.businessName, reviewCount: item.reviewCount ?? 0 })
      }
    }
    return Array.from(map.values()).slice(0, 5)
  }, [items])

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={viewMode === 'list' ? items : []}
        keyExtractor={(item) => `${item.businessId}-${item.doctorId}`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} tintColor={theme.colors.primary} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={[styles.hero, { backgroundColor: theme.colors.heroDark }]}>
              <BrandLogo variant="light" height={28} />
              <Badge label={now} tone="info" />
              <AppText variant="hero" color={theme.colors.textInverse}>
                Asistan
              </AppText>
              <AppText variant="body" color="#BCD1EF">
                Doğru kliniği bulun. Randevunuzu kolayca alın — KKTC’de klinik, hizmet ve gerçek
                müsaitlik.
              </AppText>
            </View>

            <View style={[styles.headerCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <SearchField
                value={query}
                onChangeText={setQuery}
                placeholder="Doktor, klinik veya uzmanlık ara"
                onSubmit={() => load()}
              />

              <View style={styles.segment}>
                <Chip label="Liste" selected={viewMode === 'list'} onPress={() => setViewMode('list')} />
                <Chip label="Harita" selected={viewMode === 'map'} onPress={() => setViewMode('map')} />
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                <Chip label="Onerilen" selected={sort === 'highest-rated'} onPress={() => setSort('highest-rated')} />
                <Chip label="Erken saat" selected={sort === 'earliest-available'} onPress={() => setSort('earliest-available')} />
                <Chip label="Cok yorum" selected={sort === 'most-reviewed'} onPress={() => setSort('most-reviewed')} />
                <Chip label="Bugun musait" selected={availableToday} onPress={() => setAvailableToday((v) => !v)} />
              </ScrollView>
            </View>

            <View style={styles.sectionWrap}>
              <SectionHeader title="Hizli islem" subtitle="Randevu olusturmayi hizlandir" />
              <View style={styles.quickRow}>
                <AppButton label="Randevularim" variant="secondary" onPress={() => router.push('/client/appointments')} style={{ flex: 1 }} />
                <AppButton label="Bildirimler" variant="ghost" onPress={() => router.push('/client/notifications')} style={{ flex: 1 }} />
              </View>
            </View>

            {!loading && !error ? (
              <View style={styles.sectionWrap}>
                <SectionHeader title="One cikan doktorlar" subtitle="Puan ve yorumlara gore secildi" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
                  {topRecommended.map((item) => (
                    <AppCard key={`featured-${item.doctorId}`} style={styles.miniDoctorCard}>
                      <View style={styles.cardTop}>
                        <View style={[styles.avatar, { backgroundColor: theme.colors.primarySoft }]}>
                          <Ionicons name="person" size={18} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <AppText variant="caption">{item.doctorName}</AppText>
                          <AppText variant="micro" color={theme.colors.textMuted}>
                            {item.specialty ?? 'Uzmanlik'}
                          </AppText>
                        </View>
                      </View>
                      <AppText variant="micro" color={theme.colors.textMuted} numberOfLines={1}>
                        {item.businessName}
                      </AppText>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${item.doctorName} icin hizli randevu`}
                        style={styles.quickCta}
                        onPress={() => router.push({ pathname: '/client/book/[doctorId]', params: { doctorId: item.doctorId } })}
                      >
                        <Ionicons name="flash-outline" size={13} color="#FFFFFF" />
                        <AppText variant="micro" color="#FFFFFF">
                          Hizli Randevu
                        </AppText>
                      </Pressable>
                    </AppCard>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {!loading && !error && featuredClinics.length > 0 ? (
              <View style={styles.sectionWrap}>
                <SectionHeader title="Klinikler" subtitle="Son goruntulenen bolgen icin" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
                  {featuredClinics.map((clinic) => (
                    <AppCard key={clinic.id} style={styles.clinicCard}>
                      <AppText variant="caption" numberOfLines={1}>
                        {clinic.name}
                      </AppText>
                      <AppText variant="micro" color={theme.colors.textMuted}>
                        {clinic.reviewCount} degerlendirme
                      </AppText>
                      <AppButton label="Klinige git" variant="secondary" onPress={() => router.push(`/client/clinics/${clinic.id}`)} />
                    </AppCard>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <AppCard style={{ marginBottom: theme.spacing.sm }}>
            <Pressable accessibilityRole="button" onPress={() => router.push(`/client/doctors/${item.doctorId}`)}>
              <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primarySoft }]}>
                  <Ionicons name="person" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.cardTopContent}>
                  <AppText variant="subtitle">{item.doctorName}</AppText>
                  <AppText variant="caption" color={theme.colors.textMuted}>
                    {item.specialty ?? 'Uzmanlik belirtilmedi'} - {item.businessName}
                  </AppText>
                </View>
                <Badge
                  label={item.ratingAverage ? `${item.ratingAverage.toFixed(1)} Puan` : 'Yeni'}
                  tone={item.ratingAverage ? 'warning' : 'info'}
                />
              </View>

              <View style={styles.metaRow}>
                <AppText variant="micro" color={theme.colors.textMuted}>
                  Fiyat
                </AppText>
                <AppText variant="caption">{formatPrice(item.minPrice)}</AppText>
              </View>
              <View style={styles.metaRow}>
                <AppText variant="micro" color={theme.colors.textMuted}>
                  Yorum
                </AppText>
                <AppText variant="caption">{item.reviewCount}</AppText>
              </View>
              <View style={styles.metaRow}>
                <AppText variant="micro" color={theme.colors.textMuted}>
                  Sonraki saat
                </AppText>
                <AppText variant="caption">{formatDateLabel(item.nextAvailableAt)}</AppText>
              </View>
            </Pressable>

            <View style={styles.cardActions}>
              <AppButton label="Klinik" variant="ghost" onPress={() => router.push(`/client/clinics/${item.businessId}`)} style={{ flex: 1 }} />
              <AppButton
                label="Randevu Al"
                onPress={() => router.push({ pathname: '/client/book/[doctorId]', params: { doctorId: item.doctorId } })}
                style={{ flex: 1 }}
              />
            </View>
          </AppCard>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletonWrap}>
              {Array.from({ length: 4 }).map((_, index) => (
                <AppCard key={`skeleton-${index}`} style={{ marginBottom: theme.spacing.sm }}>
                  <Skeleton height={18} width="45%" />
                  <Skeleton height={12} width="70%" style={{ marginTop: theme.spacing.sm }} />
                  <Skeleton height={38} width="100%" style={{ marginTop: theme.spacing.md }} />
                </AppCard>
              ))}
            </View>
          ) : error ? (
            <EmptyState
              icon="warning-outline"
              title={isBackendUnavailable ? 'API baglantisi kurulamadi' : 'Bir hata olustu'}
              description={
                isBackendUnavailable
                  ? 'Web API aktif degil. `npm run dev` ile sunucuyu calistirip tekrar deneyin.'
                  : attemptedAddresses
                    ? `${error}\nDenenen adresler: ${attemptedAddresses}`
                    : (error ?? 'Bilinmeyen hata')
              }
              primaryActionLabel="Tekrar Dene"
              onPrimaryAction={() => load()}
            />
          ) : viewMode === 'map' ? (
            <EmptyState
              icon="map-outline"
              title="Harita görünümü henüz yok"
              description="Harita bir sonraki sürümde gelecek. Şimdilik liste görünümüyle klinik arayabilirsiniz."
              primaryActionLabel="Listeye dön"
              onPrimaryAction={() => setViewMode('list')}
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title="Sonuç bulunamadı"
              description="Filtreleri sadeleştirip tekrar deneyin. Önerilen sıralama ile tüm klinikleri yeniden listeleyin."
              primaryActionLabel="Filtreleri sıfırla"
              onPrimaryAction={() => {
                setSort('highest-rated')
                setAvailableToday(false)
                setQuery('')
              }}
            />
          )
        }
      />
      <View style={[styles.fabWrap, { bottom: 98 }]}>
        <FloatingActionButton
          icon="sparkles"
          accessibilityLabel="Bildirimleri ac"
          onPress={() => router.push('/client/notifications')}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 8,
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: -14,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  segment: {
    flexDirection: 'row',
    gap: 8,
  },
  filterRow: {
    gap: 8,
    paddingRight: 10,
  },
  listContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  sectionWrap: { marginTop: 18 },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  horizontalCards: { gap: 10, paddingTop: 10, paddingRight: 12 },
  miniDoctorCard: { width: 190, gap: 8 },
  clinicCard: { width: 190, gap: 10 },
  quickCta: {
    marginTop: 8,
    borderRadius: 12,
    height: 34,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTopContent: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 3,
    paddingBottom: 3,
  },
  cardActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  skeletonWrap: { marginTop: 14 },
  fabWrap: { position: 'absolute', right: 20 },
})
