import type { MetadataRoute } from 'next'

/**
 * Patient PWA — intentional start at /client (booking shell), not the clinic marketing home.
 * Store native apps remain optional; install path = browser “Add to Home Screen”.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/client',
    name: 'Asistan Rezervasyon',
    short_name: 'Asistan',
    description:
      'KKTC kliniklerini keşfedin, müsaitlik görün ve randevu talebi oluşturun. Ana ekrana ekleyerek uygulama gibi kullanın.',
    start_url: '/client?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'browser'],
    orientation: 'portrait-primary',
    lang: 'tr',
    dir: 'ltr',
    background_color: '#F7F7F5',
    theme_color: '#0071E3',
    categories: ['medical', 'health', 'lifestyle'],
    prefer_related_applications: false,
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
    shortcuts: [
      {
        name: 'Klinik bul',
        short_name: 'Keşfet',
        description: 'Yakındaki klinikleri keşfet',
        url: '/client/clinics?source=pwa-shortcut',
        icons: [{ src: '/images/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Randevularım',
        short_name: 'Randevu',
        url: '/client/appointments?source=pwa-shortcut',
        icons: [{ src: '/images/icon-192.png', sizes: '192x192' }],
      },
    ],
  }
}
