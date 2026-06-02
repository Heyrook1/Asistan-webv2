import { useState } from 'react'
import { Link, useRouter } from 'expo-router'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { BrandLogo } from '@/components/brand-logo'
import { useSessionContext } from '@/lib/session-context'
import { palette, radii, shadows, spacing } from '@/lib/theme'

function toLoginErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') return 'Giris basarisiz'

  const message = 'message' in error && typeof error.message === 'string' ? error.message : null
  const code = 'code' in error && typeof error.code === 'string' ? error.code : null
  const status = 'status' in error && typeof error.status === 'number' ? error.status : null

  if (code === 'email_not_confirmed' || message?.toLowerCase().includes('email not confirmed')) {
    return 'E-posta adresi henuz dogrulanmamis.'
  }

  if (message?.toLowerCase().includes('invalid login credentials')) {
    return 'E-posta veya sifre hatali.'
  }

  if (message) {
    return status ? `${message} (HTTP ${status})` : message
  }

  return 'Giris basarisiz'
}

export default function LoginScreen() {
  const router = useRouter()
  const { signIn } = useSessionContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('E-posta ve sifre zorunlu.')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await signIn(trimmedEmail, password)
      router.replace('/client/search')
    } catch (e) {
      setError(toLoginErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <BrandLogo variant="light" height={44} />
            <Text style={styles.heroTitle}>Hizli ve guvenli randevu</Text>
            <Text style={styles.heroSubtitle}>Klinikleri kesfedin, en uygun saati secin.</Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.title}>Giris Yap</Text>
            <Text style={styles.subtitle}>Hesabina baglan ve devam et</Text>

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="E-posta"
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Sifre"
              placeholderTextColor="#94a3b8"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable style={styles.button} disabled={loading} onPress={handleLogin}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Giris Yap</Text>
              )}
            </Pressable>

            <Link href="/(auth)/sign-up" asChild>
              <Pressable style={styles.linkWrap}>
                <Text style={styles.link}>Hesabin yok mu? Kayit ol</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  hero: {
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: palette.heroDark,
    gap: spacing.sm,
  },
  heroTitle: {
    marginTop: spacing.sm,
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    color: '#B6CAE6',
    fontSize: 14,
    lineHeight: 20,
  },
  panel: {
    marginTop: -20,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.floating,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.text,
  },
  subtitle: {
    fontSize: 14,
    color: palette.textMuted,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceSoft,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: palette.text,
    fontSize: 15,
  },
  button: {
    marginTop: 6,
    backgroundColor: palette.primary,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  linkWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  link: {
    color: palette.accent,
    fontWeight: '600',
  },
  error: {
    color: palette.danger,
    fontSize: 13,
  },
})
