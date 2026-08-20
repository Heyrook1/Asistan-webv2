import type { Metadata } from 'next'

import { DocumentsPanel } from '@/components/client/health/documents/documents-panel'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/client/health/documents', {
  title: 'Belgeler — Asistan',
  description: 'Sağlık belgelerinizi güvenli, özel bir alanda saklayın. Dosyalar yalnızca sizin erişiminize açıktır.',
})

export default function DocumentsPage() {
  return <DocumentsPanel />
}
