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

export default function SignUpScreen() {
  const router = useRouter()
  const { signUp } = useSessionContext()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignUp() {
    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName || !trimmedEmail || !password) {
      setError('Ad, e-posta ve sifre zorunlu.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await signUp(trimmedEmail, password, trimmedName)
      router.replace('/client/onboarding')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Kayit basarisiz'
      setError(message)
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
            <Text style={styles.heroTitle}>Dakikalar icinde baslayin</Text>
            <Text style={styles.heroSubtitle}>Hesabini olustur, konumunu sec ve uygun saatleri gor.</Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.title}>Yeni Hesap</Text>
            <Text style={styles.subtitle}>Asistan Rezervasyon ile kaydını tamamla</Text>

            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              placeholder="Ad Soyad"
              placeholderTextColor="#94a3b8"
            />
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

            <Pressable style={styles.button} disabled={loading} onPress={handleSignUp}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Kayit Ol</Text>
              )}
            </Pressable>

            <Link href="/(auth)/login" asChild>
              <Pressable style={styles.linkWrap}>
                <Text style={styles.link}>Zaten hesabin var mi? Giris yap</Text>
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
    backgroundColor: palette.heroMid,
    gap: spacing.sm,
  },
  heroTitle: {
    marginTop: spacing.sm,
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    color: '#C0D4F0',
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
