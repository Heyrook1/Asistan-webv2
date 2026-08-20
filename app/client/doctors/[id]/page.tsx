import type { Metadata } from 'next'

import { DoctorProfilePanel } from '@/components/client/doctor-profile-panel'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Doktor profili',
  description: 'Doktor bilgileri, hizmetler ve müsaitlik — Asistan ile randevu alın.',
}

export default async function ClientDoctorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <DoctorProfilePanel doctorId={id} />
}
