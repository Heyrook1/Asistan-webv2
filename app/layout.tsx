import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'

import { Toaster } from '@/components/ui/sonner'

import './globals.css'

// Self-hosted fonts (bundled via npm) to avoid build-time network fetches.
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import '@fontsource/manrope/800.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://kktc.asistan.online'),
  title: {
    default: 'KKTC Randevu Sistemi | Asistan Health',
    template: '%s | Asistan',
  },
  description: 'KKTC klinikleri için yapay zeka destekli randevu, hasta takibi ve ekip yönetimi platformu.',
  keywords: [
    'KKTC randevu sistemi',
    'klinik yönetimi',
    'hasta takibi',
    'iş yönetimi',
    'Asistan Health',
    'yapay zeka destekli randevu',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_CY',
    url: '/',
    siteName: 'Asistan',
    title: 'KKTC Randevu Sistemi | Asistan Health',
    description: 'KKTC klinikleri için randevu, hasta takibi ve ekip yönetimi tek panelde.',
    images: [
      {
        url: '/images/asistan-full-logo.png',
        width: 1200,
        height: 630,
        alt: 'Asistan Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KKTC Randevu Sistemi | Asistan Health',
    description: 'KKTC klinikleri için yapay zeka destekli randevu ve iş yönetimi platformu.',
    images: ['/images/asistan-full-logo.png'],
  },
  icons: {
    icon: [{ url: '/images/asistan-icon.png', type: 'image/png' }],
    apple: '/images/asistan-icon.png',
  },
  other: {
    google: 'notranslate',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0B1220' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

import { LanguageProvider } from '@/contexts/LanguageContext'
import { FloatingCTA } from '@/components/ui/FloatingCTA'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" translate="no" className="bg-background text-foreground">
      <body className="font-sans antialiased">
        <LanguageProvider>
          {children}
          <FloatingCTA />
        </LanguageProvider>
        <Toaster position="top-right" richColors duration={4000} />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

