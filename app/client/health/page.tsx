import { Suspense } from 'react'
import type { Metadata } from 'next'

import { ClientHealthPanel } from '@/components/client/health-panel'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/client/health', {
  title: 'Asistan pasaportu',
  description:
    'Asistan pasaportu — klinikler arası ziyaret ve üyelik özeti. Klinik notları ve tahliller paylaşılmaz; FHIR / tıbbi pasaport değildir.',
})

export default function ClientHealthPage() {
  return (
    <Suspense
      fallback={
        <main className="space-y-2">
          <h1 className="font-heading text-[1.45rem] font-extrabold tracking-tight">
            Asistan pasaportu
          </h1>
          <p className="text-[13px] text-muted-foreground">Ziyaret özeti yükleniyor…</p>
        </main>
      }
    >
      <ClientHealthPanel />
    </Suspense>
  )
}
