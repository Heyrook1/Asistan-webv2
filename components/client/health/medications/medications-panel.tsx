'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, Pill, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { useLanguage } from '@/hooks/useLanguage'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/client/ui'
import {
  clientFetchData,
  clientFetch,
} from '@/lib/client-marketplace/client-fetch'
import type {
  MedicationDto,
  MedicationListResult,
} from '@/lib/client-marketplace/health-records/types'
import {
  ConfirmDialog,
  DetailRow,
  Field,
  SheetModal,
  SubmitButton,
  TextArea,
  TextInput,
  DateInput,
} from '@/components/client/health/form-kit'
import {
  MEDICATION_STATUS_LABELS,
  OFFLINE_COPY,
  SourceBadge,
  formatHealthDate,
  isBrowserOffline,
} from '@/components/client/health/health-shared'
import { SignedOutNotice } from '@/components/client/health/signed-out-notice'

type FormState = {
  name: string
  strength: string
  frequency: string
  startDate: string
  endDate: string
  instructions: string
  notes: string
}

const EMPTY_FORM: FormState = {
  name: '',
  strength: '',
  frequency: '',
  startDate: '',
  endDate: '',
  instructions: '',
  notes: '',
}

function toFormState(m: MedicationDto): FormState {
  return {
    name: m.name,
    strength: m.strength ?? '',
    frequency: m.frequency ?? '',
    startDate: m.startDate ? m.startDate.slice(0, 10) : '',
    endDate: m.endDate ? m.endDate.slice(0, 10) : '',
    instructions: m.instructions ?? '',
    notes: m.notes ?? '',
  }
}

export function MedicationsPanel() {
  const { t, language } = useLanguage()
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'signed-out'>('loading')
  const [data, setData] = useState<MedicationListResult>({ active: [], previous: [] })
  const [tab, setTab] = useState<'active' | 'previous'>('active')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MedicationDto | null>(null)
  const [detail, setDetail] = useState<MedicationDto | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<MedicationDto | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setStatus((s) => (s === 'ready' ? 'ready' : 'loading'))
    try {
      const result = await clientFetchData<MedicationListResult>('/api/client/health/medications')
      setData(result)
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
  const openEdit = (m: MedicationDto) => {
    setEditing(m)
    setDetail(null)
    setFormOpen(true)
  }

  const handleStop = async (m: MedicationDto) => {
    if (isBrowserOffline()) {
      toast.error(t(OFFLINE_COPY))
      return
    }
    setBusy(true)
    try {
      await clientFetch(`/api/client/health/medications/${m.id}/stop`, { method: 'POST', body: '{}' })
      toast.success(t({ tr: 'İlaç sonlandırıldı', en: 'Medication stopped' }))
      setDetail(null)
      await load()
    } catch {
      toast.error(t({ tr: 'İşlem tamamlanamadı', en: 'Could not complete the action' }))
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    if (isBrowserOffline()) {
      toast.error(t(OFFLINE_COPY))
      return
    }
    setBusy(true)
    try {
      await clientFetch(`/api/client/health/medications/${confirmDelete.id}`, { method: 'DELETE' })
      toast.success(t({ tr: 'İlaç kaydı silindi', en: 'Medication deleted' }))
      setConfirmDelete(null)
      setDetail(null)
      await load()
    } catch {
      toast.error(t({ tr: 'Silinemedi, tekrar deneyin', en: 'Could not delete, try again' }))
    } finally {
      setBusy(false)
    }
  }

  const list = tab === 'active' ? data.active : data.previous

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
            <Pill className="size-5" aria-hidden />
          </span>
          <h1 className="rz-title text-slate-900">{t({ tr: 'İlaçlarım', en: 'My medications' })}</h1>
        </div>
        {status === 'ready' ? (
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--rz-blue)] px-4 text-sm font-bold text-white transition hover:bg-[var(--rz-blue-hover)] active:scale-[0.98]"
          >
            <Plus className="size-4" aria-hidden />
            {t({ tr: 'İlaç ekle', en: 'Add' })}
          </button>
        ) : null}
      </div>

      {status === 'signed-out' ? <SignedOutNotice /> : null}

      {status === 'loading' ? <ListSkeleton count={3} /> : null}

      {status === 'error' ? (
        <ErrorState
          title={t({ tr: 'İlaçlar yüklenemedi', en: 'Could not load medications' })}
          description={t({
            tr: 'Bağlantınızı kontrol edip yeniden deneyin.',
            en: 'Check your connection and try again.',
          })}
          retryLabel={t({ tr: 'Yeniden dene', en: 'Try again' })}
          onRetry={() => void load()}
        />
      ) : null}

      {status === 'ready' ? (
        <>
          <div className="flex rounded-full bg-slate-100 p-1" role="tablist">
            {(['active', 'previous'] as const).map((key) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`flex-1 rounded-full px-3 py-2 text-[13px] font-bold transition ${
                  tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                {key === 'active'
                  ? t({ tr: `Aktif (${data.active.length})`, en: `Active (${data.active.length})` })
                  : t({ tr: `Önceki (${data.previous.length})`, en: `Previous (${data.previous.length})` })}
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <EmptyState
              icon={Pill}
              title={
                tab === 'active'
                  ? t({ tr: 'Aktif ilaç kaydınız yok', en: 'No active medications' })
                  : t({ tr: 'Önceki ilaç kaydı yok', en: 'No previous medications' })
              }
              description={t({
                tr: 'Kullandığınız bir ilacı Pasaportunuza ekleyebilirsiniz.',
                en: 'You can add a medication you take to your Passport.',
              })}
              actionLabel={tab === 'active' ? t({ tr: 'İlaç ekle', en: 'Add medication' }) : undefined}
              onAction={tab === 'active' ? openAdd : undefined}
            />
          ) : (
            <ul className="space-y-2">
              {list.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setDetail(m)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-[var(--rz-border)] bg-white px-4 py-3 text-left shadow-sm transition hover:border-[var(--rz-blue)]/30 active:scale-[0.99]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate rz-card-title text-slate-900">{m.name}</span>
                        {m.strength ? <span className="shrink-0 text-[13px] text-slate-500">{m.strength}</span> : null}
                      </span>
                      <span className="mt-0.5 block truncate rz-secondary">
                        {[m.frequency, m.startDate ? formatHealthDate(m.startDate, language) : null]
                          .filter(Boolean)
                          .join(' · ') || t(MEDICATION_STATUS_LABELS[m.status])}
                      </span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-slate-300" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="rz-caption px-1 text-center">
            {t({
              tr: 'Bu alan bir reçeteleme aracı değildir; doz veya tedavi önerisi sunmaz.',
              en: 'This is not a prescribing tool; it does not provide dosage or treatment advice.',
            })}
          </p>
        </>
      ) : null}

      <MedicationForm
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={async () => {
          setFormOpen(false)
          await load()
        }}
      />

      <MedicationDetailSheet
        medication={detail}
        onClose={() => setDetail(null)}
        onEdit={openEdit}
        onStop={handleStop}
        onDelete={(m) => setConfirmDelete(m)}
        busy={busy}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title={t({ tr: 'İlaç kaydını sil', en: 'Delete medication' })}
        description={t({
          tr: 'Bu ilaç kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
          en: 'Are you sure you want to delete this medication? This cannot be undone.',
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

function MedicationForm({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean
  editing: MedicationDto | null
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
      setNameError(t({ tr: 'İlaç adı zorunludur', en: 'Medication name is required' }))
      return
    }
    if (isBrowserOffline()) {
      toast.error(t(OFFLINE_COPY))
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      strength: form.strength.trim() || null,
      frequency: form.frequency.trim() || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      instructions: form.instructions.trim() || null,
      notes: form.notes.trim() || null,
    }
    try {
      if (editing) {
        await clientFetch(`/api/client/health/medications/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
        toast.success(t({ tr: 'İlaç güncellendi', en: 'Medication updated' }))
      } else {
        await clientFetch('/api/client/health/medications', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        toast.success(t({ tr: 'İlaç Pasaportunuza eklendi', en: 'Medication added to your Passport' }))
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
    <SheetModal
      open={open}
      onClose={requestClose}
      title={editing ? t({ tr: 'İlacı düzenle', en: 'Edit medication' }) : t({ tr: 'İlaç ekle', en: 'Add medication' })}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <Field label={t({ tr: 'İlaç adı', en: 'Medication name' })} required error={nameError} htmlFor="med-name">
          <TextInput
            id="med-name"
            value={form.name}
            invalid={!!nameError}
            onChange={(e) => {
              update('name', e.target.value)
              if (nameError) setNameError(null)
            }}
            placeholder={t({ tr: 'Örn. Metformin', en: 'e.g. Metformin' })}
            autoFocus
          />
        </Field>
        <Field label={t({ tr: 'Doz / güç', en: 'Dosage / strength' })} htmlFor="med-strength">
          <TextInput id="med-strength" value={form.strength} onChange={(e) => update('strength', e.target.value)} placeholder="500 mg" />
        </Field>
        <Field label={t({ tr: 'Kullanım sıklığı', en: 'Frequency' })} htmlFor="med-freq">
          <TextInput
            id="med-freq"
            value={form.frequency}
            onChange={(e) => update('frequency', e.target.value)}
            placeholder={t({ tr: 'Günde 2 kez', en: 'Twice a day' })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t({ tr: 'Başlangıç', en: 'Start date' })} htmlFor="med-start">
            <DateInput id="med-start" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
          </Field>
          <Field label={t({ tr: 'Bitiş', en: 'End date' })} htmlFor="med-end">
            <DateInput id="med-end" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
          </Field>
        </div>
        <Field label={t({ tr: 'Kullanım notu', en: 'Instructions' })} htmlFor="med-instr">
          <TextArea
            id="med-instr"
            value={form.instructions}
            onChange={(e) => update('instructions', e.target.value)}
            placeholder={t({ tr: 'Örn. Yemeklerle birlikte', en: 'e.g. With meals' })}
          />
        </Field>
        <Field label={t({ tr: 'Not', en: 'Note' })} htmlFor="med-notes">
          <TextArea id="med-notes" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
        </Field>
        <SubmitButton loading={saving}>{t({ tr: 'İlacı kaydet', en: 'Save medication' })}</SubmitButton>
      </form>
    </SheetModal>
  )
}

function MedicationDetailSheet({
  medication,
  onClose,
  onEdit,
  onStop,
  onDelete,
  busy,
}: {
  medication: MedicationDto | null
  onClose: () => void
  onEdit: (m: MedicationDto) => void
  onStop: (m: MedicationDto) => void | Promise<void>
  onDelete: (m: MedicationDto) => void
  busy: boolean
}) {
  const { t, language } = useLanguage()
  if (!medication) return null
  const m = medication

  return (
    <SheetModal open={!!medication} onClose={onClose} title={m.name}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[12px] font-bold text-slate-700">
          {t(MEDICATION_STATUS_LABELS[m.status])}
        </span>
        <SourceBadge source={m.source} language={language} />
      </div>

      <dl>
        <DetailRow label={t({ tr: 'Doz', en: 'Dosage' })} value={m.strength} />
        <DetailRow label={t({ tr: 'Sıklık', en: 'Frequency' })} value={m.frequency} />
        <DetailRow label={t({ tr: 'Başlangıç', en: 'Start' })} value={m.startDate ? formatHealthDate(m.startDate, language) : null} />
        <DetailRow label={t({ tr: 'Bitiş', en: 'End' })} value={m.endDate ? formatHealthDate(m.endDate, language) : null} />
        <DetailRow label={t({ tr: 'Sonlandırıldı', en: 'Stopped' })} value={m.stoppedAt ? formatHealthDate(m.stoppedAt, language) : null} />
        <DetailRow label={t({ tr: 'Kullanım notu', en: 'Instructions' })} value={m.instructions} />
        <DetailRow label={t({ tr: 'Not', en: 'Note' })} value={m.notes} />
      </dl>

      <div className="mt-5 flex flex-col gap-2">
        {m.editable ? (
          <>
            <SubmitButton type="button" onClick={() => onEdit(m)}>
              {t({ tr: 'Düzenle', en: 'Edit' })}
            </SubmitButton>
            {m.status === 'ACTIVE' ? (
              <SubmitButton type="button" variant="ghost" loading={busy} onClick={() => void onStop(m)}>
                {t({ tr: 'Sonlandırıldı olarak işaretle', en: 'Mark as stopped' })}
              </SubmitButton>
            ) : null}
            <SubmitButton type="button" variant="danger" onClick={() => onDelete(m)}>
              {t({ tr: 'Sil', en: 'Delete' })}
            </SubmitButton>
          </>
        ) : (
          <p className="rounded-xl bg-[var(--rz-surface-soft)] px-4 py-3 rz-secondary">
            {t({
              tr: 'Bu kayıt bir klinik tarafından oluşturuldu ve yalnızca görüntülenebilir. Bir hata olduğunu düşünüyorsanız kliniğinizle iletişime geçin.',
              en: 'This record was created by a clinic and is view-only. If you think there is an error, contact your clinic.',
            })}
          </p>
        )}
      </div>
    </SheetModal>
  )
}
