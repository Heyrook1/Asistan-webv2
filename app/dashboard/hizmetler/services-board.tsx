'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ServiceFormDialog, type ServiceDraft } from '@/components/dashboard/service-form-dialog'
import { EmptyState } from '@/components/dashboard/empty-state'
import { deleteService, toggleServiceActive } from '@/lib/actions/services'
import { formatCurrency, formatDuration } from '@/lib/format'

export function ServicesBoard({
  services,
  canManage,
}: {
  services: ServiceDraft[]
  canManage: boolean
}) {
  const router = useRouter()
  const [dialog, setDialog] = useState<{ open: boolean; initial?: ServiceDraft }>({ open: false })
  const [pending, startTransition] = useTransition()

  function toggle(id: string, isActive: boolean) {
    startTransition(async () => {
      const result = await toggleServiceActive({ id, isActive })
      if (!result.ok) { toast.error(result.error); return }
      toast.success(isActive ? 'Hizmet aktifleştirildi' : 'Hizmet pasifleştirildi')
      router.refresh()
    })
  }

  function remove(id: string) {
    if (!confirm('Bu hizmeti silmek istediğinize emin misiniz? (Mevcut randevular varsa pasifleştirilecek.)')) return
    startTransition(async () => {
      const result = await deleteService({ id })
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Hizmet silindi')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D36]">Hizmetler</h1>
          <p className="text-sm text-muted-foreground">
            {services.length} hizmet • {services.filter((s) => s.isActive).length} aktif
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setDialog({ open: true })} className="bg-[#12C8AD] hover:bg-[#10b49c] text-white">
            <Plus className="mr-2 h-4 w-4" /> Hizmet Ekle
          </Button>
        )}
      </div>

      {services.length === 0 ? (
        <EmptyState
          title="Henüz hizmet yok"
          description="Bir hizmet ekleyerek randevu oluşturmayı aktif edin."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Card key={s.id} className={s.isActive ? '' : 'opacity-70'}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ background: s.color }} />
                    <p className="font-semibold text-[#0C1D36] truncate">{s.name}</p>
                  </div>
                  {s.category && <Badge variant="outline">{s.category}</Badge>}
                </div>
                {s.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatDuration(s.durationMin)}</span>
                  <span className="font-semibold text-[#0C1D36]">{formatCurrency(s.price, s.currency)}</span>
                </div>
                {canManage && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Switch checked={s.isActive} onCheckedChange={(v) => toggle(s.id!, v)} disabled={pending} />
                      {s.isActive ? 'Aktif' : 'Pasif'}
                    </label>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDialog({ open: true, initial: s })}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600" onClick={() => remove(s.id!)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ServiceFormDialog
        open={dialog.open}
        onOpenChange={(v) => setDialog({ open: v })}
        initial={dialog.initial}
        onSaved={() => router.refresh()}
      />
    </div>
  )
}
