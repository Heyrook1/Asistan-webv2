import type { MetadataRoute } from 'next'

/**
 * Installable PWA manifest — start at patient app-shell (/client).
 * Icons: public/images/icon-{192,512}.png
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Asistan Health',
    short_name: 'Asistan',
    description:
      'KKTC klinik randevu, hasta takibi ve operasyon paneli. Hastalar için keşif ve randevu talebi.',
    start_url: '/client',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    lang: 'tr',
    dir: 'ltr',
    background_color: '#F7F7F5',
    theme_color: '#0071E3',
    categories: ['medical', 'health', 'productivity'],
    icons: [
      {
        src: '/images/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
