import { Suspense } from 'react'
import type { Metadata } from 'next'

import { ClientHealthPanel } from '@/components/client/health-panel'
import { HealthModules } from '@/components/client/health/health-modules'
import { withCanonical } from '@/lib/seo'
import { getServerLanguage } from '@/lib/server-language'

export const metadata: Metadata = withCanonical('/client/health', {
  title: 'Asistan pasaportu',
  description:
    'Asistan pasaportu — klinikler arası ziyaret ve üyelik özeti. Klinik notları ve tahliller paylaşılmaz; FHIR / tıbbi pasaport değildir.',
})

export default async function ClientHealthPage() {
  const { t } = await getServerLanguage()

  return (
    <Suspense
      fallback={
        <main className="space-y-2">
          <h1 className="font-heading text-[1.45rem] font-extrabold tracking-tight">
            {t({ tr: 'Asistan pasaportu', en: 'Asistan passport' })}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            {t({ tr: 'Ziyaret özeti yükleniyor…', en: 'Loading visit summary…' })}
          </p>
        </main>
      }
    >
      <div className="space-y-5">
        <ClientHealthPanel />
        <HealthModules />
      </div>
    </Suspense>
  )
}
