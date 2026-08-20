import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFocusEffect, type Href, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Pressable, RefreshControl, ScrollView, View } from 'react-native'
import {
  AppCard,
  AppText,
  Badge,
  EmptyState,
  Screen,
  Skeleton,
} from '@/components/ui'
import { apiGet } from '@/lib/api'
import { appointmentStatusLabel } from '@/lib/status-labels'
import { useSessionContext } from '@/lib/session-context'
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

const STATUS_TONE: Record<AppointmentRow['status'], 'warning' | 'info' | 'success' | 'danger'> = {
  SCHEDULED: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  NO_SHOW: 'danger',
}

function greetingFor(date: Date): string {
  const hour = date.getHours()
  if (hour < 6) return 'İyi geceler'
  if (hour < 12) return 'Günaydın'
  if (hour < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

function firstName(full: string | null | undefined): string | null {
  const trimmed = full?.trim()
  if (!trimmed) return null
  return trimmed.split(/\s+/)[0]
}

const QUICK_ACTIONS: Array<{
  key: string
  label: string
  icon: keyof typeof Ionicons.glyphMap
  href: Href
}> = [
  { key: 'discover', label: 'Klinik bul', icon: 'compass-outline', href: '/client/search' as Href },
  { key: 'appointments', label: 'Randevularım', icon: 'calendar-outline', href: '/client/appointments' as Href },
  { key: 'health', label: 'Sağlık', icon: 'heart-outline', href: '/client/health' as Href },
  { key: 'profile', label: 'Profil', icon: 'person-outline', href: '/client/profile' as Href },
]

export default function ClientHomeScreen() {
  const theme = useAppTheme()
  const router = useRouter()
  const { session } = useSessionContext()
  const [rows, setRows] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const name = firstName(
    (session?.user?.user_metadata?.full_name as string | undefined) ?? session?.user?.email ?? null
  )
  const greeting = greetingFor(new Date())

  const load = useCallback(async (mode: 'initial' | 'refresh' | 'soft' = 'initial') => {
    if (mode === 'initial') setLoading(true)
    if (mode === 'refresh') setRefreshing(true)
    if (mode !== 'soft') setError(null)
    try {
      const response = await apiGet<ListResponse>('/api/client/appointments')
      setRows(response.appointments)
    } catch (e) {
      if (mode !== 'soft') {
        setError(e instanceof Error ? e.message : 'Bilgiler yüklenemedi')
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
    }, [load])
  )

  const upcoming = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10)
    return rows
      .filter(
        (row) =>
          (row.status === 'SCHEDULED' || row.status === 'CONFIRMED') && row.date >= todayIso
      )
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))[0] ?? null
  }, [rows])

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 120, gap: theme.spacing.md }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load('refresh')}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={{ gap: 2, marginTop: theme.spacing.xs }}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            {greeting}
          </AppText>
          <AppText variant="hero">{name ? `${name} 👋` : 'Hoş geldiniz'}</AppText>
          <AppText variant="body" color={theme.colors.textMuted}>
            Bugün size nasıl yardımcı olabiliriz?
          </AppText>
        </View>

        {loading ? (
          <AppCard>
            <Skeleton height={16} width="50%" />
            <Skeleton height={12} width="75%" style={{ marginTop: theme.spacing.sm }} />
            <Skeleton height={40} width="100%" style={{ marginTop: theme.spacing.md }} />
          </AppCard>
        ) : upcoming ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Yaklaşan randevunuzu görüntüleyin"
            onPress={() => router.push('/client/appointments' as Href)}
          >
            <AppCard>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <AppText variant="label" color={theme.colors.primary}>
                  YAKLAŞAN RANDEVU
                </AppText>
                <Badge label={appointmentStatusLabel(upcoming.status)} tone={STATUS_TONE[upcoming.status]} />
              </View>
              <AppText variant="title" style={{ marginTop: theme.spacing.xs }}>
                {upcoming.doctor?.fullName ?? upcoming.service.name}
              </AppText>
              <AppText variant="caption" color={theme.colors.textMuted}>
                {[upcoming.doctor?.specialty, upcoming.clinic.name].filter(Boolean).join(' · ')}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: theme.spacing.sm }}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                <AppText variant="caption">
                  {upcoming.date} · {upcoming.startTime}
                </AppText>
              </View>
              {upcoming.location?.name ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <Ionicons name="location-outline" size={16} color={theme.colors.textMuted} />
                  <AppText variant="caption" color={theme.colors.textMuted}>
                    {upcoming.location.name}
                  </AppText>
                </View>
              ) : null}
            </AppCard>
          </Pressable>
        ) : error ? (
          <EmptyState
            icon="warning-outline"
            title="Bilgiler yüklenemedi"
            description={error}
            primaryActionLabel="Yeniden dene"
            onPrimaryAction={() => void load()}
          />
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="Yaklaşan randevunuz yok"
            description="Hazır olduğunuzda bir doktor bulun ve randevu alın."
            primaryActionLabel="Klinik keşfet"
            onPrimaryAction={() => router.push('/client/search' as Href)}
          />
        )}

        <AppText variant="subtitle">Hızlı işlemler</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.key}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => router.push(action.href)}
              style={{
                flexBasis: '47%',
                flexGrow: 1,
                minHeight: 88,
                borderRadius: theme.radii.lg,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: theme.spacing.md,
                gap: theme.spacing.sm,
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: theme.radii.md,
                  backgroundColor: theme.colors.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={action.icon} size={20} color={theme.colors.primary} />
              </View>
              <AppText variant="caption">{action.label}</AppText>
            </Pressable>
          ))}
        </View>

        <AppCard style={{ backgroundColor: theme.colors.surfaceSoft }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.primary} />
            <AppText variant="caption" color={theme.colors.textMuted} style={{ flex: 1 }}>
              Sağlık bilgileriniz yalnızca sizin izninizle paylaşılır. Asistan pasaportunuzu Sağlık
              sekmesinden görüntüleyin.
            </AppText>
          </View>
        </AppCard>
      </ScrollView>
    </Screen>
  )
}
