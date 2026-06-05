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
  View,
} from 'react-native'
import { apiGet, apiPatch } from '@/lib/api'
import { palette, radii, shadows, spacing } from '@/lib/theme'

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
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bildirimler</Text>
          <Text style={styles.subtitle}>Yeni gelismeleri aninda takip et</Text>
        </View>
        <Pressable onPress={markAllRead} style={styles.markAllBtn}>
          <Ionicons name="checkmark-done-outline" size={14} color={palette.accent} />
          <Text style={styles.markAll}>Tumunu okundu yap</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} />}
          renderItem={({ item }) => (
            <View style={[styles.card, !item.isRead && styles.cardUnread]}>
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, !item.isRead && styles.iconWrapUnread]}>
                  <Ionicons
                    name={item.isRead ? 'notifications-outline' : 'notifications'}
                    size={15}
                    color={item.isRead ? '#64748B' : palette.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMessage}>{item.message}</Text>
                </View>
              </View>
              <Text style={styles.cardTime}>{new Date(item.createdAt).toLocaleString('tr-TR')}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>Yeni bildiriminiz yok.</Text>
            </View>
          }
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
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    backgroundColor: palette.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: { fontSize: 22, fontWeight: '700', color: palette.text },
  subtitle: { color: palette.textMuted, fontSize: 13 },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#BCD6FF',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F5F9FF',
  },
  markAll: { color: palette.accent, fontWeight: '700', fontSize: 12 },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: palette.surface,
    gap: 8,
    ...shadows.card,
  },
  cardUnread: {
    borderColor: '#B7F3E7',
    backgroundColor: '#F2FFFB',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: '#F4F7FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapUnread: {
    backgroundColor: '#E7FBF7',
  },
  cardTitle: { fontWeight: '700', color: palette.text, marginBottom: 3 },
  cardMessage: { color: '#334762', lineHeight: 19 },
  cardTime: { color: '#6A7A95', fontSize: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: palette.danger, textAlign: 'center' },
  empty: { color: palette.textMuted },
})
