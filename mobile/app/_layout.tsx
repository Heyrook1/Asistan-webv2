import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SessionProvider } from '@/lib/session-context'
import { useAppTheme } from '@/lib/use-app-theme'
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BrandLogo } from '@/components/brand-logo'
import { palette } from '@/lib/theme'

function WebMobileFrame({ children }: { children: React.ReactNode }) {
  const { width: windowWidth } = useWindowDimensions()
  const [currentTime, setCurrentTime] = useState('14:30')

  useEffect(() => {
    if (Platform.OS !== 'web') return
    const updateTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      setCurrentTime(`${hours}:${minutes}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const isDesktop = Platform.OS === 'web' && windowWidth >= 800

  if (!isDesktop) {
    return <View style={styles.nativeContainer}>{children}</View>
  }

  return (
    <View style={styles.webWrapper}>
      {/* Left branding and descriptive features panel */}
      <View style={styles.brandPanel}>
        <View style={styles.logoRow}>
          <BrandLogo variant="light" height={42} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Canlı Önizleme</Text>
          </View>
        </View>

        <Text style={styles.heroText}>
          Sağlığınız için her an yanınızda olan profesyonel asistanınız.
        </Text>

        <View style={styles.divider} />

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconBg}>
              <Ionicons name="flash-sharp" size={18} color={palette.primary} />
            </View>
            <View>
              <Text style={styles.featureTitle}>Kolay & Hızlı Randevu</Text>
              <Text style={styles.featureDesc}>Klinikleri ve doktorları keşfedin, anında randevu alın.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconBg}>
              <Ionicons name="notifications" size={18} color={palette.secondary} />
            </View>
            <View>
              <Text style={styles.featureTitle}>Anlık Hatırlatıcılar</Text>
              <Text style={styles.featureDesc}>Randevularınızı kaçırmamanız için size anlık bildirimler gönderilir.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconBg}>
              <Ionicons name="shield-checkmark" size={18} color="#D62839" />
            </View>
            <View>
              <Text style={styles.featureTitle}>Güvenli Profil Yönetimi</Text>
              <Text style={styles.featureDesc}>Kişisel verileriniz Supabase altyapısıyla en üst düzeyde korunur.</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.footerHeading}>Mobil Uygulamayı Keşfedin</Text>
        <View style={storeStyles.storeButtons}>
          <View style={storeStyles.storeBtn}>
            <Ionicons name="logo-apple" size={20} color="#ffffff" style={storeStyles.storeIcon} />
            <View>
              <Text style={storeStyles.storeSub}>App Store'dan</Text>
              <Text style={storeStyles.storeMain}>İndirin</Text>
            </View>
          </View>

          <View style={storeStyles.storeBtn}>
            <Ionicons name="logo-google-playstore" size={18} color="#ffffff" style={storeStyles.storeIcon} />
            <View>
              <Text style={storeStyles.storeSub}>Google Play'den</Text>
              <Text style={storeStyles.storeMain}>İndirin</Text>
            </View>
          </View>
        </View>

        <View style={styles.qrSection}>
          <Ionicons name="qr-code-outline" size={36} color="#B6CAE6" />
          <Text style={styles.qrText}>
            Uygulamayı fiziksel cihazınızda test etmek için kameranız ile tarayın.
          </Text>
        </View>
      </View>

      {/* Right side phone container mockup */}
      <View style={styles.phonePanel}>
        <View style={styles.deviceFrame}>
          {/* Bezel Gloss / Highlight */}
          <View style={styles.deviceGlassReflection} />

          {/* Notch / Dynamic Island */}
          <View style={styles.notch} />

          {/* Status Bar */}
          <View style={styles.statusBar}>
            <Text style={styles.statusTime}>{currentTime}</Text>
            <View style={styles.statusIcons}>
              <Ionicons name="cellular" size={12} color="#ffffff" style={styles.statusIcon} />
              <Ionicons name="wifi" size={12} color="#ffffff" style={styles.statusIcon} />
              <Ionicons name="battery-full" size={14} color="#ffffff" style={styles.statusIcon} />
            </View>
          </View>

          {/* Actual Client Screen Viewport */}
          <View style={styles.screenViewport}>
            {children}
          </View>

          {/* Home Indicator */}
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </View>
  )
}

export default function RootLayout() {
  const theme = useAppTheme()
  return (
    <SessionProvider>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <WebMobileFrame>
        <Stack screenOptions={{ headerShown: false }} />
      </WebMobileFrame>
    </SessionProvider>
  )
}

const storeStyles = {
  storeButtons: {
    flexDirection: 'row' as const,
    gap: 10,
    marginBottom: 16,
  },
  storeBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 130,
  },
  storeIcon: {
    marginRight: 6,
  },
  storeSub: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '500' as const,
  },
  storeMain: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700' as const,
  },
}

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: '#06101F',
  },
  webWrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#041026',
    backgroundImage: 'linear-gradient(135deg, #041026 0%, #0c2044 100%)' as any,
    overflow: 'hidden',
  },
  brandPanel: {
    flex: 1.1,
    padding: 48,
    justifyContent: 'center',
    maxWidth: 560,
    minWidth: 400,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  badge: {
    backgroundColor: 'rgba(0, 113, 227, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 113, 227, 0.3)',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    color: palette.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  heroText: {
    color: '#E2E8F0',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 30,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 18,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  featureIconBg: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
    maxWidth: 340,
  },
  footerHeading: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  qrSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
  },
  qrText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  phonePanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  deviceFrame: {
    height: '92%',
    maxHeight: 780,
    aspectRatio: 375 / 780,
    borderRadius: 44,
    borderWidth: 10,
    borderColor: '#1e293b',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.45,
    shadowRadius: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  deviceGlassReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    pointerEvents: 'none',
    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0) 50.1%, rgba(0,0,0,0.01) 100%)' as any,
  },
  notch: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -50,
    width: 100,
    height: 22,
    backgroundColor: '#1e293b',
    borderRadius: 11,
    zIndex: 999,
  },
  statusBar: {
    height: 38,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#061B3A',
    zIndex: 990,
  },
  statusTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginLeft: 4,
  },
  screenViewport: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 6,
    left: '50%',
    marginLeft: -50,
    width: 100,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000000',
    opacity: 0.2,
    zIndex: 999,
  },
})
