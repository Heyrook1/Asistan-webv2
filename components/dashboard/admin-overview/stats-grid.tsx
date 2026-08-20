'use client'

import { Calendar, CalendarCheck, Clock, Users, Wallet } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { trMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { OverviewStats } from './types'

export function StatsGrid({
  stats,
  canViewFinance,
}: {
  stats: OverviewStats
  /** Product: ciro card — must match Analitik `canViewFinance` (not analytics.view). */
  canViewFinance: boolean
}) {
  const statCards = [
    {
      title: 'Bugünkü Randevular',
      value: stats.todayAppointments,
      icon: Calendar,
      tone: 'blue' as const,
      hint: 'Onaylı ajanda',
    },
    {
      title: 'Bekleyen Onay',
      value: stats.pendingAppointments,
      icon: Clock,
      tone: 'orange' as const,
      hint: 'Onay bekliyor',
    },
    {
      title: 'Toplam Hasta',
      value: stats.activePatients,
      icon: Users,
      tone: 'violet' as const,
      hint: 'Aktif kayıt',
    },
    {
      title: 'Onaylanan',
      value: stats.confirmedAppointments,
      icon: CalendarCheck,
      tone: 'amber' as const,
      hint: 'Tüm zamanlar',
    },
    canViewFinance
      ? {
          title: 'Aylık Ciro',
          value: trMoney.format(stats.monthlyRevenue),
          icon: Wallet,
          tone: 'green' as const,
          hint: 'Bu ay',
        }
      : null,
  ].filter((card): card is NonNullable<typeof card> => Boolean(card))

  return (
    <div className="grid grid-cols-2 gap-2.5 md:gap-3 xl:grid-cols-5">
      {statCards.map((card) => (
        <Card key={card.title} className="border-border/60 bg-white/85 shadow-sm backdrop-blur-md">
          <CardContent className="flex items-start gap-2.5 p-3 md:items-center md:gap-3 md:p-4">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:h-12 md:w-12',
                card.tone === 'blue' && 'bg-blue-50 text-brand-blue',
                card.tone === 'orange' && 'bg-orange-50 text-orange-600',
                card.tone === 'violet' && 'bg-violet-50 text-violet-600',
                card.tone === 'amber' && 'bg-amber-50 text-amber-600',
                card.tone === 'green' && 'bg-emerald-50 text-emerald-600',
              )}
            >
              <card.icon className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground md:text-[11px]">
                {card.title}
              </p>
              <p className="mt-0.5 text-xl font-bold text-brand-ink md:text-2xl">{card.value}</p>
              <p className="mt-0.5 hidden line-clamp-1 text-[11px] text-muted-foreground md:block">{card.hint}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function StatsGridSkeleton({ cardCount = 5 }: { cardCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:gap-3 xl:grid-cols-5">
      {Array.from({ length: cardCount }).map((_, index) => (
        <Card key={index} className="border-border/60 shadow-sm">
          <CardContent className="flex items-start gap-2.5 p-3 md:items-center md:gap-3 md:p-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full md:h-12 md:w-12" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16 md:h-8 md:w-20" />
              <Skeleton className="hidden h-3 w-20 md:block" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

