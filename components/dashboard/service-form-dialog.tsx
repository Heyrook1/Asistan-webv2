'use client'

import { useEffect, useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { createService, updateService } from '@/lib/actions/services'
import { assignIntakeFormToService } from '@/lib/actions/intake-forms'

export type ServiceDraft = {
  id?: string
  name: string
  description: string
  category: string
  durationMin: number
  price: number
  currency: 'TRY' | 'USD' | 'EUR'
  color: string
  isActive: boolean
  intakeFormId?: string | null
}

const empty: ServiceDraft = {
  name: '',
  description: '',
  category: '',
  durationMin: 30,
  price: 0,
  currency: 'TRY',
  color: '#0071E3',
  isActive: true,
  intakeFormId: null,
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  onSaved,
  initial,
  intakeForms = [],
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved?: () => void
  initial?: ServiceDraft
  intakeForms?: Array<{ id: string; name: string }>
}) {
  const [draft, setDraft] = useState<ServiceDraft>(initial ?? empty)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (open) setDraft(initial ?? empty)
  }, [open, initial])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.name.trim()) { toast.error('Hizmet adı zorunlu'); return }
    startTransition(async () => {
      const payload = {
        name: draft.name.trim(),
        description: draft.description || undefined,
        category: draft.category || undefined,
        durationMin: Number(draft.durationMin),
        price: Number(draft.price),
        currency: draft.currency,
        color: draft.color,
        isActive: draft.isActive,
      }
      const result = draft.id
        ? await updateService({ id: draft.id, ...payload })
        : await createService(payload)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      const serviceId = draft.id ?? (result.ok && 'data' in result ? result.data?.id : undefined)
      if (serviceId && intakeForms.length > 0) {
        const assign = await assignIntakeFormToService({
          serviceId,
          intakeFormId: draft.intakeFormId ?? null,
        })
        if (!assign.ok) {
          toast.error(assign.error)
          return
        }
      }

      toast.success(draft.id ? 'Hizmet güncellendi' : 'Hizmet eklendi')
      onSaved?.()
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{draft.id ? 'Hizmeti Düzenle' : 'Yeni Hizmet'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Hizmet Adı *</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Süre (dk) *</Label>
              <Input
                type="number"
                min={5}
                max={720}
                value={draft.durationMin}
                onChange={(e) => setDraft({ ...draft, durationMin: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Fiyat (TL) *</Label>
              <Input
                type="number"
                min={0}
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Kategori</Label>
              <Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Genel Muayene" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Renk</Label>
              <Input type="color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Açıklama</Label>
            <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={3} />
          </div>
          {intakeForms.length > 0 ? (
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Ön kayıt anketi</Label>
              <select
                className="h-10 w-full rounded-md border px-3 text-sm"
                value={draft.intakeFormId ?? ''}
                onChange={(e) =>
                  setDraft({ ...draft, intakeFormId: e.target.value ? e.target.value : null })
                }
              >
                <option value="">Klinik varsayılanı / yok</option>
                {intakeForms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={draft.isActive} onCheckedChange={(v) => setDraft({ ...draft, isActive: v })} />
            Aktif
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
            <Button type="submit" disabled={pending} className="bg-brand-teal hover:bg-brand-teal-hover text-white">
              {pending ? 'Kaydediliyor...' : draft.id ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
