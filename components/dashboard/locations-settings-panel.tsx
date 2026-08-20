'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AccessibleField } from '@/components/ui/accessible-field'
import { toast } from 'sonner'
import { createLocation, updateLocation } from '@/lib/actions/locations'
import { MapPin, Pencil, Plus } from 'lucide-react'

export type LocationSettingsRow = {
  id: string
  name: string
  address: string | null
  city: string | null
  phone: string | null
  isActive: boolean
}

type Draft = {
  name: string
  address: string
  city: string
  phone: string
}

const emptyDraft = (): Draft => ({ name: '', address: '', city: '', phone: '' })

export function LocationsSettingsPanel({
  locations,
  canManage,
  businessDefaults,
}: {
  locations: LocationSettingsRow[]
  canManage: boolean
  /** Prefill first-branch form from işletme profili (user still confirms name). */
  businessDefaults?: { name?: string; address?: string; city?: string; phone?: string }
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(locations.length === 0)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash !== '#settings-locations') return
    document.getElementById('settings-locations')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  function startCreate() {
    setEditingId(null)
    setCreating(true)
    setDraft({
      name: businessDefaults?.name?.trim() ? `${businessDefaults.name.trim()} — Ana şube` : '',
      address: businessDefaults?.address ?? '',
      city: businessDefaults?.city ?? '',
      phone: businessDefaults?.phone ?? '',
    })
  }

  function startEdit(row: LocationSettingsRow) {
    setCreating(false)
    setEditingId(row.id)
    setDraft({
      name: row.name,
      address: row.address ?? '',
      city: row.city ?? '',
      phone: row.phone ?? '',
    })
  }

  function cancelForm() {
    setCreating(false)
    setEditingId(null)
    setDraft(emptyDraft())
  }

  function submit() {
    const name = draft.name.trim()
    if (name.length < 2) {
      toast.error('Şube adı en az 2 karakter olmalı')
      return
    }

    startTransition(async () => {
      const payload = {
        name,
        address: draft.address.trim() || undefined,
        city: draft.city.trim() || undefined,
        phone: draft.phone.trim() || undefined,
      }

      const result = editingId
        ? await updateLocation({ id: editingId, ...payload })
        : await createLocation(payload)

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success(editingId ? 'Şube güncellendi' : 'Şube oluşturuldu — randevu formunda seçilebilir')
      cancelForm()
      router.refresh()
    })
  }

  return (
    <section
      id="lokasyonlar"
      className="scroll-mt-24 rounded-xl border border-border/70 bg-slate-50/70 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
            <MapPin className="h-4 w-4 text-brand-teal" aria-hidden />
            Şubeler
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Randevu ve genel rezervasyon linki şube kaydı ister. Şube adı, adres ve telefon burada
            açıkça tanımlanır; randevu kaydı gizli şube oluşturmaz.
          </p>
        </div>
        {canManage && !creating && !editingId ? (
          <Button type="button" variant="outline" size="sm" onClick={startCreate} className="shrink-0">
            <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Şube ekle
          </Button>
        ) : null}
      </div>

      {locations.length === 0 && !creating ? (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          Henüz şube yok. Randevu oluşturmadan önce en az bir şube ekleyin.
          {!canManage ? ' İşletme sahibinden şube kurulumunu isteyin.' : null}
        </div>
      ) : null}

      {locations.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {locations.map((row) => (
            <li
              key={row.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-white px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brand-ink">{row.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {[row.city, row.address, row.phone].filter(Boolean).join(' · ') || 'Adres / telefon eklenmemiş'}
                </p>
                {!row.isActive ? (
                  <p className="mt-1 text-[11px] font-medium text-rose-600">Pasif</p>
                ) : null}
              </div>
              {canManage ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(row)}
                  aria-label={`${row.name} düzenle`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {(creating || editingId) && canManage ? (
        <div className="mt-3 space-y-3 rounded-lg border border-brand-teal/30 bg-white p-3">
          <p className="text-xs font-semibold text-brand-ink">
            {editingId ? 'Şubeyi düzenle' : 'Yeni şube — kaydetmeden oluşturulmaz'}
          </p>
          <AccessibleField label="Şube adı *" labelClassName="mb-1 block text-xs text-muted-foreground">
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Örn. Lefkoşa Ana Klinik"
              maxLength={120}
              required
            />
          </AccessibleField>
          <div className="grid gap-3 sm:grid-cols-2">
            <AccessibleField label="Şehir" labelClassName="mb-1 block text-xs text-muted-foreground">
              <Input
                value={draft.city}
                onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                placeholder="Lefkoşa"
              />
            </AccessibleField>
            <AccessibleField label="Telefon" labelClassName="mb-1 block text-xs text-muted-foreground">
              <Input
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                placeholder="+90 392 …"
              />
            </AccessibleField>
          </div>
          <AccessibleField label="Adres" labelClassName="mb-1 block text-xs text-muted-foreground">
            <Textarea
              value={draft.address}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              rows={2}
              placeholder="Cadde, mahalle, bina no"
            />
          </AccessibleField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={cancelForm} disabled={pending}>
              Vazgeç
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={submit}
              disabled={pending}
              className="bg-brand-teal text-white hover:bg-brand-teal-hover"
            >
              {pending ? 'Kaydediliyor…' : editingId ? 'Güncelle' : 'Şubeyi kaydet'}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
