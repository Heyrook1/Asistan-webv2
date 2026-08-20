import type { MetadataRoute } from 'next'

import { GUIDES } from '@/lib/resources/guides'
import { absoluteUrl, PUBLIC_SITEMAP_PATHS } from '@/lib/seo'
import { listIndexableClinicSitemapEntries } from '@/lib/seo/list-indexable-clinics'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  let clinicEntries: MetadataRoute.Sitemap = []
  try {
    const clinics = await listIndexableClinicSitemapEntries()
    clinicEntries = clinics.map((clinic) => ({
      url: absoluteUrl(clinic.path),
      lastModified: clinic.lastModified,
      changeFrequency: 'weekly',
      priority: 0.75,
    }))
  } catch (error) {
    console.error('[sitemap] clinic entries failed', error)
  }

  return [...staticEntries, ...guideEntries, ...clinicEntries]
}
