'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CalendarDays, List } from 'lucide-react'

import { cn } from '@/lib/utils'

export type AjandaMode = 'liste' | 'takvim'

export function AjandaModeSwitch({ mode }: { mode: AjandaMode }) {
  const searchParams = useSearchParams()

  function hrefFor(next: AjandaMode) {
    const params = new URLSearchParams()
    params.set('mode', next)
    if (next === 'liste') {
      const status = searchParams.get('status')
      const id = searchParams.get('id')
      if (status) params.set('status', status)
      if (id) params.set('id', id)
    } else {
      const date = searchParams.get('date')
      if (date) params.set('date', date)
    }
    return `/dashboard/ajanda?${params.toString()}`
  }

  return (
    <div
      className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
      role="tablist"
      aria-label="Ajanda görünümü"
    >
      <Link
        href={hrefFor('liste')}
        role="tab"
        aria-selected={mode === 'liste'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
          mode === 'liste' ? 'bg-brand-teal text-white' : 'text-muted-foreground hover:text-brand-ink',
        )}
      >
        <List className="h-3.5 w-3.5" />
        Liste
      </Link>
      <Link
        href={hrefFor('takvim')}
        role="tab"
        aria-selected={mode === 'takvim'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
          mode === 'takvim' ? 'bg-brand-teal text-white' : 'text-muted-foreground hover:text-brand-ink',
        )}
      >
        <CalendarDays className="h-3.5 w-3.5" />
        Takvim
      </Link>
    </div>
  )
}
