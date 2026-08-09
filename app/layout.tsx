import type { Metadata, Viewport } from 'next'

import { Toaster } from '@/components/ui/sonner'

import './globals.css'

import { SITE_URL } from '@/lib/seo'

// Brand typography = Manrope (docs/typography.md). Self-hosted to avoid build-time network fetches.
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import '@fontsource/manrope/800.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Asistan',
  title: {
    default: 'KKTC Randevu Sistemi | Asistan Health',
    template: '%s | Asistan',
  },
  description: 'KKTC klinikleri için randevu, hasta takibi ve ekip yönetimi platformu.',
  keywords: [
    'KKTC randevu sistemi',
    'klinik yönetimi',
    'hasta takibi',
    'iş yönetimi',
    'Asistan Health',
    'klinik randevu paneli',
  ],
  appleWebApp: {
    capable: true,
    title: 'Asistan Rezervasyon',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_CY',
    siteName: 'Asistan',
    title: 'KKTC Randevu Sistemi | Asistan Health',
    description: 'KKTC klinikleri için randevu, hasta takibi ve ekip yönetimi tek panelde.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Asistan Health — KKTC klinik randevu ve operasyon paneli',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KKTC Randevu Sistemi | Asistan Health',
    description: 'KKTC klinikleri için randevu, hasta takibi ve ekip yönetimi platformu.',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: [
      { url: '/images/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/images/asistan-icon.png', type: 'image/png' },
    ],
    apple: [{ url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  other: {
    google: 'notranslate',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0071E3' },
    { media: '(prefers-color-scheme: dark)', color: '#0071E3' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

import { LanguageProvider } from '@/contexts/LanguageContext'
import { ErrorBoundary } from '@/components/error-boundary'
import { SkipToContent } from '@/components/skip-to-content'
import { RegisterServiceWorker } from '@/components/pwa/register-sw'
import { cookies } from 'next/headers'
import { normalizeAuthLanguage } from '@/lib/auth-routes'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const lang = normalizeAuthLanguage(cookieStore.get('asistan-lang')?.value)

  return (
    <html
      lang={lang}
      translate="no"
      data-scroll-behavior="smooth"
      className="bg-background text-foreground"
      suppressHydrationWarning
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <SkipToContent />
        <ErrorBoundary>
          <LanguageProvider initialLanguage={lang}>
            <div className="min-h-screen">
              {children}
            </div>
          </LanguageProvider>
          <Toaster position="top-right" richColors duration={4000} />
          <RegisterServiceWorker />
          {/* Vercel Web Analytics: Vercel Dashboard > Analytics > Enable to re-activate */}
        </ErrorBoundary>
      </body>
    </html>
  )
}

