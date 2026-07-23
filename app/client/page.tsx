import { searchMarketplace } from '@/lib/client-marketplace/discovery'
import type { ClientDiscoveryItem } from '@/lib/client-marketplace/types'
import { RezervasyonHomeHub } from '@/web-mobile/home-hub'

export const dynamic = 'force-dynamic'

async function loadFeatured(): Promise<ClientDiscoveryItem[]> {
  try {
    const rows = await searchMarketplace({
      filters: {},
      sort: 'highest-rated',
      clientLocation: null,
    })
    return Array.isArray(rows) ? rows : []
  } catch (error) {
    console.error('[client/home] marketplace search failed:', error)
    return []
  }
}

export default async function ClientHomePage() {
  const featured = await loadFeatured()
  return <RezervasyonHomeHub featured={featured} />
}
