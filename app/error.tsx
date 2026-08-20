'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setTag('boundary', 'app-error')
      if (error.digest) {
        scope.setTag('nextjs.digest', error.digest)
        scope.setExtra('digest', error.digest)
      }
      Sentry.captureException(error)
    })
    if (process.env.NODE_ENV !== 'production') {
      console.error(error)
    }
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-brand-ink">Bir hata oluştu</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          İşlem tamamlanamadı. Önceki sayfaya dönebilir veya paneli yeniden açabilirsiniz.
        </p>
        {error.digest && (
          <p className="mt-3 rounded-lg bg-dashboard-surface px-3 py-2 text-[11px] text-muted-foreground">
            Destek için kod: {error.digest}
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset} variant="ctaPrimary">
            Tekrar dene
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Panele dön</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard/yardim">Yardım</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
