import { requirePagePermission, can } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { IntakeFormsBoard } from '@/components/intake/intake-forms-board'
import { parseIntakeFields } from '@/lib/intake/schema'

export const dynamic = 'force-dynamic'

export default async function AnketlerPage() {
  const session = await requirePagePermission('service.manage')
  const forms = await prisma.intakeForm.findMany({
    where: { businessId: session.businessId, deletedAt: null },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    include: {
      _count: { select: { services: true } },
    },
  })

  return (
    <IntakeFormsBoard
      canManage={can(session, 'service.manage')}
      forms={forms.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        isActive: f.isActive,
        isDefault: f.isDefault,
        fieldCount: parseIntakeFields(f.fields).length,
        serviceCount: f._count.services,
        updatedAt: f.updatedAt.toISOString(),
      }))}
    />
  )
}
