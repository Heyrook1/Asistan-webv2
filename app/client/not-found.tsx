'use client'

import { Compass } from 'lucide-react'

import { EmptyState } from '@/components/client/ui'
import { useLanguage } from '@/hooks/useLanguage'

export default function ClientNotFound() {
  const { t } = useLanguage()

  return (
    <div className="px-1 py-8">
      <EmptyState
        icon={Compass}
        title={t({ tr: 'Bu sayfa bulunamadı', en: 'We couldn’t find that page' })}
        description={t({
          tr: 'Aradığınız içerik taşınmış veya kaldırılmış olabilir. Klinik keşfine dönüp devam edebilirsiniz.',
          en: 'The page may have moved or no longer exists. Head back to discovery to continue.',
        })}
        actionLabel={t({ tr: 'Klinik keşfet', en: 'Discover clinics' })}
        actionHref="/client/clinics"
      />
    </div>
  )
}
