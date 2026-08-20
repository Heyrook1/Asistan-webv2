import Link from 'next/link'
import { requirePagePermission } from '@/lib/session'
import { IntakeFormEditor } from '@/components/intake/intake-form-editor'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function YeniAnketPage() {
  await requirePagePermission('service.manage')
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Yeni ön kayıt anketi</h1>
          <p className="text-sm text-muted-foreground">Alanları ekleyin; sonra hizmete atayın veya varsayılan yapın.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/anketler">Listeye dön</Link>
        </Button>
      </div>
      <IntakeFormEditor mode="create" />
    </div>
  )
}
