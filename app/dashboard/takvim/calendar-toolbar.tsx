'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import { AjandaModeSwitch } from '@/components/dashboard/ajanda-mode-switch'
import { cn } from '@/lib/utils'
import type { View } from './calendar-types'
import { VIEW_LABEL } from './calendar-types'

export function CalendarToolbar({
  title,
  pendingCount,
  view,
  onViewChange,
  onNavigate,
  onToday,
  onShare,
}: {
  title: string
  pendingCount: number
  view: View
  onViewChange: (view: View) => void
  onNavigate: (direction: 1 | -1) => void
  onToday: () => void
  onShare: () => void
}) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-ink lg:text-2xl">Ajanda</h1>
            <p className="text-[12px] text-muted-foreground lg:text-sm">
              Takvim modu · {title}
              {pendingCount > 0 ? (
                <>
                  {' '}
                  ·{' '}
                  <Link
                    href="/dashboard/ajanda?mode=liste&status=SCHEDULED"
                    className="font-semibold text-brand-teal hover:underline"
                  >
                    {pendingCount} onay bekliyor
                  </Link>
                </>
              ) : null}
            </p>
          </div>
          <AjandaModeSwitch mode="takvim" />
        </div>
      </div>
      <div className="hidden flex-wrap items-center gap-2 lg:flex">
        <div className="flex rounded-xl border bg-white p-1">
          {(['day', 'week', 'month'] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onViewChange(v)}
              aria-pressed={view === v}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium',
                view === v ? 'bg-brand-teal text-white' : 'text-muted-foreground hover:text-brand-ink'
              )}
            >
              {VIEW_LABEL[v]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => onNavigate(-1)} className="h-9 w-9" aria-label="Önceki">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onToday}>
            Bugün
          </Button>
          <Button variant="outline" size="icon" onClick={() => onNavigate(1)} className="h-9 w-9" aria-label="Sonraki">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={onShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          Takvimi Paylaş
        </Button>
      </div>
    </div>
  )
}
