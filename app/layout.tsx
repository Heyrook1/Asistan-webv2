import type { Metadata, Viewport } from 'next'
import { Manrope, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const manrope = Manrope({ 
  subsets: ['latin', 'latin-ext'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800']
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500']
})

export const metadata: Metadata = {
  metadataBase: new URL('https://kktc.asistan.online'),
  title: {
    default: 'Asistan | KKTC için AI Destekli Randevu ve İş Yönetimi',
    template: '%s | Asistan',
  },
  description: 'KKTC’deki klinikler ve hizmet işletmeleri için AI destekli randevu, hasta iletişimi ve ekip yönetim platformu.',
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
    title: 'Asistan | KKTC için AI Destekli Randevu ve İş Yönetimi',
    description: 'KKTC’deki klinikler ve hizmet işletmeleri için randevu, hasta iletişimi ve ekip yönetimi tek panelde.',
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
    title: 'Asistan | KKTC için AI Destekli Randevu ve İş Yönetimi',
    description: 'KKTC’deki klinikler ve hizmet işletmeleri için AI destekli iş yönetim platformu.',
    images: ['/images/asistan-full-logo.png'],
  },
  icons: {
    icon: [
      { url: '/images/asistan-mark.svg', type: 'image/svg+xml' },
    ],
    apple: '/images/asistan-mark.svg',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#06142A' },
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
      <body className={`${manrope.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" richColors duration={4000} />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
