import { Suspense } from 'react'
import { ClientBookingsPanel } from '@/components/client/bookings-panel'

export default function ClientBookingsPage() {
  return (
    <Suspense
      fallback={
        <main className="space-y-2">
          <h1 className="font-heading text-[1.45rem] font-extrabold tracking-tight">Randevularım</h1>
          <p className="text-[13px] text-muted-foreground">Randevular yükleniyor…</p>
        </main>
      }
    >
      <ClientBookingsPanel />
    </Suspense>
  )
}
