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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { BrandLogo } from '@/components/brand-logo'
import { useSessionContext } from '@/lib/session-context'
import { palette, radii, shadows, spacing } from '@/lib/theme'

function toLoginErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') return 'Giriş başarısız'

  const message = 'message' in error && typeof error.message === 'string' ? error.message : null
  const code = 'code' in error && typeof error.code === 'string' ? error.code : null
  const status = 'status' in error && typeof error.status === 'number' ? error.status : null

  if (code === 'email_not_confirmed' || message?.toLowerCase().includes('email not confirmed')) {
    return 'E-posta adresi henüz doğrulanmamış.'
  }

  if (message?.toLowerCase().includes('invalid login credentials')) {
    return 'E-posta veya şifre hatalı.'
  }

  if (message) {
    return status ? `${message} (HTTP ${status})` : message
  }

  return 'Giriş başarısız'
}

export default function LoginScreen() {
  const router = useRouter()
  const { signIn } = useSessionContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  async function handleLogin() {
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('E-posta ve şifre zorunlu.')
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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header Hero Section with background graphics */}
          <View style={styles.hero}>
            {/* Background Medical Graphics */}
            <View style={styles.graphicShieldContainer}>
              <Ionicons name="shield-outline" size={130} color="rgba(255, 255, 255, 0.06)" />
              <Ionicons name="add" size={50} color="rgba(255, 255, 255, 0.06)" style={styles.shieldAddIcon} />
            </View>
            <MaterialCommunityIcons name="heart-pulse" size={100} color="rgba(255, 255, 255, 0.05)" style={styles.pulseIcon} />
            <Ionicons name="calendar-outline" size={60} color="rgba(255, 255, 255, 0.04)" style={styles.calendarIcon} />

            <BrandLogo variant="light" height={36} />
            <Text style={styles.heroTitle}>Hızlı ve güvenli{"\n"}randevu</Text>
            <Text style={styles.heroSubtitle}>Klinikleri keşfedin, en uygun saati seçin.</Text>
          </View>

          {/* Main Login Card Panel */}
          <View style={styles.panel}>
            <Text style={styles.welcomeText}>Hoş geldiniz</Text>
            <Text style={styles.title}>Giriş Yap</Text>
            <Text style={styles.subtitle}>Hesabınıza bağlanarak randevunuzu kolayca oluşturun.</Text>

            {/* Email Input Field */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="E-posta adresiniz"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Password Input Field */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Şifreniz"
                placeholderTextColor="#94a3b8"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
              </Pressable>
            </View>

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.rememberRow}>
              <Pressable style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                <Ionicons
                  name={rememberMe ? "checkbox" : "square-outline"}
                  size={20}
                  color={rememberMe ? "#0FAE9F" : "#94a3b8"}
                />
                <Text style={styles.rememberText}>Beni hatırla</Text>
              </Pressable>
              <Pressable>
                <Text style={styles.forgotText}>Şifremi unuttum?</Text>
              </Pressable>
            </View>

            {/* Error Message */}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Submit Button */}
            <Pressable style={styles.button} disabled={loading} onPress={handleLogin}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Giriş Yap</Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" style={styles.arrowIcon} />
                </>
              )}
            </Pressable>

            {/* "or continue with" Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya devam et</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Biometrics Login Button */}
            <Pressable style={styles.biometricBtn}>
              <Ionicons name="finger-print" size={22} color="#0FAE9F" />
              <Text style={styles.biometricText}>Biyometrik ile giriş yap</Text>
            </Pressable>

            {/* Social Logins Row */}
            <View style={styles.socialRow}>
              <Pressable style={styles.socialBtn}>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
              </Pressable>
              <Pressable style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={20} color="#000000" />
              </Pressable>
              <Pressable style={styles.socialBtn}>
                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              </Pressable>
            </View>

            {/* Register Link */}
            <Link href="/(auth)/sign-up" asChild>
              <Pressable style={styles.linkWrap}>
                <Text style={styles.linkNormal}>
                  Hesabınız yok mu? <Text style={styles.linkHighlight}>Kayıt ol</Text>
                </Text>
              </Pressable>
            </Link>

            {/* Secure data indicator */}
            <View style={styles.secureBadge}>
              <Ionicons name="lock-closed" size={12} color="#94a3b8" />
              <Text style={styles.secureText}>
                Verileriniz <Text style={styles.secureTeal}>256-bit SSL</Text> ile korunur.
              </Text>
            </View>
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: '#061B3A',
    backgroundImage: 'linear-gradient(180deg, #051833 0%, #0a2d5e 100%)' as any,
    gap: spacing.xs,
    position: 'relative',
    overflow: 'hidden',
  },
  graphicShieldContainer: {
    position: 'absolute',
    top: 20,
    right: -25,
    opacity: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldAddIcon: {
    position: 'absolute',
  },
  pulseIcon: {
    position: 'absolute',
    bottom: 15,
    right: 80,
  },
  calendarIcon: {
    position: 'absolute',
    bottom: -8,
    right: 15,
  },
  heroTitle: {
    marginTop: spacing.sm,
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 36,
  },
  heroSubtitle: {
    color: '#9EBFDF',
    fontSize: 13,
    lineHeight: 18,
  },
  panel: {
    marginTop: -28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(220, 229, 242, 0.5)',
    backgroundColor: '#FFFFFF',
    backgroundImage: 'linear-gradient(180deg, #f3f7fc 0%, #ffffff 180px)' as any,
    padding: spacing.lg,
    gap: 12,
    ...shadows.floating,
  },
  welcomeText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0B1A33',
    marginTop: -2,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#FCFDFF',
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
    color: '#0B1A33',
    fontSize: 14,
  },
  eyeBtn: {
    padding: 6,
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
    marginBottom: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  forgotText: {
    color: '#1E80FF',
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    marginTop: 6,
    backgroundColor: '#0FAE9F',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    flexDirection: 'row',
    position: 'relative',
    shadowColor: '#0FAE9F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  arrowIcon: {
    position: 'absolute',
    right: 18,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    color: '#94A3B8',
    fontSize: 12,
    marginHorizontal: 12,
    fontWeight: '500',
  },
  biometricBtn: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  biometricText: {
    color: '#0B1A33',
    fontSize: 14,
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  socialBtn: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  linkWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkNormal: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  linkHighlight: {
    color: '#1E80FF',
    fontWeight: '700',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  secureText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  secureTeal: {
    color: '#0FAE9F',
    fontWeight: '600',
  },
  error: {
    color: palette.danger,
    fontSize: 13,
    textAlign: 'center',
  },
})
