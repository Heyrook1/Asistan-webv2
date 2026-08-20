'use client'

import { useMemo, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  FileCheck2,
  Filter,
  Scale,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AccessibleField } from '@/components/ui/accessible-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  createDataDeletionRequest,
  processDataDeletionRequest,
  recordUserConsent,
  upsertComplianceDocument,
} from '@/lib/actions/governance'
import { cn } from '@/lib/utils'
import {
  labelAuditSeverity,
  labelComplianceDocStatus,
  labelDataDeletionStatus,
} from '@/lib/ui-labels'

type AuditRow = {
  id: string
  action: string
  entityType: string
  entityId: string | null
  severity: string
  summary: string | null
  metadata: unknown
  ipAddress: string | null
  createdAt: string
  actorName: string
  actorEmail: string | null
  businessName?: string | null
}

type DeletionRow = {
  id: string
  status: string
  reason: string | null
  patientId: string | null
  notes: string | null
  requestedAt: string
  processedAt: string | null
  requesterName: string
  requesterEmail: string
  processedByName: string | null
  businessName?: string | null
}

type ConsentRow = {
  id: string
  consentType: string
  version: string
  granted: boolean
  grantedAt: string
  revokedAt: string | null
  userName: string
  userEmail: string
}

type DocRow = {
  id: string
  title: string
  category: string
  version: string
  status: string
  fileUrl: string | null
  notes: string | null
  effectiveAt: string
  expiresAt: string | null
  businessName?: string | null
}

const SEVERITY_STYLE: Record<string, string> = {
  DEBUG: 'bg-slate-100 text-slate-700',
  INFO: 'bg-sky-100 text-sky-800',
  WARN: 'bg-amber-100 text-amber-800',
  ERROR: 'bg-rose-100 text-rose-800',
  CRITICAL: 'bg-rose-200 text-rose-900',
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function GovernanceBoard({
  canManage,
  filters,
  auditLogs,
  deletionRequests,
  consents,
  complianceDocs,
  patients,
}: {
  canManage: boolean
  filters: { q: string; severity: string; action: string }
  auditLogs: AuditRow[]
  deletionRequests: DeletionRow[]
  consents: ConsentRow[]
  complianceDocs: DocRow[]
  patients: { id: string; fullName: string; patientNumber: string }[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(filters.q)
  const [severity, setSeverity] = useState(filters.severity)
  const [actionFilter, setActionFilter] = useState(filters.action)
  const [pending, startTransition] = useTransition()
  const [selectedLog, setSelectedLog] = useState<AuditRow | null>(auditLogs[0] ?? null)
  const [deletionReason, setDeletionReason] = useState('')
  const [deletionPatientId, setDeletionPatientId] = useState('none')
  const [docForm, setDocForm] = useState({
    title: '',
    category: 'KVKK',
    version: '1.0',
    notes: '',
  })

  const pendingDeletions = useMemo(
    () => deletionRequests.filter((r) => r.status === 'PENDING' || r.status === 'IN_REVIEW').length,
    [deletionRequests]
  )

  function applyFilters(next?: Partial<typeof filters>) {
    const params = new URLSearchParams(searchParams.toString())
    const merged = {
      q: next?.q ?? query,
      severity: next?.severity ?? severity,
      action: next?.action ?? actionFilter,
    }
    if (merged.q) params.set('q', merged.q)
    else params.delete('q')
    if (merged.severity && merged.severity !== 'all') params.set('severity', merged.severity)
    else params.delete('severity')
    if (merged.action && merged.action !== 'all') params.set('action', merged.action)
    else params.delete('action')
    router.push(`${pathname}?${params.toString()}`)
  }

  function submitDeletion() {
    startTransition(async () => {
      const result = await createDataDeletionRequest({
        reason: deletionReason || undefined,
        patientId: deletionPatientId === 'none' ? undefined : deletionPatientId,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Silme talebi oluşturuldu')
      setDeletionReason('')
      setDeletionPatientId('none')
      router.refresh()
    })
  }

  function processDeletion(id: string, status: 'IN_REVIEW' | 'COMPLETED' | 'REJECTED') {
    startTransition(async () => {
      const result = await processDataDeletionRequest({ id, status })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Silme talebi güncellendi')
      router.refresh()
    })
  }

  function recordConsent(granted: boolean) {
    startTransition(async () => {
      const result = await recordUserConsent({
        consentType: 'KVKK_EXPLICIT',
        version: '2026.1',
        granted,
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(granted ? 'KVKK rızası kaydedildi' : 'KVKK rızası geri alındı')
      router.refresh()
    })
  }

  function saveDocument() {
    startTransition(async () => {
      const result = await upsertComplianceDocument({
        title: docForm.title,
        category: docForm.category,
        version: docForm.version,
        notes: docForm.notes || undefined,
        status: 'ACTIVE',
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Uyumluluk belgesi kaydedildi')
      setDocForm({ title: '', category: 'KVKK', version: '1.0', notes: '' })
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">Super Admin</p>
          <h1 className="text-2xl font-bold text-brand-ink">Denetim ve Uyumluluk</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Platform genelinde denetim izi, KVKK silme talepleri, açık rıza kayıtları ve uyumluluk belgeleri.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="border-0 bg-slate-100 text-slate-700">{auditLogs.length} denetim kaydı</Badge>
          <Badge className="border-0 bg-amber-100 text-amber-800">{pendingDeletions} açık silme talebi</Badge>
          <Badge className="border-0 bg-emerald-100 text-emerald-800">{complianceDocs.length} belge</Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-brand-teal" aria-hidden="true" />
              Denetim günlüğü
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form
              className="grid gap-2 md:grid-cols-[1fr_140px_160px_auto]"
              onSubmit={(e) => {
                e.preventDefault()
                applyFilters()
              }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Aksiyon, özet veya varlık ara..."
                  className="pl-9"
                  aria-label="Denetim kaydı ara"
                />
              </div>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger aria-label="Önem filtresi">
                  <SelectValue placeholder="Önem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm önem</SelectItem>
                  <SelectItem value="INFO">Bilgi</SelectItem>
                  <SelectItem value="WARN">Uyarı</SelectItem>
                  <SelectItem value="ERROR">Hata</SelectItem>
                  <SelectItem value="CRITICAL">Kritik</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger aria-label="Aksiyon filtresi">
                  <SelectValue placeholder="Aksiyon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm aksiyonlar</SelectItem>
                  <SelectItem value="patient">Hasta</SelectItem>
                  <SelectItem value="appointment">Randevu</SelectItem>
                  <SelectItem value="team">Takım</SelectItem>
                  <SelectItem value="deletion">Silme</SelectItem>
                  <SelectItem value="consent">Rıza</SelectItem>
                  <SelectItem value="settings">Ayarlar</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" variant="outline" className="gap-1.5">
                <Filter className="h-4 w-4" aria-hidden="true" />
                Filtrele
              </Button>
            </form>

            <div className="overflow-hidden rounded-xl border">
              <div className="max-h-[420px] overflow-y-auto divide-y">
                {auditLogs.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">Henüz denetim kaydı yok. Hassas işlemler burada listelenir.</p>
                ) : (
                  auditLogs.map((log) => (
                    <button
                      key={log.id}
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className={cn(
                        'flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-dashboard-surface',
                        selectedLog?.id === log.id && 'bg-dashboard-surface'
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-brand-ink">{log.summary || log.action}</p>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', SEVERITY_STYLE[log.severity] ?? SEVERITY_STYLE.INFO)}>
                          {labelAuditSeverity(log.severity)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {log.businessName ? `${log.businessName} · ` : ''}
                        {log.actorName} · {log.action} · {formatDate(log.createdAt)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {selectedLog && (
              <div className="rounded-xl border bg-slate-50/80 p-4 text-sm">
                <p className="font-semibold text-brand-ink">Kayıt detayı</p>
                <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Aksiyon</dt>
                    <dd>{selectedLog.action}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Varlık</dt>
                    <dd>
                      {selectedLog.entityType}
                      {selectedLog.entityId ? ` · ${selectedLog.entityId}` : ''}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Aktör</dt>
                    <dd>
                      {selectedLog.actorName}
                      {selectedLog.actorEmail ? ` (${selectedLog.actorEmail})` : ''}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">IP</dt>
                    <dd>{selectedLog.ipAddress || '—'}</dd>
                  </div>
                </dl>
                {selectedLog.metadata != null && (
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-white p-3 text-[11px] text-slate-700">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trash2 className="h-4 w-4 text-rose-600" aria-hidden="true" />
                KVKK silme talepleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canManage && (
                <div className="space-y-2 rounded-xl border border-dashed p-3">
                  <AccessibleField label="Hasta (opsiyonel)" labelClassName="text-xs text-muted-foreground mb-1.5 block">
                    <Select value={deletionPatientId} onValueChange={setDeletionPatientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Hasta seç" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Genel hesap talebi</SelectItem>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.fullName} (#{p.patientNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccessibleField>
                  <AccessibleField label="Gerekçe" labelClassName="text-xs text-muted-foreground mb-1.5 block">
                    <Textarea
                      value={deletionReason}
                      onChange={(e) => setDeletionReason(e.target.value)}
                      rows={2}
                      placeholder="Talep gerekçesi"
                    />
                  </AccessibleField>
                  <Button type="button" disabled={pending} onClick={submitDeletion} className="w-full bg-rose-600 text-white hover:bg-rose-700">
                    Silme talebi oluştur
                  </Button>
                </div>
              )}

              <div className="max-h-72 space-y-2 overflow-y-auto">
                {deletionRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Açık veya geçmiş silme talebi yok.</p>
                ) : (
                  deletionRequests.map((req) => (
                    <div key={req.id} className="rounded-xl border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{req.requesterName}</p>
                          <p className="text-xs text-muted-foreground">
                            {req.businessName ? `${req.businessName} · ` : ''}
                            {formatDate(req.requestedAt)}
                          </p>
                        </div>
                        <Badge className="border-0 bg-slate-100 text-slate-700">{labelDataDeletionStatus(req.status)}</Badge>
                      </div>
                      {req.reason && <p className="mt-2 text-xs text-muted-foreground">{req.reason}</p>}
                      {canManage && (req.status === 'PENDING' || req.status === 'IN_REVIEW') && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Button size="sm" variant="outline" disabled={pending} onClick={() => processDeletion(req.id, 'IN_REVIEW')}>
                            İncele
                          </Button>
                          <Button size="sm" variant="outline" disabled={pending} onClick={() => processDeletion(req.id, 'REJECTED')}>
                            Reddet
                          </Button>
                          <Button size="sm" className="bg-rose-600 text-white hover:bg-rose-700" disabled={pending} onClick={() => processDeletion(req.id, 'COMPLETED')}>
                            Tamamla
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Scale className="h-4 w-4 text-brand-teal" aria-hidden="true" />
                Açık rıza
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canManage && (
                <div className="flex gap-2">
                  <Button type="button" disabled={pending} onClick={() => recordConsent(true)} className="flex-1 bg-brand-teal text-white hover:bg-brand-teal-hover">
                    KVKK rızası ver
                  </Button>
                  <Button type="button" variant="outline" disabled={pending} onClick={() => recordConsent(false)} className="flex-1">
                    Geri al
                  </Button>
                </div>
              )}
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {consents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Rıza kaydı yok.</p>
                ) : (
                  consents.map((c) => (
                    <div key={c.id} className="rounded-lg border px-3 py-2 text-xs">
                      <p className="font-semibold text-brand-ink">
                        {c.userName} · {c.consentType}
                      </p>
                      <p className="text-muted-foreground">
                        v{c.version} · {c.granted ? 'Verildi' : 'Geri alındı'} · {formatDate(c.grantedAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCheck2 className="h-4 w-4 text-brand-teal" aria-hidden="true" />
            Uyumluluk belgeleri
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[320px_1fr]">
          {canManage && (
            <div className="space-y-2 rounded-xl border border-dashed p-3">
              <AccessibleField label="Başlık" labelClassName="text-xs text-muted-foreground mb-1.5 block">
                <Input value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} placeholder="KVKK Aydınlatma Metni" />
              </AccessibleField>
              <AccessibleField label="Kategori" labelClassName="text-xs text-muted-foreground mb-1.5 block">
                <Input value={docForm.category} onChange={(e) => setDocForm({ ...docForm, category: e.target.value })} />
              </AccessibleField>
              <AccessibleField label="Versiyon" labelClassName="text-xs text-muted-foreground mb-1.5 block">
                <Input value={docForm.version} onChange={(e) => setDocForm({ ...docForm, version: e.target.value })} />
              </AccessibleField>
              <AccessibleField label="Not" labelClassName="text-xs text-muted-foreground mb-1.5 block">
                <Textarea value={docForm.notes} onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })} rows={2} />
              </AccessibleField>
              <Button type="button" disabled={pending || !docForm.title.trim()} onClick={saveDocument} className="w-full bg-brand-teal text-white hover:bg-brand-teal-hover">
                Belge kaydet
              </Button>
            </div>
          )}
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-dashboard-surface text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Belge</th>
                  <th className="px-3 py-2 font-medium">Kategori</th>
                  <th className="px-3 py-2 font-medium">Versiyon</th>
                  <th className="px-3 py-2 font-medium">Durum</th>
                  <th className="px-3 py-2 font-medium">Geçerlilik</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {complianceDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      Henüz uyumluluk belgesi eklenmedi.
                    </td>
                  </tr>
                ) : (
                  complianceDocs.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-3 py-2 font-medium text-brand-ink">
                        {doc.title}
                        {doc.businessName ? (
                          <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">{doc.businessName}</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{doc.category}</td>
                      <td className="px-3 py-2">{doc.version}</td>
                      <td className="px-3 py-2">
                        <Badge className="border-0 bg-emerald-100 text-emerald-800">{labelComplianceDocStatus(doc.status)}</Badge>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {formatDate(doc.effectiveAt)}
                        {doc.expiresAt ? ` → ${formatDate(doc.expiresAt)}` : ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
