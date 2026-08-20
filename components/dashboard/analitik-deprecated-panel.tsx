import Link from 'next/link'
import { BarChart3, LayoutDashboard } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/** Shown when clinic Analitik is explicitly disabled via flag. */
export function AnalitikDeprecatedPanel() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 py-8">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <BarChart3 className="h-5 w-5" aria-hidden />
          </div>
          <CardTitle className="text-xl">Operasyon raporu kapalı</CardTitle>
          <CardDescription className="text-[15px] leading-relaxed">
            Bu klinikte Analitik bayrağı kapatıldı. Günlük sayılar Genel Bakış&apos;ta kalır. Varsayılan
            ürün durumu: dürüst operasyon raporu (ölçülen randevu/ciro, CSV/PDF) açıktır.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="gap-2">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              Genel Bakış
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/ajanda">Ajanda</Link>
          </Button>
        </CardContent>
      </Card>
      <p className="px-1 text-sm text-muted-foreground">
        Operasyon raporunu yeniden açmak için Asistan destek ekibine yazın.
      </p>
    </div>
  )
}
