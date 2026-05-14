import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Asistan - İşini Yöneten Akıllı Asistan',
    template: '%s | Asistan',
  },
  description: 'Randevu ve hizmet yönetimi için akıllı asistanınız. Müşteri randevularını kolayca yönetin, takviminizi düzenleyin ve işinizi büyütün.',
  keywords: ['randevu', 'hizmet sağlayıcı', 'takvim', 'müşteri yönetimi', 'asistan'],
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0891b2' },
    { media: '(prefers-color-scheme: dark)', color: '#0e7490' },
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
    <html lang="tr" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
