import { Suspense } from 'react'
import { ClientBookingsPanel } from '@/components/client/bookings-panel'
import { getServerLanguage } from '@/lib/server-language'

export default async function ClientBookingsPage() {
  const { t } = await getServerLanguage()

  return (
    <Suspense
      fallback={
        <main className="space-y-2">
          <h1 className="font-heading text-[1.45rem] font-extrabold tracking-tight">
            {t({ tr: 'Randevularım', en: 'My appointments' })}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            {t({ tr: 'Randevular yükleniyor…', en: 'Loading appointments…' })}
          </p>
        </main>
      }
    >
      <ClientBookingsPanel />
    </Suspense>
  )
}
