import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/',
          '/api/',
          '/auth/',
          '/tr/giris',
          '/tr/kayit',
          '/en/login',
          '/en/register',
          '/client/bookings',
          '/client/profile',
          '/client/appointments',
          '/offline',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
