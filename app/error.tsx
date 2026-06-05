'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error)
    }
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md rounded-xl border bg-white p-6 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-[#0C1D36]">Bir hata oluştu</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          İşlem tamamlanamadı. Güvenliğiniz için teknik detaylar gizlendi.
        </p>
        {error.digest && (
          <p className="mt-3 rounded-lg bg-[#F7F9FB] px-3 py-2 text-xs text-muted-foreground">
            Hata kodu: {error.digest}
          </p>
        )}
        <Button onClick={reset} className="mt-4 bg-[#0B7F6F] text-white hover:bg-[#09685C]">
          Tekrar dene
        </Button>
      </div>
    </div>
  )
}
