import { Suspense } from 'react'
import { ClientBookingsPanel } from '@/components/client/bookings-panel'

export default function ClientBookingsPage() {
  return (
    <Suspense
      fallback={
        <main className="space-y-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">Randevularım</h1>
          <p className="text-sm text-muted-foreground">Randevular yükleniyor…</p>
        </main>
      }
    >
      <ClientBookingsPanel />
    </Suspense>
  )
}
