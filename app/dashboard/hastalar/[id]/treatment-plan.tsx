'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, CheckCircle2, Circle, Clock as ClockIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { addTreatmentPlanItem, updateTreatmentPlanItem, deleteTreatmentPlanItem } from '@/lib/actions/patients'

type PlanItem = {
  id: string
  title: string
  frequency: string | null
  status: 'AKTIF' | 'PLANLANDI' | 'BEKLIYOR' | 'TAMAMLANDI'
}

const STATUS_LABEL: Record<PlanItem['status'], string> = {
  AKTIF: 'Aktif',
  PLANLANDI: 'Planlandı',
  BEKLIYOR: 'Bekliyor',
  TAMAMLANDI: 'Tamamlandı',
}

const STATUS_BADGE: Record<PlanItem['status'], string> = {
  AKTIF: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PLANLANDI: 'bg-sky-50 text-sky-700 border-sky-200',
  BEKLIYOR: 'bg-amber-50 text-amber-700 border-amber-200',
  TAMAMLANDI: 'bg-slate-50 text-slate-600 border-slate-200',
}

export function TreatmentPlanBoard({
  patientId,
  items,
  canEdit,
}: {
  patientId: string
  items: PlanItem[]
  canEdit: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PlanItem | null>(null)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({ title: '', frequency: '', status: 'PLANLANDI' as PlanItem['status'] })

  function cycle(item: PlanItem) {
    const order: PlanItem['status'][] = ['PLANLANDI', 'AKTIF', 'BEKLIYOR', 'TAMAMLANDI']
    const next = order[(order.indexOf(item.status) + 1) % order.length]
    startTransition(async () => {
      const result = await updateTreatmentPlanItem({ id: item.id, status: next })
      if (!result.ok) { toast.error(result.error); return }
      router.refresh()
    })
  }

  function remove(item: PlanItem) {
    startTransition(async () => {
      const result = await deleteTreatmentPlanItem({ id: item.id })
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Silindi')
      setDeleteTarget(null)
      router.refresh()
    })
  }

  function add(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Başlık zorunlu'); return }
    startTransition(async () => {
      const result = await addTreatmentPlanItem({
        patientId,
        title: form.title.trim(),
        frequency: form.frequency.trim() || undefined,
        status: form.status,
      })
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Plan kalemi eklendi')
      setForm({ title: '', frequency: '', status: 'PLANLANDI' })
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henüz plan kalemi yok.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-lg border bg-white p-2.5">
              <button
                type="button"
                onClick={() => canEdit && cycle(item)}
                disabled={!canEdit || pending}
                className="shrink-0"
                title="Durumu değiştir"
              >
                {item.status === 'TAMAMLANDI' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : item.status === 'AKTIF' ? (
                  <CheckCircle2 className="h-5 w-5 text-sky-600" />
                ) : item.status === 'BEKLIYOR' ? (
                  <ClockIcon className="h-5 w-5 text-amber-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${item.status === 'TAMAMLANDI' ? 'line-through text-muted-foreground' : 'text-[#0C1D36]'}`}>
                  {item.title}
                </p>
                {item.frequency && <p className="text-[11px] text-muted-foreground">{item.frequency}</p>}
              </div>
              <Badge variant="outline" className={STATUS_BADGE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:text-rose-600 md:h-9 md:w-9"
                  disabled={pending}
                  aria-label={`${item.title} plan kalemini sil`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full mt-1 border-dashed"
          onClick={() => setOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Plan kalemi ekle
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tedavi Planına Ekle</DialogTitle></DialogHeader>
          <form onSubmit={add} className="grid gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Başlık *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tansiyon ölçümü" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Sıklık</Label>
              <Input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="Her gün, 2 hafta içinde..." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Durum</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PlanItem['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AKTIF">Aktif</SelectItem>
                  <SelectItem value="PLANLANDI">Planlandı</SelectItem>
                  <SelectItem value="BEKLIYOR">Bekliyor</SelectItem>
                  <SelectItem value="TAMAMLANDI">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>İptal</Button>
              <Button type="submit" disabled={pending} className="bg-[#0B7F6F] hover:bg-[#09685C] text-white">
                {pending ? 'Kaydediliyor...' : 'Ekle'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(next) => !next && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Plan kalemini sil</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `"${deleteTarget.title}" kalemi silinecek. Bu işlem geri alınamaz.` : 'Bu plan kalemi silinecek.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() => deleteTarget && remove(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
