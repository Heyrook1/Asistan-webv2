import { useCallback, useEffect, useState } from 'react'
import { type Href, useRouter } from 'expo-router'
import { ScrollView, View } from 'react-native'
import { BrandLogo } from '@/components/brand-logo'
import {
  AppButton,
  AppCard,
  AppInput,
  AppText,
  Screen,
  SectionHeader,
  Skeleton,
} from '@/components/ui'
import { apiGet, apiPut } from '@/lib/api'
import { useSessionContext } from '@/lib/session-context'
import { useAppTheme } from '@/lib/use-app-theme'

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
  const theme = useAppTheme()
  const { signOut } = useSessionContext()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

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
    setSaved(false)
    try {
      await apiPut('/api/client/profile', {
        fullName,
        phone: phone || null,
        email: email || null,
        address: address || null,
        city: city || null,
      })
      setSaved(true)
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
      <Screen>
        <View style={{ padding: theme.spacing.md, gap: theme.spacing.sm }}>
          <Skeleton height={120} />
          <Skeleton height={180} />
          <Skeleton height={140} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 120, gap: theme.spacing.sm }}>
        <View
          style={{
            borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.heroMid,
            padding: theme.spacing.lg,
            gap: 4,
          }}
        >
          <BrandLogo variant="light" height={28} />
          <AppText variant="title" color="#FFFFFF">
            Profil
          </AppText>
          <AppText variant="caption" color="#BCD1EF">
            Hesap, iletişim ve bildirimler
          </AppText>
        </View>

        <AppCard>
          <SectionHeader title="Kişisel bilgiler" />
          <AppInput label="Ad Soyad" value={fullName} onChangeText={setFullName} />
          <AppInput label="Telefon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <AppInput label="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" />
        </AppCard>

        <AppCard>
          <SectionHeader title="Adres bilgileri" />
          <AppInput label="Adres" value={address} onChangeText={setAddress} />
          <AppInput label="Şehir" value={city} onChangeText={setCity} />
        </AppCard>

        {error ? (
          <AppText variant="caption" color={theme.colors.danger}>
            {error}
          </AppText>
        ) : null}
        {saved ? (
          <AppText variant="caption" color={theme.colors.success}>
            Profil kaydedildi — bir sonraki randevuda bu bilgiler kullanılır.
          </AppText>
        ) : null}

        <AppButton label="Kaydet" loading={saving} onPress={saveProfile} />
        <AppButton label="Bildirimler" variant="secondary" onPress={() => router.push('/client/notifications' as Href)} />
        <AppButton label="Asistan pasaportu" variant="secondary" onPress={() => router.push('/client/health' as Href)} />
        <AppButton label="Konum ayarı" variant="secondary" onPress={() => router.push('/client/onboarding' as Href)} />
        <AppButton label="Çıkış yap" variant="ghost" onPress={handleSignOut} />
      </ScrollView>
    </Screen>
  )
}
