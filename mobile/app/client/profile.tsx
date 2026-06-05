import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { BrandLogo } from '@/components/brand-logo'
import { apiGet, apiPut } from '@/lib/api'
import { useSessionContext } from '@/lib/session-context'
import { palette, radii, shadows, spacing } from '@/lib/theme'

type ProfileResponse = {
  profile: {
    fullName: string
    phone: string | null
    email: string | null
    address: string | null
    city: string | null
  } | null
}

export default function ClientProfileScreen() {
  const router = useRouter()
  const { signOut } = useSessionContext()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiGet<ProfileResponse>('/api/client/profile')
      const profile = response.profile
      if (profile) {
        setFullName(profile.fullName ?? '')
        setPhone(profile.phone ?? '')
        setEmail(profile.email ?? '')
        setAddress(profile.address ?? '')
        setCity(profile.city ?? '')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Profil yuklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function saveProfile() {
    setSaving(true)
    setError(null)
    try {
      await apiPut('/api/client/profile', {
        fullName,
        phone: phone || null,
        email: email || null,
        address: address || null,
        city: city || null,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Profil kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    router.replace('/(auth)/login')
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <BrandLogo variant="light" height={28} />
          <Text style={styles.title}>Profil</Text>
          <Text style={styles.subtitle}>Hesap ve iletisim bilgilerini yonetin</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Kisisel Bilgiler</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Ad Soyad" />
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Telefon" />
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="E-posta" autoCapitalize="none" />
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Adres Bilgileri</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Adres" />
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Sehir" />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.primary} onPress={saveProfile} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={16} color="#FFFFFF" />
              <Text style={styles.primaryText}>Kaydet</Text>
            </>
          )}
        </Pressable>

        <Pressable style={styles.secondary} onPress={() => router.push('/client/onboarding')}>
          <Ionicons name="location-outline" size={16} color={palette.accent} />
          <Text style={styles.secondaryText}>Konum Ayari</Text>
        </Pressable>

        <Pressable style={styles.logout} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={16} color={palette.danger} />
          <Text style={styles.logoutText}>Cikis Yap</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  hero: {
    backgroundColor: palette.heroMid,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: 4,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { color: '#BCD1EF', fontSize: 13 },
  panel: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.text,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: palette.surfaceSoft,
    color: palette.text,
  },
  error: { color: palette.danger, marginTop: 4 },
  primary: {
    height: 46,
    borderRadius: radii.md,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    flexDirection: 'row',
    gap: 8,
  },
  primaryText: { color: '#ffffff', fontWeight: '700' },
  secondary: {
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#BCD6FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F9FF',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryText: { color: palette.accent, fontWeight: '700' },
  logout: {
    marginTop: 4,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#F7C2C8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F6',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: { color: palette.danger, fontWeight: '700' },
})
