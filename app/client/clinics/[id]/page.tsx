import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ClinicDetailPanel } from '@/components/client/clinic-detail-panel'
import { getClientClinicDetail } from '@/lib/client-marketplace/clinic-detail'
import { parsePathId } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export default async function ClientClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = parsePathId((await params).id)
  if (!id) notFound()

  const clinic = await getClientClinicDetail(id)
  if (!clinic) notFound()

  return (
    <main className="space-y-4">
      <Link
        href="/client/clinics"
        className="inline-flex text-[13px] font-semibold text-[#0071E3]"
      >
        ← Klinik listesi
      </Link>
      <ClinicDetailPanel clinic={clinic} />
    </main>
  )
}
