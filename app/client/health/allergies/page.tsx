import type { Metadata } from 'next'

import { AllergiesPanel } from '@/components/client/health/allergies/allergies-panel'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/client/health/allergies', {
  title: 'Alerjiler — Asistan',
  description: 'Bilinen alerji ve hassasiyetlerinizi güvenle kaydedin. Kayıtlar yalnızca açık izninizle paylaşılır.',
})

export default function AllergiesPage() {
  return <AllergiesPanel />
}
