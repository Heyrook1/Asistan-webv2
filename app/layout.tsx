import type { Metadata, Viewport } from 'next'
import { Manrope, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const manrope = Manrope({ 
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800']
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500']
})

export const metadata: Metadata = {
  title: {
    default: 'Asistan - İşinizi Yöneten Akıllı Asistanınız',
    template: '%s | Asistan',
  },
  description: 'Profesyoneller için yapay zeka destekli randevu ve iş yönetim platformu. Randevu yönetimi, hatırlatmalar, müşteri iletişimi ve ekip organizasyonu - hepsi tek platformda.',
  keywords: ['randevu yönetimi', 'iş yönetimi', 'takvim', 'müşteri yönetimi', 'asistan', 'AI', 'yapay zeka', 'profesyonel', 'SaaS'],
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#06142A' },
  ],
  width: 'device-width',
  initialScale: 1,
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
        <Toaster position="top-right" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
