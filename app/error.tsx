'use client'

import { useEffect } from 'react'
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
    Sentry.captureException(error, {
      tags: { boundary: 'app-error' },
      extra: error.digest ? { digest: error.digest } : undefined,
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
          İşlem tamamlanamadı. Güvenliğiniz için teknik detaylar gizlendi.
        </p>
        {error.digest && (
          <p className="mt-3 rounded-lg bg-dashboard-surface px-3 py-2 text-xs text-muted-foreground">
            Hata kodu: {error.digest}
          </p>
        )}
        <Button
          onClick={reset}
          className="mt-4 bg-brand-blue text-white hover:bg-brand-blue-hover"
        >
          Tekrar dene
        </Button>
      </div>
    </div>
  )
}
