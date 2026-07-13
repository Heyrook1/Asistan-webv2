'use client'

import Link from 'next/link'
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronRight, ClipboardList, Frown, Users } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { PriorityItem, PrioritySeverity } from '@/lib/priority-engine'

const SEVERITY_STYLE: Record<
  PrioritySeverity,
  { card: string; iconWrap: string; badge: string; label: string }
> = {
  high: {
    card: 'border-amber-200 bg-amber-50/70',
    iconWrap: 'bg-amber-100 text-amber-800',
    badge: 'bg-amber-100 text-amber-800',
    label: 'Acil',
  },
  medium: {
    card: 'border-orange-100 bg-orange-50/60',
    iconWrap: 'bg-orange-100 text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
    label: 'Önemli',
  },
  low: {
    card: 'border-slate-200 bg-slate-50/80',
    iconWrap: 'bg-slate-100 text-slate-600',
    badge: 'bg-slate-100 text-slate-600',
    label: 'Bilgi',
  },
}

function PriorityIcon({ id }: { id: string }) {
  if (id.includes('pending') || id.includes('approvals')) return <ClipboardList className="h-5 w-5" />
  if (id.includes('no-show')) return <Frown className="h-5 w-5" />
  if (id.includes('empty') || id.includes('today')) return <CalendarDays className="h-5 w-5" />
  if (id.includes('patient')) return <Users className="h-5 w-5" />
  return <AlertTriangle className="h-5 w-5" />
}

export function PriorityCards({ items }: { items: PriorityItem[] }) {
  return (
    <Card className="border-border/60 bg-white/85 shadow-sm backdrop-blur-md">
      <CardContent className="p-4 lg:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-brand-ink">Öncelikler</h2>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
            Operasyon
          </span>
        </div>

        {items.length === 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-ink">Bekleyen kritik iş yok</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Onay birikimi, gelmedi kaydı veya boş gün uyarısı bulunmuyor.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const style = SEVERITY_STYLE[item.severity]
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-white',
                    style.card,
                  )}
                >
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', style.iconWrap)}>
                    <PriorityIcon id={item.id} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-0.5 flex items-center gap-2">
                      <span className="block line-clamp-1 text-sm font-semibold text-brand-ink">{item.title}</span>
                      <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold', style.badge)}>
                        {style.label}
                      </span>
                    </span>
                    <span className="block line-clamp-2 text-xs text-muted-foreground">{item.reason}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function PriorityCardsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 lg:p-5">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-xl border p-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-52 max-w-full" />
              </div>
              <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
