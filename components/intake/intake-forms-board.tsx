'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ClipboardList, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/dashboard/empty-state'
import { deleteIntakeForm } from '@/lib/actions/intake-forms'

export type IntakeFormListItem = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  isDefault: boolean
  fieldCount: number
  serviceCount: number
  updatedAt: string
}

export function IntakeFormsBoard({
  forms,
  canManage,
}: {
  forms: IntakeFormListItem[]
  canManage: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const sorted = useMemo(
    () => [...forms].sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.name.localeCompare(b.name, 'tr')),
    [forms]
  )

  function remove(id: string) {
    if (!confirm('Bu anketi silmek istiyor musunuz?')) return
    setBusyId(id)
    startTransition(async () => {
      const result = await deleteIntakeForm(id)
      if (!result.ok) {
        toast.error(result.error)
        setBusyId(null)
        return
      }
      toast.success('Anket silindi')
      router.refresh()
      setBusyId(null)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Ön kayıt anketleri</h1>
          <p className="text-sm text-muted-foreground">
            Muayene öncesi formlar. Hizmete atayın veya varsayılan yapın; cevaplar hasta kartına düşer.
          </p>
        </div>
        {canManage ? (
          <Button asChild className="bg-brand-teal text-white hover:bg-brand-teal-hover">
            <Link href="/dashboard/anketler/yeni">
              <Plus className="mr-1.5 size-4" />
              Yeni anket
            </Link>
          </Button>
        ) : null}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title="Henüz anket yok"
          description="Örn. şikayet öyküsü, ilaç listesi, alerji onayı."
          ctaLabel={canManage ? 'İlk anketi oluştur' : undefined}
          ctaHref={canManage ? '/dashboard/anketler/yeni' : undefined}
        />
      ) : (
        <div className="grid gap-3">
          {sorted.map((form) => (
            <Card key={form.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-brand-ink">{form.name}</p>
                    {form.isDefault ? <Badge className="bg-brand-teal/10 text-brand-teal">Varsayılan</Badge> : null}
                    {!form.isActive ? <Badge variant="outline">Pasif</Badge> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {form.fieldCount} alan · {form.serviceCount} hizmet · güncellendi{' '}
                    {new Date(form.updatedAt).toLocaleDateString('tr-TR')}
                  </p>
                  {form.description ? <p className="text-sm text-slate-600">{form.description}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/anketler/${form.id}`}>Düzenle</Link>
                  </Button>
                  {canManage ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pending && busyId === form.id}
                      onClick={() => remove(form.id)}
                    >
                      <Trash2 className="mr-1 size-3.5" />
                      Sil
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
