'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, ExternalLink, FileText, Loader2, Plus, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'

import { useLanguage } from '@/hooks/useLanguage'
import { EmptyState, ErrorState, ListSkeleton } from '@/components/client/ui'
import { clientFetch, clientFetchData, clientUploadData } from '@/lib/client-marketplace/client-fetch'
import { DOCUMENT_CATEGORIES } from '@/lib/client-marketplace/health-records/schemas'
import type { DocumentCategory } from '@/lib/client-marketplace/health-records/schemas'
import type { DocumentDto, DocumentListResult } from '@/lib/client-marketplace/health-records/types'
import { PERSON_DOCUMENT_MAX_SIZE_BYTES } from '@/lib/storage-constants'
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
  DOCUMENT_CATEGORY_LABELS,
  OFFLINE_COPY,
  SourceBadge,
  formatFileSize,
  formatHealthDate,
  isBrowserOffline,
} from '@/components/client/health/health-shared'
import { SignedOutNotice } from '@/components/client/health/signed-out-notice'

const ACCEPTED = 'application/pdf,image/jpeg,image/png,image/webp'
const ACCEPTED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])

export function DocumentsPanel() {
  const { t, language } = useLanguage()
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'signed-out'>('loading')
  const [items, setItems] = useState<DocumentDto[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [category, setCategory] = useState<DocumentCategory | 'ALL'>('ALL')
  const [loadingMore, setLoadingMore] = useState(false)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [detail, setDetail] = useState<DocumentDto | null>(null)
  const [editing, setEditing] = useState<DocumentDto | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<DocumentDto | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async (cat: DocumentCategory | 'ALL') => {
    setStatus((s) => (s === 'ready' ? 'ready' : 'loading'))
    try {
      const result = await clientFetchData<DocumentListResult>(
        `/api/client/health/documents?category=${cat}`,
      )
      setItems(result.items)
      setNextCursor(result.nextCursor)
      setStatus('ready')
    } catch (error) {
      setStatus(error instanceof Error && error.message === 'AUTH_REQUIRED' ? 'signed-out' : 'error')
    }
  }, [])

  useEffect(() => {
    void load(category)
  }, [load, category])

  const loadMore = async () => {
    if (!nextCursor) return
    setLoadingMore(true)
    try {
      const result = await clientFetchData<DocumentListResult>(
        `/api/client/health/documents?category=${category}&cursor=${nextCursor}`,
      )
      setItems((prev) => [...prev, ...result.items])
      setNextCursor(result.nextCursor)
    } catch {
      toast.error(t({ tr: 'Daha fazla belge yüklenemedi', en: 'Could not load more documents' }))
    } finally {
      setLoadingMore(false)
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
      await clientFetch(`/api/client/health/documents/${confirmDelete.id}`, { method: 'DELETE' })
      toast.success(t({ tr: 'Belge silindi', en: 'Document deleted' }))
      setConfirmDelete(null)
      setDetail(null)
      await load(category)
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
            <FileText className="size-5" aria-hidden />
          </span>
          <h1 className="rz-title text-slate-900">{t({ tr: 'Belgelerim', en: 'My documents' })}</h1>
        </div>
        {status === 'ready' ? (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--rz-blue)] px-4 text-sm font-bold text-white transition hover:bg-[var(--rz-blue-hover)] active:scale-[0.98]"
          >
            <Plus className="size-4" aria-hidden />
            {t({ tr: 'Belge ekle', en: 'Add' })}
          </button>
        ) : null}
      </div>

      {status === 'signed-out' ? <SignedOutNotice /> : null}
      {status === 'loading' ? <ListSkeleton count={3} /> : null}
      {status === 'error' ? (
        <ErrorState
          title={t({ tr: 'Belgeler yüklenemedi', en: 'Could not load documents' })}
          description={t({ tr: 'Bağlantınızı kontrol edip yeniden deneyin.', en: 'Check your connection and try again.' })}
          retryLabel={t({ tr: 'Yeniden dene', en: 'Try again' })}
          onRetry={() => void load(category)}
        />
      ) : null}

      {status === 'ready' ? (
        <>
          <div className="-mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-1">
            {(['ALL', ...DOCUMENT_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                  category === c ? 'bg-[var(--rz-blue)] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c === 'ALL' ? t({ tr: 'Tümü', en: 'All' }) : t(DOCUMENT_CATEGORY_LABELS[c])}
              </button>
            ))}
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t({ tr: 'Henüz sağlık belgesi eklenmedi', en: 'No documents yet' })}
              description={t({
                tr: 'Rapor, sonuç veya diğer sağlık belgelerinizi güvenli şekilde saklayabilirsiniz.',
                en: 'You can securely store your reports, results and other health documents.',
              })}
              actionLabel={t({ tr: 'Belge ekle', en: 'Add document' })}
              onAction={() => setUploadOpen(true)}
            />
          ) : (
            <>
              <ul className="space-y-2">
                {items.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => setDetail(d)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-[var(--rz-border)] bg-white px-4 py-3 text-left shadow-sm transition hover:border-[var(--rz-blue)]/30 active:scale-[0.99]"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <FileText className="size-5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="truncate rz-card-title text-slate-900">{d.title}</span>
                        <span className="mt-0.5 block truncate rz-secondary">
                          {[t(DOCUMENT_CATEGORY_LABELS[d.category]), d.documentDate ? formatHealthDate(d.documentDate, language) : null]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                      <ChevronRight className="size-5 shrink-0 text-slate-300" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
              {nextCursor ? (
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                  className="mt-1 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                >
                  {loadingMore ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  {t({ tr: 'Daha fazla göster', en: 'Show more' })}
                </button>
              ) : null}
            </>
          )}

          <p className="rz-caption px-1 text-center">
            {t({
              tr: 'Belgeleriniz özel olarak saklanır ve yalnızca sizin erişiminize açıktır.',
              en: 'Your documents are stored privately and accessible only to you.',
            })}
          </p>
        </>
      ) : null}

      <UploadForm
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={async () => {
          setUploadOpen(false)
          await load(category)
        }}
      />

      <DocumentMetadataForm
        document={editing}
        onClose={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null)
          await load(category)
        }}
      />

      {detail ? (
        <DocumentDetailSheet
          document={detail}
          onClose={() => setDetail(null)}
          onEdit={(d) => {
            setDetail(null)
            setEditing(d)
          }}
          onDelete={(d) => setConfirmDelete(d)}
        />
      ) : null}

      <ConfirmDialog
        open={!!confirmDelete}
        title={t({ tr: 'Belgeyi sil', en: 'Delete document' })}
        description={t({
          tr: 'Bu belgeyi ve yüklenen dosyayı kalıcı olarak silmek istediğinize emin misiniz?',
          en: 'Are you sure you want to permanently delete this document and its file?',
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

function UploadForm({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean
  onClose: () => void
  onUploaded: () => void | Promise<void>
}) {
  const { t } = useLanguage()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [cat, setCat] = useState<DocumentCategory>('OTHER')
  const [documentDate, setDocumentDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (open) {
      setFile(null)
      setTitle('')
      setCat('OTHER')
      setDocumentDate('')
      setNotes('')
      setError(null)
    }
  }, [open])

  const onPick = (f: File | null) => {
    setError(null)
    if (!f) {
      setFile(null)
      return
    }
    if (f.type && !ACCEPTED_TYPES.has(f.type)) {
      setError(t({ tr: 'Desteklenmeyen dosya türü. PDF, JPEG, PNG veya WEBP yükleyin.', en: 'Unsupported file type. Upload PDF, JPEG, PNG or WEBP.' }))
      setFile(null)
      return
    }
    if (f.size > PERSON_DOCUMENT_MAX_SIZE_BYTES) {
      setError(t({ tr: 'Dosya 25 MB sınırını aşıyor.', en: 'File exceeds the 25 MB limit.' }))
      setFile(null)
      return
    }
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''))
  }

  const submit = async () => {
    if (!file) {
      setError(t({ tr: 'Lütfen bir dosya seçin.', en: 'Please select a file.' }))
      return
    }
    if (!title.trim()) {
      setError(t({ tr: 'Belge adı zorunludur.', en: 'Document title is required.' }))
      return
    }
    if (isBrowserOffline()) {
      toast.error(t(OFFLINE_COPY))
      return
    }
    setUploading(true)
    setError(null)
    const form = new FormData()
    form.set('file', file)
    form.set('title', title.trim())
    form.set('category', cat)
    if (documentDate) form.set('documentDate', documentDate)
    if (notes.trim()) form.set('notes', notes.trim())
    try {
      await clientUploadData('/api/client/health/documents', form)
      toast.success(t({ tr: 'Belge güvenli şekilde yüklendi', en: 'Document uploaded securely' }))
      await onUploaded()
    } catch (err) {
      toast.error(
        err instanceof Error && err.message !== 'Upload failed'
          ? err.message
          : t({ tr: 'Yüklenemedi, tekrar deneyin', en: 'Upload failed, try again' }),
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <SheetModal open={open} onClose={uploading ? () => undefined : onClose} title={t({ tr: 'Belge ekle', en: 'Add document' })}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--rz-border)] bg-[var(--rz-surface-soft)] px-4 py-6 text-center transition hover:border-[var(--rz-blue)]/40"
        >
          <UploadCloud className="size-7 text-[var(--rz-blue)]" aria-hidden />
          {file ? (
            <span className="text-[14px] font-semibold text-slate-900">
              {file.name} · {formatFileSize(file.size)}
            </span>
          ) : (
            <>
              <span className="text-[14px] font-semibold text-slate-900">
                {t({ tr: 'Dosya seç', en: 'Choose a file' })}
              </span>
              <span className="rz-secondary">PDF, JPEG, PNG, WEBP · ≤ 25 MB</span>
            </>
          )}
        </button>

        {error ? <p className="text-[12px] font-medium text-rose-600">{error}</p> : null}

        <Field label={t({ tr: 'Belge adı', en: 'Document title' })} required htmlFor="doc-title">
          <TextInput id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t({ tr: 'Örn. Kan tahlili', en: 'e.g. Blood test' })} />
        </Field>
        <Field label={t({ tr: 'Kategori', en: 'Category' })} htmlFor="doc-cat">
          <SelectInput id="doc-cat" value={cat} onChange={(e) => setCat(e.target.value as DocumentCategory)}>
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(DOCUMENT_CATEGORY_LABELS[c])}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label={t({ tr: 'Tarih', en: 'Date' })} htmlFor="doc-date">
          <DateInput id="doc-date" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} />
        </Field>
        <Field label={t({ tr: 'Not', en: 'Note' })} htmlFor="doc-notes">
          <TextArea id="doc-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <SubmitButton loading={uploading}>{t({ tr: 'Güvenli şekilde yükle', en: 'Upload securely' })}</SubmitButton>
      </form>
    </SheetModal>
  )
}

function DocumentMetadataForm({
  document: doc,
  onClose,
  onSaved,
}: {
  document: DocumentDto | null
  onClose: () => void
  onSaved: () => void | Promise<void>
}) {
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [cat, setCat] = useState<DocumentCategory>('OTHER')
  const [documentDate, setDocumentDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (doc) {
      setTitle(doc.title)
      setCat(doc.category)
      setDocumentDate(doc.documentDate ? doc.documentDate.slice(0, 10) : '')
      setNotes(doc.notes ?? '')
    }
  }, [doc])

  if (!doc) return null

  const submit = async () => {
    if (!title.trim()) return
    if (isBrowserOffline()) {
      toast.error(t(OFFLINE_COPY))
      return
    }
    setSaving(true)
    try {
      await clientFetch(`/api/client/health/documents/${doc.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: title.trim(),
          category: cat,
          documentDate: documentDate || null,
          notes: notes.trim() || null,
        }),
      })
      toast.success(t({ tr: 'Belge güncellendi', en: 'Document updated' }))
      await onSaved()
    } catch {
      toast.error(t({ tr: 'Kaydedilemedi, tekrar deneyin', en: 'Could not save, try again' }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <SheetModal open={!!doc} onClose={onClose} title={t({ tr: 'Belgeyi düzenle', en: 'Edit document' })}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <Field label={t({ tr: 'Belge adı', en: 'Document title' })} required htmlFor="doc-edit-title">
          <TextInput id="doc-edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label={t({ tr: 'Kategori', en: 'Category' })} htmlFor="doc-edit-cat">
          <SelectInput id="doc-edit-cat" value={cat} onChange={(e) => setCat(e.target.value as DocumentCategory)}>
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(DOCUMENT_CATEGORY_LABELS[c])}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label={t({ tr: 'Tarih', en: 'Date' })} htmlFor="doc-edit-date">
          <DateInput id="doc-edit-date" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} />
        </Field>
        <Field label={t({ tr: 'Not', en: 'Note' })} htmlFor="doc-edit-notes">
          <TextArea id="doc-edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <SubmitButton loading={saving}>{t({ tr: 'Kaydet', en: 'Save' })}</SubmitButton>
      </form>
    </SheetModal>
  )
}

function DocumentDetailSheet({
  document: doc,
  onClose,
  onEdit,
  onDelete,
}: {
  document: DocumentDto
  onClose: () => void
  onEdit: (d: DocumentDto) => void
  onDelete: (d: DocumentDto) => void
}) {
  const { t, language } = useLanguage()
  const [preview, setPreview] = useState<{ url: string; mimeType: string } | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  const openPreview = async () => {
    setLoadingPreview(true)
    try {
      const result = await clientFetchData<{ url: string; expiresInSeconds: number; mimeType: string }>(
        `/api/client/health/documents/${doc.id}/url`,
      )
      setPreview({ url: result.url, mimeType: result.mimeType })
    } catch {
      toast.error(t({ tr: 'Belge açılamadı, tekrar deneyin', en: 'Could not open document, try again' }))
    } finally {
      setLoadingPreview(false)
    }
  }

  return (
    <>
      <SheetModal open onClose={onClose} title={doc.title}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[12px] font-bold text-slate-700">
            {t(DOCUMENT_CATEGORY_LABELS[doc.category])}
          </span>
          <SourceBadge source={doc.source} language={language} />
        </div>
        <dl>
          <DetailRow label={t({ tr: 'Tarih', en: 'Date' })} value={doc.documentDate ? formatHealthDate(doc.documentDate, language) : null} />
          <DetailRow label={t({ tr: 'Dosya', en: 'File' })} value={`${doc.mimeType.split('/')[1]?.toUpperCase() ?? 'DOSYA'} · ${formatFileSize(doc.fileSize)}`} />
          <DetailRow label={t({ tr: 'Not', en: 'Note' })} value={doc.notes} />
        </dl>
        <div className="mt-5 flex flex-col gap-2">
          <SubmitButton type="button" loading={loadingPreview} onClick={() => void openPreview()}>
            {t({ tr: 'Görüntüle', en: 'View' })}
          </SubmitButton>
          {doc.editable ? (
            <>
              <SubmitButton type="button" variant="ghost" onClick={() => onEdit(doc)}>
                {t({ tr: 'Adı / bilgileri düzenle', en: 'Rename / edit details' })}
              </SubmitButton>
              <SubmitButton type="button" variant="danger" onClick={() => onDelete(doc)}>
                {t({ tr: 'Sil', en: 'Delete' })}
              </SubmitButton>
            </>
          ) : (
            <p className="rounded-xl bg-[var(--rz-surface-soft)] px-4 py-3 rz-secondary">
              {t({
                tr: 'Bu belge bir klinik tarafından paylaşıldı ve yalnızca görüntülenebilir.',
                en: 'This document was shared by a clinic and is view-only.',
              })}
            </p>
          )}
        </div>
      </SheetModal>

      {preview ? (
        <SheetModal open onClose={() => setPreview(null)} title={doc.title}>
          {preview.mimeType.startsWith('image/') ? (
            <img src={preview.url} alt={doc.title} className="mx-auto max-h-[70vh] w-auto rounded-xl" />
          ) : (
            <iframe title={doc.title} src={preview.url} className="h-[70vh] w-full rounded-xl border border-[var(--rz-border)]" />
          )}
          <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-slate-100 text-[15px] font-bold text-slate-700 transition hover:bg-slate-200"
          >
            <ExternalLink className="size-4" aria-hidden />
            {t({ tr: 'Yeni sekmede aç', en: 'Open in new tab' })}
          </a>
        </SheetModal>
      ) : null}
    </>
  )
}
