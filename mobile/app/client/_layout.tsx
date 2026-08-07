import { Redirect, Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Platform } from 'react-native'
import { useSessionContext } from '@/lib/session-context'
import { useAppTheme } from '@/lib/use-app-theme'

export default function ClientLayout() {
  const { loading, isAuthenticated } = useSessionContext()
  const theme = useAppTheme()

  if (loading) return null
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 1,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: Platform.OS === 'ios' ? 18 : 12,
          borderTopColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: theme.dark ? 'rgba(16, 32, 56, 0.96)' : 'rgba(255, 255, 255, 0.94)',
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
          borderRadius: theme.radii.xl,
          ...theme.elevations.glass,
        },
        tabBarItemStyle: {
          borderRadius: theme.radii.lg,
          marginHorizontal: 2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="search"
        options={{
          title: 'Keşfet',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Randevular',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'Pasaport',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="clinics/[id]" options={{ href: null }} />
      <Tabs.Screen name="doctors/[id]" options={{ href: null }} />
      <Tabs.Screen name="book/[doctorId]" options={{ href: null }} />
    </Tabs>
  )
}
