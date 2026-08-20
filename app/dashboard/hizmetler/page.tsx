import { requirePagePermission, can } from '@/lib/session'
import { getServicesList } from '@/lib/queries'
import { prisma } from '@/lib/prisma'
import { ServicesBoard } from './services-board'

export const dynamic = 'force-dynamic'

export default async function HizmetlerPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>
}) {
  const sp = await searchParams
  const session = await requirePagePermission('service.manage')
  const [services, intakeForms] = await Promise.all([
    getServicesList(session.businessId),
    prisma.intakeForm.findMany({
      where: { businessId: session.businessId, deletedAt: null, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

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
        intakeFormId: s.intakeFormId ?? null,
      }))}
      intakeForms={intakeForms}
      canManage={can(session, 'service.manage')}
      initialCreateOpen={sp.create === '1'}
    />
  )
}
