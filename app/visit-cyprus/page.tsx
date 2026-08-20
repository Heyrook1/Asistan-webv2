import type { Metadata } from 'next'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { VisitCyprusConcierge } from '@/components/concierge/visit-cyprus-concierge'
import { parseConciergeLang } from '@/lib/concierge'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/visit-cyprus', {
  title: 'KKTC medical visit · Asistan',
  description:
    'Northern Cyprus clinic appointment routing in Turkish, English, and Russian. Not a travel agency — no visa or hotel booking.',
})

type PageProps = {
  searchParams: Promise<{ lang?: string }>
}

export default async function VisitCyprusPage({ searchParams }: PageProps) {
  const query = await searchParams
  const initialLang = parseConciergeLang(query.lang)

  return (
    <MarketingPageShell>
      <VisitCyprusConcierge initialLang={initialLang} />
    </MarketingPageShell>
  )
}
