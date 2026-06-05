'use client'

import Link from 'next/link'
import { CalendarCheck, ChevronRight, Clock, Sparkles, Users } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Suggestion } from './types'

export function AiSuggestions({
  suggestions,
  canViewAnalytics,
}: {
  suggestions: Suggestion[]
  canViewAnalytics: boolean
}) {
  return (
    <Card className="border-border/60 bg-white/85 shadow-sm backdrop-blur-md">
      <CardContent className="p-4 lg:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <h2 className="text-sm font-bold text-brand-ink">Asistan AI Önerileri</h2>
          </div>
          <span className="rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-700">AI</span>
        </div>

        <div className="flex flex-col gap-2">
          {suggestions.map((suggestion) => (
            <Link
              key={suggestion.title}
              href={suggestion.href ?? '/dashboard'}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-white',
                suggestion.tone === 'teal' && 'border-emerald-100 bg-emerald-50/70',
                suggestion.tone === 'orange' && 'border-orange-100 bg-orange-50/70',
                suggestion.tone === 'violet' && 'border-violet-100 bg-violet-50/70',
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  suggestion.tone === 'teal' && 'bg-emerald-100 text-emerald-700',
                  suggestion.tone === 'orange' && 'bg-orange-100 text-orange-700',
                  suggestion.tone === 'violet' && 'bg-violet-100 text-violet-700',
                )}
              >
                {suggestion.tone === 'teal' ? (
                  <CalendarCheck className="h-5 w-5" />
                ) : suggestion.tone === 'orange' ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  <Users className="h-5 w-5" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block line-clamp-1 text-sm font-semibold text-brand-ink">{suggestion.title}</span>
                <span className="block line-clamp-2 text-xs text-muted-foreground">{suggestion.description}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>

        {canViewAnalytics && (
          <Link
            href="/dashboard/analitik"
            className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-brand-teal"
          >
            Tüm önerileri görüntüle <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

export function AiSuggestionsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 lg:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-5 w-10 rounded-full" />
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
        <Skeleton className="mx-auto mt-3 h-4 w-36" />
      </CardContent>
    </Card>
  )
}

