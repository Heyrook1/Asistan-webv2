import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { JetBrains_Mono, Inter } from 'next/font/google'

import { Toaster } from '@/components/ui/sonner'

import './globals.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://kktc.asistan.online'),
  title: {
    default: 'KKTC Randevu Sistemi | Asistan Health',
    template: '%s | Asistan',
  },
  description: 'KKTC klinikleri için AI destekli randevu, hasta takibi ve ekip yönetim platformu.',
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
    description: 'KKTC klinikleri için AI destekli randevu ve iş yönetim platformu.',
    images: ['/images/asistan-full-logo.png'],
  },
  icons: {
    icon: [{ url: '/images/asistan-mark.svg', type: 'image/svg+xml' }],
    apple: '/images/asistan-mark.svg',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className="bg-white">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" richColors duration={4000} />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
