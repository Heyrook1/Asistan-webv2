import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RoutePlaceholderProps {
  title: string
  description: string
  ctaLabel: string
  ctaHref?: string
}

export function RoutePlaceholder({ title, description, ctaLabel, ctaHref = '/dashboard' }: RoutePlaceholderProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0C1D36]">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button asChild className="bg-[#12C8AD] text-white hover:bg-[#10b49c]">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Liste Görünümü</CardTitle>
            <CardDescription>Bu alan yakinda canli verilerle doldurulacak.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-dashed border-border/70 bg-background/70 px-6 py-16 text-center text-sm text-muted-foreground">
              Henuz veri yok
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Ozet Kartlari</CardTitle>
            <CardDescription>Performans metrikleri bu bolumde gorunecek.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-xl border border-border/60 bg-secondary/40 p-4 text-sm text-muted-foreground">
                  Henuz veri yok
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
