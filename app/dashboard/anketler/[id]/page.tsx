import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requirePagePermission } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { IntakeFormEditor } from '@/components/intake/intake-form-editor'
import { parseIntakeFields } from '@/lib/intake/schema'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AnketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await requirePagePermission('service.manage')
  const form = await prisma.intakeForm.findFirst({
    where: { id, businessId: session.businessId, deletedAt: null },
  })
  if (!form) notFound()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">{form.name}</h1>
          <p className="text-sm text-muted-foreground">Anket düzenleme</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/anketler">Listeye dön</Link>
        </Button>
      </div>
      <IntakeFormEditor
        mode="edit"
        initial={{
          id: form.id,
          name: form.name,
          description: form.description,
          fields: parseIntakeFields(form.fields),
          isActive: form.isActive,
          isDefault: form.isDefault,
        }}
      />
    </div>
  )
}
