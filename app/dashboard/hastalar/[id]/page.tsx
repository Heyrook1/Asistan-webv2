import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Phone, Mail, MapPin, AlertTriangle, HeartPulse,
  ShieldAlert, Sparkles, TrendingUp, Calendar as CalendarIcon, ShieldCheck,
  FileText, ClipboardCheck, Eye, Download,
} from 'lucide-react'
import { requirePermission, can } from '@/lib/session'
import { getPatientDetail } from '@/lib/queries'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  ageFromBirthDate, formatPhone, formatDate, formatTime, formatDateTime, formatShortDate,
  APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS, TREATMENT_STATUS_LABELS, FILE_CATEGORY_LABELS, formatTimeAgo,
} from '@/lib/format'
import { PatientActionButtons } from './action-buttons'
import { PatientMetaEditor } from './meta-editor'
import { TreatmentPlanBoard } from './treatment-plan'

export const dynamic = 'force-dynamic'

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await requirePermission('patient.view')
  const patient = await getPatientDetail(session.businessId, id)
  if (!patient) notFound()

  const canEdit = can(session, 'patient.edit')
  const age = ageFromBirthDate(patient.birthDate)

  const [services, staff] = await Promise.all([
    prisma.service.findMany({
      where: { businessId: session.businessId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, durationMin: true },
    }),
    prisma.teamMember.findMany({
      where: { businessId: session.businessId, isActive: true },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true },
    }),
  ])

  const initials = patient.fullName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const lastAppointment = patient.appointments.find((a) => a.status === 'COMPLETED') ?? patient.appointments[0]
  const allergyNames = patient.allergies.slice(0, 3).map((a) => a.name).join(', ')
  const activeMedications = patient.medications.filter((m) => m.active)
  const pdfFiles = patient.files.filter((f) => !f.fileType.startsWith('image/'))

  return (
    <div className="space-y-4">
      <Link href="/dashboard/hastalar" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#12C8AD]">
        <ChevronLeft className="h-4 w-4" /> Hasta listesine dön
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#0C1D36]">Hasta Kartı</h1>
        <p className="text-sm text-muted-foreground">Hastanın tüm klinik geçmişi, ilaçları, notları, dosyaları ve tedavi süreci tek ekranda.</p>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#12C8AD] to-[#16A9E8] text-white text-xl font-bold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-[#0C1D36]">{patient.fullName}</h2>
                  <Badge className={patient.isArchived ? 'bg-rose-100 text-rose-800 border-0' : 'bg-emerald-100 text-emerald-800 border-0'}>
                    {patient.isArchived ? 'Arşivli' : 'Aktif Hasta'}
                  </Badge>
                </div>
                <p className="text-[13px] text-[#12C8AD] font-medium">#{patient.patientNumber}</p>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <StatPill label="Yaş" value={age != null ? String(age) : '—'} />
                  <StatPill label="Cinsiyet" value={patient.gender ?? '—'} />
                  <StatPill label="Kan Grubu" value={patient.bloodType ?? '—'} highlight />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-[#12C8AD]" /> {formatPhone(patient.phone)}
                  </span>
                  {patient.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-[#12C8AD]" /> {patient.email}
                    </span>
                  )}
                  {patient.city && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#12C8AD]" /> {patient.city}
                    </span>
                  )}
                </div>

                {(patient.emergencyContactName || patient.emergencyContactPhone) && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#F7F9FB] px-3 py-1.5 text-xs text-muted-foreground">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                    <span><strong className="text-[#0C1D36]">Acil İletişim:</strong> {patient.emergencyContactName ?? '—'}{patient.emergencyContactPhone ? ` — ${formatPhone(patient.emergencyContactPhone)}` : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side alert cards */}
            <div className="grid gap-2 sm:grid-cols-3 lg:w-[560px]">
              <AlertCard
                icon={<AlertTriangle className="h-5 w-5" />}
                tone="amber"
                title="Alerjiler"
                value={allergyNames || 'Kayıt yok'}
              />
              <AlertCard
                icon={<HeartPulse className="h-5 w-5" />}
                tone="sky"
                title="Kronik Durum"
                value={patient.chronicDiseases || 'Kayıt yok'}
              />
              <AlertCard
                icon={<ShieldAlert className="h-5 w-5" />}
                tone="indigo"
                title="Risk Notu"
                value={patient.riskNote || 'Risk notu yok'}
              />
            </div>
          </div>

          {canEdit && (
            <div className="mt-5 border-t pt-4">
              <PatientActionButtons
                patientId={patient.id}
                businessId={session.businessId}
                isArchived={patient.isArchived}
                services={services}
                staff={staff}
                patientLabel={`${patient.fullName} (#${patient.patientNumber})`}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="genel" className="space-y-4">
        <Card>
          <CardContent className="p-2">
            <TabsList className="bg-transparent h-auto p-1 flex flex-wrap gap-1">
              <TabsTrigger value="genel">Genel Bilgi</TabsTrigger>
              <TabsTrigger value="randevular">Randevular ({patient.appointments.length})</TabsTrigger>
              <TabsTrigger value="not">Notlar ({patient.notes.length})</TabsTrigger>
              <TabsTrigger value="ilac">İlaçlar ({patient.medications.length})</TabsTrigger>
              <TabsTrigger value="alerji">Alerjiler ({patient.allergies.length})</TabsTrigger>
              <TabsTrigger value="tedavi">Tedaviler ({patient.treatments.length})</TabsTrigger>
              <TabsTrigger value="tahlil">Tahliller ({patient.labResults.length})</TabsTrigger>
              <TabsTrigger value="dosya">Dosyalar ({patient.files.length})</TabsTrigger>
              <TabsTrigger value="hikaye">Hasta Hikayesi</TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        {/* GENEL BİLGİ */}
        <TabsContent value="genel">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Sol kolon */}
            <div className="space-y-4">
              <SummaryCard
                patientId={patient.id}
                canEdit={canEdit}
                staff={staff}
                meta={{
                  lastVisit: lastAppointment?.date ? formatDate(lastAppointment.date) : null,
                  lastDiagnosis: patient.lastDiagnosis,
                  currentTreatment: patient.currentTreatment,
                  assignedDoctor: patient.assignedDoctor?.fullName ?? null,
                  assignedDoctorId: patient.assignedDoctorId,
                  summary: patient.summary,
                  riskNote: patient.riskNote,
                }}
              />

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#0C1D36] flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-[#12C8AD]" /> Tedavi Planı
                    </h3>
                  </div>
                  <TreatmentPlanBoard
                    patientId={patient.id}
                    items={patient.treatmentPlan.map((p) => ({
                      id: p.id,
                      title: p.title,
                      frequency: p.frequency,
                      status: p.status,
                    }))}
                    canEdit={canEdit}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Orta kolon */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#0C1D36]">Kullandığı İlaçlar</h3>
                    <span className="text-[11px] text-muted-foreground">{activeMedications.length} aktif</span>
                  </div>
                  {patient.medications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Kayıtlı ilaç yok.</p>
                  ) : (
                    <ul className="space-y-2">
                      {patient.medications.slice(0, 6).map((m) => (
                        <li key={m.id} className="flex items-start gap-3 rounded-lg border bg-white p-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#12C8AD]/10 text-[#0b7f6f] text-[10px] font-bold">
                            Rx
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#0C1D36] truncate">{m.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {[m.dosage, m.frequency].filter(Boolean).join(' • ') || 'Detay yok'}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={m.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}
                          >
                            {m.active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#0C1D36]">Tahliller ve Raporlar</h3>
                  </div>
                  {pdfFiles.length === 0 && patient.labResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Henüz tahlil/rapor yok.</p>
                  ) : (
                    <ul className="space-y-2">
                      {pdfFiles.slice(0, 4).map((f) => (
                        <li key={f.id} className="flex items-center gap-3 rounded-lg border bg-white p-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#0C1D36] truncate">{f.fileName}</p>
                            <p className="text-[11px] text-muted-foreground">{formatShortDate(f.uploadedAt)}</p>
                          </div>
                          <a href={f.fileUrl} target="_blank" rel="noreferrer" className="rounded-md p-1.5 hover:bg-[#F7F9FB]" title="Görüntüle">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </a>
                          <a href={f.fileUrl} download={f.fileName} className="rounded-md p-1.5 hover:bg-[#F7F9FB]" title="İndir">
                            <Download className="h-4 w-4 text-muted-foreground" />
                          </a>
                        </li>
                      ))}
                      {patient.labResults.slice(0, 3).map((l) => (
                        <li key={l.id} className="flex items-center gap-3 rounded-lg border bg-white p-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                            <ClipboardCheck className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#0C1D36] truncate">{l.title}</p>
                            <p className="text-[11px] text-muted-foreground">{formatShortDate(l.resultDate)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sağ kolon — Hasta Hikayesi + AI Önerileri */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#0C1D36]">Hasta Hikayesi</h3>
                  </div>
                  {patient.timeline.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aktivite kaydı yok.</p>
                  ) : (
                    <ul className="space-y-3 relative pl-1">
                      <span className="absolute left-3 top-1 bottom-1 w-px bg-border" />
                      {patient.timeline.slice(0, 8).map((ev, idx) => (
                        <li key={ev.id} className="relative pl-7">
                          <span
                            className="absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-white"
                            style={{ background: timelineColor(idx) }}
                          >
                            {timelineIcon(ev.type)}
                          </span>
                          <p className="text-[11px] text-muted-foreground">{formatTimeAgo(ev.createdAt)}</p>
                          <p className="text-sm text-[#0C1D36]">{ev.title}</p>
                          {ev.description && <p className="text-[11px] text-muted-foreground">{ev.description}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-violet-600" />
                    <h3 className="text-sm font-semibold text-[#0C1D36]">AI Klinik Önerileri</h3>
                  </div>
                  <AISuggestionsList suggestions={(patient.aiSuggestions as Suggestion[] | null) ?? defaultSuggestions(patient)} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* KLINIK GEÇMIŞI */}
        <TabsContent value="randevular">
          <Card>
            <CardContent className="p-5">
              {patient.appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Henüz randevu yok.</p>
              ) : (
                <ul className="divide-y">
                  {patient.appointments.map((a) => (
                    <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#0C1D36]">{a.service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(a.date)} • {formatTime(a.startTime)}-{formatTime(a.endTime)}{a.staff ? ` • ${a.staff.fullName}` : ''}
                        </p>
                        {a.notes && <p className="mt-1 text-xs text-muted-foreground">{a.notes}</p>}
                      </div>
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] ${APPOINTMENT_STATUS_COLORS[a.status]}`}>
                        {APPOINTMENT_STATUS_LABELS[a.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* İLAÇLAR */}
        <TabsContent value="ilac">
          <Card>
            <CardContent className="p-5">
              {patient.medications.length === 0 ? (
                <p className="text-sm text-muted-foreground">Kayıtlı ilaç yok.</p>
              ) : (
                <ul className="space-y-3">
                  {patient.medications.map((m) => (
                    <li key={m.id} className="rounded-xl border bg-white p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#0C1D36]">{m.name}</p>
                        <Badge variant="outline" className={m.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}>
                          {m.active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{[m.dosage, m.frequency].filter(Boolean).join(' • ') || 'Detay yok'}</p>
                      {(m.startDate || m.endDate) && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {m.startDate ? formatDate(m.startDate) : '—'} → {m.endDate ? formatDate(m.endDate) : 'devam ediyor'}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ALERJILER */}
        <TabsContent value="alerji">
          <Card>
            <CardContent className="p-5">
              {patient.allergies.length === 0 ? (
                <p className="text-sm text-muted-foreground">Kayıtlı alerji yok.</p>
              ) : (
                <ul className="space-y-3">
                  {patient.allergies.map((a) => (
                    <li key={a.id} className="rounded-xl border bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#0C1D36]">{a.name}</p>
                        <Badge
                          variant="outline"
                          className={
                            a.severity === 'SIDDETLI'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : a.severity === 'ORTA'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }
                        >
                          {a.severity === 'SIDDETLI' ? 'Şiddetli' : a.severity === 'ORTA' ? 'Orta' : 'Hafif'}
                        </Badge>
                      </div>
                      {a.reaction && <p className="mt-1 text-xs text-muted-foreground">Reaksiyon: {a.reaction}</p>}
                      {a.notes && <p className="mt-1 text-xs whitespace-pre-line">{a.notes}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEDAVILER */}
        <TabsContent value="tedavi">
          <Card>
            <CardContent className="p-5">
              {patient.treatments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Kayıtlı tedavi yok.</p>
              ) : (
                <ul className="space-y-3">
                  {patient.treatments.map((t) => (
                    <li key={t.id} className="rounded-xl border bg-white p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#0C1D36]">{t.title}</p>
                        <Badge variant="outline">{TREATMENT_STATUS_LABELS[t.status]}</Badge>
                      </div>
                      {t.doctorName && <p className="text-xs text-muted-foreground">Hekim: {t.doctorName}</p>}
                      {t.description && <p className="text-xs mt-1">{t.description}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAHLILLER */}
        <TabsContent value="tahlil">
          <Card>
            <CardContent className="p-5">
              {patient.labResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">Kayıtlı tahlil yok.</p>
              ) : (
                <ul className="space-y-3">
                  {patient.labResults.map((l) => (
                    <li key={l.id} className="rounded-xl border bg-white p-3">
                      <p className="text-sm font-semibold text-[#0C1D36]">{l.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(l.resultDate)}{l.labName ? ` • ${l.labName}` : ''}</p>
                      {l.description && <p className="text-xs mt-1 whitespace-pre-line">{l.description}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* GÖRÜNTÜLER */}
        <TabsContent value="hikaye">
          <Card>
            <CardContent className="p-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-[#0C1D36]">Anamnez ve Hasta Hikayesi</h3>
                {patient.patientStory ? (
                  <p className="whitespace-pre-line text-sm leading-6 text-[#0C1D36]">{patient.patientStory}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Hasta hikayesi henüz girilmedi.</p>
                )}
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#0C1D36]">Zaman Çizelgesi</h3>
                {patient.timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aktivite kaydı yok.</p>
                ) : (
                  <ul className="space-y-3 relative pl-1">
                    <span className="absolute left-3 top-1 bottom-1 w-px bg-border" />
                    {patient.timeline.map((ev, idx) => (
                      <li key={ev.id} className="relative pl-7">
                        <span
                          className="absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-white"
                          style={{ background: timelineColor(idx) }}
                        >
                          {timelineIcon(ev.type)}
                        </span>
                        <p className="text-[11px] text-muted-foreground">{formatTimeAgo(ev.createdAt)}</p>
                        <p className="text-sm text-[#0C1D36]">{ev.title}</p>
                        {ev.description && <p className="text-[11px] text-muted-foreground">{ev.description}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOSYALAR */}
        <TabsContent value="dosya">
          <Card>
            <CardContent className="p-5">
              {patient.files.length === 0 ? (
                <p className="text-sm text-muted-foreground">Yüklü dosya yok.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {patient.files.map((f) => (
                    <a key={f.id} href={f.fileUrl} target="_blank" rel="noreferrer" className="block rounded-xl border bg-white p-3 hover:border-[#12C8AD]/40">
                      <p className="text-sm font-medium text-[#0C1D36] truncate">{f.fileName}</p>
                      <p className="text-[11px] text-muted-foreground">{FILE_CATEGORY_LABELS[f.category] ?? f.category} • {f.fileType}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(f.uploadedAt)}</p>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTLAR */}
        <TabsContent value="not">
          <Card>
            <CardContent className="p-5">
              {patient.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Bu hasta için not yok.</p>
              ) : (
                <ul className="space-y-3">
                  {patient.notes.map((n) => (
                    <li key={n.id} className="rounded-xl border bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#0C1D36]">{n.title}</p>
                        {n.isPinned && <Badge className="bg-amber-100 text-amber-800 border-0">Sabit</Badge>}
                      </div>
                      <p className="mt-1 text-sm whitespace-pre-line text-[#0C1D36]">{n.note}</p>
                      <p className="mt-2 text-[10px] text-muted-foreground">{formatDateTime(n.createdAt)} • {n.createdBy}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatPill({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-rose-600' : 'text-[#0C1D36]'}`}>{value}</span>
    </div>
  )
}

function AlertCard({
  icon, tone, title, value,
}: {
  icon: React.ReactNode
  tone: 'amber' | 'sky' | 'indigo'
  title: string
  value: string
}) {
  const toneClass = {
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    sky: 'border-sky-200 bg-sky-50 text-sky-900',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-900',
  }[tone]
  const iconColor = { amber: 'text-amber-600', sky: 'text-sky-600', indigo: 'text-indigo-600' }[tone]
  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <div className={`mb-1 ${iconColor}`}>{icon}</div>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{title}</p>
      <p className="text-sm font-medium leading-tight line-clamp-2">{value}</p>
    </div>
  )
}

type Suggestion = { icon?: string; title: string; type?: string }

function AISuggestionsList({ suggestions }: { suggestions: Suggestion[] }) {
  if (suggestions.length === 0) {
    return <p className="text-sm text-muted-foreground">Henüz öneri yok.</p>
  }
  return (
    <ul className="space-y-2">
      {suggestions.map((s, i) => (
        <li key={i} className="flex items-start gap-2.5 rounded-lg border bg-white p-2.5">
          <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-violet-700">
            {suggestionIcon(s.type ?? s.icon)}
          </span>
          <p className="text-sm text-[#0C1D36] flex-1">{s.title}</p>
        </li>
      ))}
    </ul>
  )
}

function suggestionIcon(key?: string) {
  switch (key) {
    case 'trend':
      return <TrendingUp className="h-3.5 w-3.5" />
    case 'calendar':
      return <CalendarIcon className="h-3.5 w-3.5" />
    case 'allergy':
      return <ShieldCheck className="h-3.5 w-3.5" />
    default:
      return <Sparkles className="h-3.5 w-3.5" />
  }
}

function defaultSuggestions(patient: {
  allergies: { name: string }[]
  chronicDiseases: string | null
  appointments: { date: Date; status: string }[]
}): Suggestion[] {
  const items: Suggestion[] = []
  if (patient.chronicDiseases) {
    items.push({ type: 'trend', title: `Kronik durum izleniyor: ${patient.chronicDiseases}` })
  }
  const upcoming = patient.appointments.find((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
  if (!upcoming) {
    items.push({ type: 'calendar', title: 'Yakın randevu yok. 2 hafta içinde kontrol önerilir.' })
  }
  if (patient.allergies.length) {
    items.push({ type: 'allergy', title: `${patient.allergies.map((a) => a.name).join(', ')} alerjisi nedeniyle reçete kontrolü yapın.` })
  }
  return items
}

function timelineColor(idx: number) {
  const palette = ['#12C8AD', '#16A9E8', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4']
  return palette[idx % palette.length]
}

function timelineIcon(type: string) {
  if (type.includes('APPOINTMENT')) return <CalendarIcon className="h-3 w-3" />
  if (type.includes('MEDICATION')) return <span className="text-[9px] font-bold">Rx</span>
  if (type.includes('LAB')) return <ClipboardCheck className="h-3 w-3" />
  if (type.includes('FILE')) return <FileText className="h-3 w-3" />
  return <Sparkles className="h-3 w-3" />
}

function SummaryCard({
  patientId,
  canEdit,
  meta,
  staff,
}: {
  patientId: string
  canEdit: boolean
  meta: {
    lastVisit: string | null
    lastDiagnosis: string | null
    currentTreatment: string | null
    assignedDoctor: string | null
    assignedDoctorId: string | null
    summary: string | null
    riskNote: string | null
  }
  staff: { id: string; fullName: string }[]
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#0C1D36]">Hasta Özeti</h3>
          {canEdit && <PatientMetaEditor patientId={patientId} initial={meta} staff={staff} />}
        </div>
        <dl className="grid gap-2 text-sm">
          <SummaryRow icon={<CalendarIcon className="h-3.5 w-3.5" />} label="Son Ziyaret" value={meta.lastVisit ?? '—'} />
          <SummaryRow icon={<ClipboardCheck className="h-3.5 w-3.5" />} label="Son Tanı" value={meta.lastDiagnosis ?? '—'} />
          <SummaryRow icon={<HeartPulse className="h-3.5 w-3.5" />} label="Devam Eden Tedavi" value={meta.currentTreatment ?? '—'} />
          <SummaryRow icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Doktor" value={meta.assignedDoctor ?? '—'} />
          <SummaryRow icon={<Sparkles className="h-3.5 w-3.5" />} label="Not" value={meta.summary ?? '—'} multiline />
        </dl>
      </CardContent>
    </Card>
  )
}

function SummaryRow({ icon, label, value, multiline = false }: { icon: React.ReactNode; label: string; value: string; multiline?: boolean }) {
  return (
    <div className="grid grid-cols-[20px_120px_1fr] gap-2 items-start">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-[#0C1D36] ${multiline ? '' : 'truncate'}`}>{value}</span>
    </div>
  )
}
