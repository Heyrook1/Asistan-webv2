'use client'

import { useEffect } from 'react'

import { ErrorState } from '@/components/client/ui'
import { useLanguage } from '@/hooks/useLanguage'

export default function ClientError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLanguage()

  useEffect(() => {
    console.error('[client] route error', error)
  }, [error])

  return (
    <div className="px-1 py-8">
      <ErrorState
        title={t({ tr: 'Bir şeyler ters gitti', en: 'Something interrupted this page' })}
        description={t({
          tr: 'Sayfa yüklenirken beklenmedik bir sorun oluştu. Yeniden deneyebilir veya biraz sonra tekrar bakabilirsiniz.',
          en: 'We hit an unexpected problem loading this page. Try again, or check back in a moment.',
        })}
        retryLabel={t({ tr: 'Yeniden dene', en: 'Try again' })}
        onRetry={reset}
      />
    </div>
  )
}
