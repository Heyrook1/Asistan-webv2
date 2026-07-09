import { useCallback, useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { FlatList, Pressable, RefreshControl, View } from 'react-native'
import { AppCard, AppText, EmptyState, Screen, ScreenHeader, Skeleton } from '@/components/ui'
import { apiGet, apiPatch } from '@/lib/api'
import { useAppTheme } from '@/lib/use-app-theme'

type NotificationItem = {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

type NotificationsResponse = { notifications: NotificationItem[] }

export default function ClientNotificationsScreen() {
  const theme = useAppTheme()
  const [rows, setRows] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true)
    if (mode === 'refresh') setRefreshing(true)
    setError(null)
    try {
      const response = await apiGet<NotificationsResponse>('/api/client/notifications')
      setRows(response.notifications)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bildirimler yuklenemedi')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function markAllRead() {
    try {
      await apiPatch('/api/client/notifications', { all: true })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bildirimler guncellenemedi')
    }
  }

  return (
    <Screen>
      <ScreenHeader
        title="Bildirimler"
        subtitle="Yeni gelismeleri aninda takip et"
        rightSlot={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tum bildirimleri okundu yap"
            onPress={markAllRead}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.pill,
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: theme.colors.surfaceSoft,
            }}
          >
            <Ionicons name="checkmark-done-outline" size={14} color={theme.colors.secondary} />
            <AppText variant="micro" color={theme.colors.secondary}>
              Tumunu oku
            </AppText>
          </Pressable>
        }
      />

      {loading ? (
        <View style={{ padding: theme.spacing.md, gap: theme.spacing.sm }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <AppCard key={`notification-skeleton-${index}`}>
              <Skeleton height={14} width="40%" />
              <Skeleton height={12} width="90%" style={{ marginTop: theme.spacing.sm }} />
            </AppCard>
          ))}
        </View>
      ) : error ? (
        <EmptyState
          icon="warning-outline"
          title="Bildirimler yuklenemedi"
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
              icon="notifications-outline"
              title="Yeni bildiriminiz yok"
              description="Randevu ve klinik guncellemeleri burada gorunecek."
            />
          }
          renderItem={({ item }) => (
            <AppCard
              style={{
                borderColor: item.isRead ? theme.colors.border : theme.colors.primary,
                backgroundColor: item.isRead ? theme.colors.surface : theme.colors.successSoft,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: theme.radii.sm,
                    backgroundColor: item.isRead ? theme.colors.surfaceSoft : theme.colors.primarySoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name={item.isRead ? 'notifications-outline' : 'notifications'}
                    size={15}
                    color={item.isRead ? theme.colors.textMuted : theme.colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="subtitle">{item.title}</AppText>
                  <AppText variant="body" color={theme.colors.textMuted} style={{ marginTop: 2 }}>
                    {item.message}
                  </AppText>
                </View>
              </View>
              <AppText variant="micro" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.xs }}>
                {new Date(item.createdAt).toLocaleString('tr-TR')}
              </AppText>
            </AppCard>
          )}
        />
      )}
    </Screen>
  )
}
