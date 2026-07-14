import type { MetadataRoute } from 'next'

import { GUIDES } from '@/lib/resources/guides'
import { absoluteUrl, PUBLIC_SITEMAP_PATHS } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_SITEMAP_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path.startsWith('/client') ? 0.7 : 0.8,
  }))

  const guideEntries: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: absoluteUrl(`/kaynaklar/${guide.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...guideEntries]
}
