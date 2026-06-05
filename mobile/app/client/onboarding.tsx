import { useState } from 'react'
import { useRouter } from 'expo-router'
import * as Location from 'expo-location'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { BrandLogo } from '@/components/brand-logo'
import { apiPut } from '@/lib/api'
import { palette, radii, shadows, spacing } from '@/lib/theme'

export default function ClientOnboardingScreen() {
  const router = useRouter()
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function saveManualCity() {
    if (!city.trim()) {
      setError('Lutfen sehir bilgisi girin.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await apiPut('/api/client/profile', { city: city.trim() })
      router.replace('/client/search')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Konum kaydedilemedi')
    } finally {
      setLoading(false)
    }
  }

  async function useDeviceLocation() {
    setLoading(true)
    setError(null)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setError('Konum izni verilmedi. Sehir secerek devam edebilirsiniz.')
        return
      }
      const position = await Location.getCurrentPositionAsync({})
      await apiPut('/api/client/profile', {
        locationLat: position.coords.latitude,
        locationLng: position.coords.longitude,
      })
      router.replace('/client/search')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Konum alinamadi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <BrandLogo variant="light" height={34} />
          <Text style={styles.title}>Size yakin klinikleri bulalim</Text>
          <Text style={styles.subtitle}>
            Konum izni verirseniz yakin doktorlari one cikaririz.
          </Text>
        </View>

        <View style={styles.panel}>
          <Pressable style={styles.primaryButton} onPress={useDeviceLocation} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="locate-outline" size={16} color="#FFFFFF" />
                <Text style={styles.primaryText}>Konumumu Kullan</Text>
              </>
            )}
          </Pressable>

          <Text style={styles.separator}>veya</Text>

          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Sehir (or: Lefkosa)"
            placeholderTextColor="#94a3b8"
          />
          <Pressable style={styles.secondaryButton} onPress={saveManualCity} disabled={loading}>
            <Ionicons name="business-outline" size={16} color={palette.accent} />
            <Text style={styles.secondaryText}>Sehir ile Devam Et</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  hero: {
    borderRadius: radii.lg,
    backgroundColor: palette.heroMid,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
  },
  subtitle: {
    color: '#BCD1EF',
    fontSize: 14,
    lineHeight: 20,
  },
  panel: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  primaryButton: {
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
    flexDirection: 'row',
    gap: 8,
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  separator: {
    textAlign: 'center',
    color: '#6B7B96',
    marginVertical: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: palette.text,
  },
  secondaryButton: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#BCD6FF',
    height: 46,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F9FF',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryText: {
    color: palette.accent,
    fontWeight: '700',
  },
  error: {
    marginTop: 8,
    color: palette.danger,
    textAlign: 'center',
  },
})
