import type { Metadata } from 'next'

import { liveSiteOrigin } from '@/lib/brand/regional-hubs'

/** Canonical production origin — live regional hub only (docs/regional-hubs.md) */
export const SITE_URL = liveSiteOrigin()

/** Absolute URL for a site path (leading slash optional). */
export function absoluteUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return new URL(normalized, SITE_URL).toString()
}

/**
 * Attach a per-page canonical (and matching OG url).
 * Do not set a global canonical on the root layout — it would force every route to `/`.
 */
export function withCanonical(path: string, metadata: Metadata = {}): Metadata {
  const canonical = path.startsWith('/') ? path : `/${path}`
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
    },
    openGraph: {
      ...metadata.openGraph,
      url: canonical,
    },
  }
}

/** Public marketing + discovery paths included in sitemap.xml */
export const PUBLIC_SITEMAP_PATHS = [
  '/',
  '/urun',
  '/cozumler',
  '/cozumler/health',
  '/cozumler/beauty',
  '/cozumler/legal',
  '/cozumler/pro',
  '/fiyatlandirma',
  '/guven',
  '/kaynaklar',
  '/hakkimizda',
  '/contact',
  '/privacy',
  '/terms',
  '/client',
  '/client/clinics',
] as const
