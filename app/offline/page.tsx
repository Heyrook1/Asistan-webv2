import type { Metadata } from 'next'
import Link from 'next/link'

import { AsistanLogo } from '@/components/asistan-logo'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Çevrimdışı',
  robots: { index: false, follow: false },
}

/** Soft offline surface for direct visits; SW primarily serves /offline.html */
export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#F7F7F5] px-6 py-16 text-center">
      <AsistanLogo variant="dark" size="md" />
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0071E3]/70">
        Asistan
      </p>
      <h1 className="mt-8 max-w-md font-heading text-3xl font-black tracking-tight text-[#1D1D1F]">
        Çevrimdışısınız
      </h1>
      <p className="mt-4 max-w-md text-base leading-7 text-[#5D6068]">
        İnternet bağlantısı yok. Bağlantı gelince randevu ve klinik keşfine devam edebilirsiniz.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="min-h-11 rounded-xl bg-[#0071E3] text-white hover:bg-[#0063C8]">
          <Link href="/client">Asistan’a dön</Link>
        </Button>
        <Button asChild variant="outline" className="min-h-11 rounded-xl">
          <Link href="/">Ana sayfa</Link>
        </Button>
      </div>
    </main>
  )
}
