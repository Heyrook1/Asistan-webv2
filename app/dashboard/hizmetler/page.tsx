import { requirePagePermission, can } from '@/lib/session'
import { getServicesList } from '@/lib/queries'
import { ServicesBoard } from './services-board'

export const dynamic = 'force-dynamic'

export default async function HizmetlerPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>
}) {
  const sp = await searchParams
  const session = await requirePagePermission('service.manage')
  const services = await getServicesList(session.businessId)

  return (
    <ServicesBoard
      services={services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description ?? '',
        category: s.category ?? '',
        durationMin: s.durationMin,
        price: Number(s.price),
        currency: s.currency as 'TRY' | 'USD' | 'EUR',
        color: s.color,
        isActive: s.isActive,
      }))}
      canManage={can(session, 'service.manage')}
      initialCreateOpen={sp.create === '1'}
    />
  )
}
