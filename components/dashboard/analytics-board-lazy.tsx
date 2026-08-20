'use client'

import dynamic from 'next/dynamic'

export const AnalyticsBoardLazy = dynamic(
  () => import('@/components/dashboard/analytics-board').then((mod) => mod.AnalyticsBoard),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">
        Analitik paneli hazırlanıyor…
      </div>
    ),
  },
)
