import type { Metadata } from 'next'

import { MedicationsPanel } from '@/components/client/health/medications/medications-panel'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/client/health/medications', {
  title: 'İlaçlar — Asistan',
  description: 'Kullandığınız ilaçları güvenle kaydedin ve yönetin. Kayıtlar yalnızca açık izninizle paylaşılır.',
})

export default function MedicationsPage() {
  return <MedicationsPanel />
}
