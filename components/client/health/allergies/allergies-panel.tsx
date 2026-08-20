'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Plus, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

import { useLanguage } from '@/hooks/useLanguage'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/client/ui'
import { clientFetch, clientFetchData } from '@/lib/client-marketplace/client-fetch'
import { ALLERGY_SEVERITIES } from '@/lib/client-marketplace/health-records/schemas'
import type { AllergySeverity } from '@/lib/client-marketplace/health-records/schemas'
import type { AllergyDto } from '@/lib/client-marketplace/health-records/types'
import {
  ConfirmDialog,
  DetailRow,
  Field,
  SelectInput,
  SheetModal,
  SubmitButton,
  TextArea,
  TextInput,
  DateInput,
} from '@/components/client/health/form-kit'
import {
  ALLERGY_SEVERITY_LABELS,
  OFFLINE_COPY,
  SourceBadge,
  formatHealthDate,
  isBrowserOffline,
  severityToneClass,
} from '@/components/client/health/health-shared'
import { SignedOutNotice } from '@/components/client/health/signed-out-notice'

type FormState = {
  name: string
  reaction: string
  severity: AllergySeverity
  firstObservedAt: string
  notes: string
}

const EMPTY_FORM: FormState = {
  name: '',
  reaction: '',
  severity: 'UNKNOWN',
  firstObservedAt: '',
  notes: '',
}

function toFormState(a: AllergyDto): FormState {
  return {
    name: a.name,
    reaction: a.reaction ?? '',
    severity: a.severity,
    firstObservedAt: a.firstObservedAt ? a.firstObservedAt.slice(0, 10) : '',
    notes: a.notes ?? '',
  }
}

export function AllergiesPanel() {
  const { t, language } = useLanguage()
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'signed-out'>('loading')
  const [items, setItems] = useState<AllergyDto[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AllergyDto | null>(null)
  const [detail, setDetail] = useState<AllergyDto | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AllergyDto | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setStatus((s) => (s === 'ready' ? 'ready' : 'loading'))
    try {
      const result = await clientFetchData<{ items: AllergyDto[] }>('/api/client/health/allergies')
      setItems(result.items)
      setStatus('ready')
    } catch (error) {
      setStatus(error instanceof Error && error.message === 'AUTH_REQUIRED' ? 'signed-out' : 'error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (a: AllergyDto) => {
    setEditing(a)
    setDetail(null)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    if (isBrowserOffline()) {
      toast.error(t(OFFLINE_COPY))
      return
    }
    setBusy(true)
    try {
      await clientFetch(`/api/client/health/allergies/${confirmDelete.id}`, { method: 'DELETE' })
      toast.success(t({ tr: 'Alerji kaydı silindi', en: 'Allergy deleted' }))
      setConfirmDelete(null)
      setDetail(null)
      await load()
    } catch {
      toast.error(t({ tr: 'Silinemedi, tekrar deneyin', en: 'Could not delete, try again' }))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="space-y-4 px-0.5 py-2">
      <Link
        href="/client/health"
        className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-[var(--rz-blue)]"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t({ tr: 'Sağlık', en: 'Health' })}
      </Link>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[var(--rz-blue-soft)] text-[var(--rz-blue)]">
            <ShieldAlert className="size-5" aria-hidden />
          </span>
          <h1 className="rz-title text-slate-900">{t({ tr: 'Alerjilerim', en: 'My allergies' })}</h1>
        </div>
        {status === 'ready' ? (
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--rz-blue)] px-4 text-sm font-bold text-white transition hover:bg-[var(--rz-blue-hover)] active:scale-[0.98]"
          >
            <Plus className="size-4" aria-hidden />
            {t({ tr: 'Alerji ekle', en: 'Add' })}
          </button>
        ) : null}
      </div>

      {status === 'signed-out' ? <SignedOutNotice /> : null}
      {status === 'loading' ? <ListSkeleton count={2} /> : null}
      {status === 'error' ? (
        <ErrorState
          title={t({ tr: 'Alerjiler yüklenemedi', en: 'Could not load allergies' })}
          description={t({ tr: 'Bağlantınızı kontrol edip yeniden deneyin.', en: 'Check your connection and try again.' })}
          retryLabel={t({ tr: 'Yeniden dene', en: 'Try again' })}
          onRetry={() => void load()}
        />
      ) : null}

      {status === 'ready' ? (
        items.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title={t({ tr: 'Kayıtlı alerji bulunmuyor', en: 'No allergies recorded' })}
            description={t({
              tr: 'Bilinen bir alerjiniz veya hassasiyetiniz varsa Pasaportunuza ekleyebilirsiniz.',
              en: 'If you have a known allergy or sensitivity, you can add it to your Passport.',
            })}
            actionLabel={t({ tr: 'Alerji ekle', en: 'Add allergy' })}
            onAction={openAdd}
          />
        ) : (
          <ul className="space-y-2">
            {items.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setDetail(a)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-[var(--rz-border)] bg-white px-4 py-3 text-left shadow-sm transition hover:border-[var(--rz-blue)]/30 active:scale-[0.99]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="truncate rz-card-title text-slate-900">{a.name}</span>
                    <span className="mt-0.5 block truncate rz-secondary">
                      {a.reaction || t({ tr: 'Reaksiyon belirtilmedi', en: 'No reaction noted' })}
                    </span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${severityToneClass(a.severity)}`}>
                    {t(ALLERGY_SEVERITY_LABELS[a.severity])}
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-slate-300" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )
      ) : null}

      <AllergyForm
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={async () => {
          setFormOpen(false)
          await load()
        }}
      />

      {detail ? (
        <SheetModal open={!!detail} onClose={() => setDetail(null)} title={detail.name}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold ${severityToneClass(detail.severity)}`}>
              {t(ALLERGY_SEVERITY_LABELS[detail.severity])}
            </span>
            <SourceBadge source={detail.source} language={language} />
          </div>
          <dl>
            <DetailRow label={t({ tr: 'Reaksiyon', en: 'Reaction' })} value={detail.reaction} />
            <DetailRow
              label={t({ tr: 'İlk fark edildiği tarih', en: 'First observed' })}
              value={detail.firstObservedAt ? formatHealthDate(detail.firstObservedAt, language) : null}
            />
            <DetailRow label={t({ tr: 'Not', en: 'Note' })} value={detail.notes} />
          </dl>
          <div className="mt-5 flex flex-col gap-2">
            {detail.editable ? (
              <>
                <SubmitButton type="button" onClick={() => openEdit(detail)}>
                  {t({ tr: 'Düzenle', en: 'Edit' })}
                </SubmitButton>
                <SubmitButton type="button" variant="danger" onClick={() => setConfirmDelete(detail)}>
                  {t({ tr: 'Sil', en: 'Delete' })}
                </SubmitButton>
              </>
            ) : (
              <p className="rounded-xl bg-[var(--rz-surface-soft)] px-4 py-3 rz-secondary">
                {t({
                  tr: 'Bu kayıt bir klinik tarafından oluşturuldu ve yalnızca görüntülenebilir.',
                  en: 'This record was created by a clinic and is view-only.',
                })}
              </p>
            )}
          </div>
        </SheetModal>
      ) : null}

      <ConfirmDialog
        open={!!confirmDelete}
        title={t({ tr: 'Alerji kaydını sil', en: 'Delete allergy' })}
        description={t({
          tr: 'Bu alerji kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
          en: 'Are you sure you want to delete this allergy? This cannot be undone.',
        })}
        confirmLabel={t({ tr: 'Evet, sil', en: 'Yes, delete' })}
        cancelLabel={t({ tr: 'Vazgeç', en: 'Cancel' })}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDelete(null)}
        loading={busy}
      />
    </main>
  )
}

function AllergyForm({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean
  editing: AllergyDto | null
  onClose: () => void
  onSaved: () => void | Promise<void>
}) {
  const { t } = useLanguage()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [nameError, setNameError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(editing ? toFormState(editing) : EMPTY_FORM)
      setNameError(null)
      setDirty(false)
    }
  }, [open, editing])

  const update = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
  }

  const requestClose = () => {
    if (dirty && !window.confirm(t({ tr: 'Kaydedilmemiş değişiklikler var. Çıkılsın mı?', en: 'You have unsaved changes. Discard them?' }))) {
      return
    }
    onClose()
  }

  const submit = async () => {
    if (!form.name.trim()) {
      setNameError(t({ tr: 'Alerji adı zorunludur', en: 'Allergy name is required' }))
      return
    }
    if (isBrowserOffline()) {
      toast.error(t(OFFLINE_COPY))
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      reaction: form.reaction.trim() || null,
      severity: form.severity,
      firstObservedAt: form.firstObservedAt || null,
      notes: form.notes.trim() || null,
    }
    try {
      if (editing) {
        await clientFetch(`/api/client/health/allergies/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        toast.success(t({ tr: 'Alerji güncellendi', en: 'Allergy updated' }))
      } else {
        await clientFetch('/api/client/health/allergies', { method: 'POST', body: JSON.stringify(payload) })
        toast.success(t({ tr: 'Alerji kaydedildi', en: 'Allergy saved' }))
      }
      await onSaved()
    } catch (error) {
      toast.error(
        error instanceof Error && error.message !== 'Request failed'
          ? error.message
          : t({ tr: 'Kaydedilemedi, tekrar deneyin', en: 'Could not save, try again' }),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <SheetModal open={open} onClose={requestClose} title={editing ? t({ tr: 'Alerjiyi düzenle', en: 'Edit allergy' }) : t({ tr: 'Alerji ekle', en: 'Add allergy' })}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <Field label={t({ tr: 'Alerji / hassasiyet', en: 'Allergy / sensitivity' })} required error={nameError} htmlFor="alg-name">
          <TextInput
            id="alg-name"
            value={form.name}
            invalid={!!nameError}
            onChange={(e) => {
              update('name', e.target.value)
              if (nameError) setNameError(null)
            }}
            placeholder={t({ tr: 'Örn. Penisilin', en: 'e.g. Penicillin' })}
            autoFocus
          />
        </Field>
        <Field label={t({ tr: 'Reaksiyon', en: 'Reaction' })} htmlFor="alg-reaction">
          <TextInput id="alg-reaction" value={form.reaction} onChange={(e) => update('reaction', e.target.value)} placeholder={t({ tr: 'Örn. Döküntü', en: 'e.g. Rash' })} />
        </Field>
        <Field label={t({ tr: 'Şiddet', en: 'Severity' })} htmlFor="alg-severity">
          <SelectInput id="alg-severity" value={form.severity} onChange={(e) => update('severity', e.target.value)}>
            {ALLERGY_SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {t(ALLERGY_SEVERITY_LABELS[s])}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label={t({ tr: 'İlk fark edildiği tarih', en: 'First observed date' })} htmlFor="alg-date">
          <DateInput id="alg-date" value={form.firstObservedAt} onChange={(e) => update('firstObservedAt', e.target.value)} />
        </Field>
        <Field label={t({ tr: 'Not', en: 'Note' })} htmlFor="alg-notes">
          <TextArea id="alg-notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
        </Field>
        <SubmitButton loading={saving}>{t({ tr: 'Kaydet', en: 'Save' })}</SubmitButton>
      </form>
    </SheetModal>
  )
}
