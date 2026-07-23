'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createIntakeForm, updateIntakeForm } from '@/lib/actions/intake-forms'
import {
  INTAKE_FIELD_TYPES,
  type IntakeFieldDef,
  type IntakeFieldTypeValue,
} from '@/lib/intake/schema'

function newField(type: IntakeFieldTypeValue = 'TEXT'): IntakeFieldDef {
  return {
    id: `f_${Math.random().toString(36).slice(2, 10)}`,
    type,
    label: type === 'CHECKBOX' ? 'Onay' : 'Yeni alan',
    required: false,
    placeholder: '',
    options: type === 'SELECT' ? ['Seçenek 1', 'Seçenek 2'] : null,
  }
}

export function IntakeFormEditor({
  mode,
  initial,
}: {
  mode: 'create' | 'edit'
  initial?: {
    id: string
    name: string
    description: string | null
    fields: IntakeFieldDef[]
    isActive: boolean
    isDefault: boolean
  }
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false)
  const [fields, setFields] = useState<IntakeFieldDef[]>(
    initial?.fields?.length ? initial.fields : [newField('TEXTAREA')]
  )

  function updateField(id: string, patch: Partial<IntakeFieldDef>) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  function save() {
    startTransition(async () => {
      const payload = {
        name,
        description: description.trim() || undefined,
        fields: fields.map((f) => ({
          ...f,
          placeholder: f.placeholder || null,
          options: f.type === 'SELECT' ? f.options?.filter(Boolean) ?? [] : null,
        })),
        isActive,
        isDefault,
      }

      const result =
        mode === 'create'
          ? await createIntakeForm(payload)
          : await updateIntakeForm({ id: initial!.id, ...payload })

      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(mode === 'create' ? 'Anket oluşturuldu' : 'Anket güncellendi')
      if (mode === 'create' && result.ok && 'data' in result && result.data?.id) {
        router.push(`/dashboard/anketler/${result.data.id}`)
        router.refresh()
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs text-muted-foreground">Anket adı *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs text-muted-foreground">Açıklama</label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <label className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
            Aktif
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </label>
          <label className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
            Klinik varsayılanı
            <Switch checked={isDefault} onCheckedChange={setIsDefault} />
          </label>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-brand-ink">Alanlar</h2>
        <Button type="button" variant="outline" size="sm" onClick={() => setFields((p) => [...p, newField()])}>
          <Plus className="mr-1 size-3.5" />
          Alan ekle
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Etiket</label>
                <Input value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">Tip</label>
                <select
                  className="h-10 w-full rounded-md border px-3 text-sm"
                  value={field.type}
                  onChange={(e) => {
                    const type = e.target.value as IntakeFieldTypeValue
                    updateField(field.id, {
                      type,
                      options: type === 'SELECT' ? field.options?.length ? field.options : ['Seçenek 1'] : null,
                    })
                  }}
                >
                  {INTAKE_FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              {field.type !== 'CHECKBOX' && field.type !== 'SELECT' ? (
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs text-muted-foreground">Placeholder</label>
                  <Input
                    value={field.placeholder ?? ''}
                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                  />
                </div>
              ) : null}
              {field.type === 'SELECT' ? (
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs text-muted-foreground">Seçenekler (satır satır)</label>
                  <Textarea
                    rows={3}
                    value={(field.options ?? []).join('\n')}
                    onChange={(e) =>
                      updateField(field.id, {
                        options: e.target.value
                          .split('\n')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              ) : null}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(field.id, { required: e.target.checked })}
                />
                Zorunlu
              </label>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={fields.length <= 1}
                  onClick={() => setFields((p) => p.filter((f) => f.id !== field.id))}
                >
                  <Trash2 className="mr-1 size-3.5" />
                  Alan {index + 1}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/dashboard/anketler')}>
          Geri
        </Button>
        <Button
          type="button"
          disabled={pending || name.trim().length < 2 || fields.length === 0}
          className="bg-brand-teal text-white hover:bg-brand-teal-hover"
          onClick={save}
        >
          {pending ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
      </div>
    </div>
  )
}
