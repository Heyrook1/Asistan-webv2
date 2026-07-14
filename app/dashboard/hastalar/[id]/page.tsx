import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Phone, Mail, MapPin, AlertTriangle, HeartPulse,
  ShieldAlert, Calendar as CalendarIcon, ShieldCheck,
  FileText, ClipboardCheck, StickyNote, Activity,
} from 'lucide-react'
import { requirePagePermission, can } from '@/lib/session'
import { getPatientDetail } from '@/lib/queries'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  ageFromBirthDate, formatPhone, formatDate, formatTime, formatDateTime, formatTimeAgo,
  APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS, TREATMENT_STATUS_LABELS, FILE_CATEGORY_LABELS,
} from '@/lib/format'
import { PatientActionButtons } from './action-buttons'
import { PatientMetaEditor } from './meta-editor'
import { TreatmentPlanBoard } from './treatment-plan'
import { PatientSecondaryPanel } from './secondary-panel'
import { listPatientPrescriptions } from '@/lib/actions/prescriptions'
import { PatientPrescriptionsPanel } from '@/components/dashboard/patient-prescriptions-panel'

export const dynamic = 'force-dynamic'

export default async function PatientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ action?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const session = await requirePagePermission('patient.view')
  const canEdit = can(session, 'patient.edit')
  const canViewMedicalNotes = can(session, 'medical_note.view')
  const canViewFiles = can(session, 'file.view')
  const initialAction = sp.action === 'note' || sp.action === 'file' ? sp.action : undefined
  const patient = await getPatientDetail(session.businessId, id, {
    includeMedicalNotes: canViewMedicalNotes,
    includeFiles: canViewFiles,
  })
  if (!patient) notFound()

  const age = ageFromBirthDate(patient.birthDate)

  const [services, staff, locations, prescriptions] = await Promise.all([
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
    prisma.location.findMany({
      where: { businessId: session.businessId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true },
    }),
    listPatientPrescriptions(id),
  ])

  const doctors = await prisma.teamMember.findMany({
    where: { businessId: session.businessId, isActive: true, role: 'DOKTOR' },
    orderBy: { fullName: 'asc' },
    select: {
      id: true,
      fullName: true,
      specialty: true,
      prescriptionTitle: true,
      kktcIdentityNo: true,
      medicalLicenseNo: true,
      diplomaNo: true,
      phone: true,
    },
  })

  const initials = patient.fullName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const lastAppointment = patient.appointments.find((a) => a.status === 'COMPLETED') ?? patient.appointments[0]
  const allergyNames = patient.allergies.slice(0, 3).map((a) => a.name).join(', ')
  const activeMedications = patient.medications.filter((m) => m.active)

  return (
    <div className="space-y-3 lg:space-y-4">
      <Link href="/dashboard/hastalar" className="tap-target inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-teal">
        <ChevronLeft className="h-4 w-4" /> Hasta listesine dön
      </Link>

      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold text-brand-ink">Hasta Kartı</h1>
        <p className="text-sm text-muted-foreground">Özet önce; detaylar sekmelerde.</p>
      </div>

      {/* Header card — primary identity + critical signals only */}
      <Card>
        <CardContent className="p-4 lg:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-teal to-brand-cyan text-lg font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-brand-ink">{patient.fullName}</h2>
                  <Badge className={patient.isArchived ? 'bg-rose-100 text-rose-800 border-0' : 'bg-emerald-100 text-emerald-800 border-0'}>
                    {patient.isArchived ? 'Arşivli' : 'Aktif'}
                  </Badge>
                  <span className="text-[13px] font-medium text-brand-teal">#{patient.patientNumber}</span>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{age != null ? `${age} yaş` : 'Yaş —'}</span>
                  <span>{patient.gender ?? 'Cinsiyet —'}</span>
                  <span className="font-medium text-brand-ink">Kan: {patient.bloodType ?? '—'}</span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-brand-teal" /> {formatPhone(patient.phone)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <SignalChip
                    tone={allergyNames ? 'amber' : 'muted'}
                    icon={<AlertTriangle className="h-3.5 w-3.5" />}
                    label="Alerji"
                    value={allergyNames || 'Yok'}
                  />
                  <SignalChip
                    tone={patient.chronicDiseases ? 'sky' : 'muted'}
                    icon={<HeartPulse className="h-3.5 w-3.5" />}
                    label="Kronik"
                    value={patient.chronicDiseases || 'Yok'}
                  />
                  <SignalChip
                    tone={patient.riskNote ? 'rose' : 'muted'}
                    icon={<ShieldAlert className="h-3.5 w-3.5" />}
                    label="Risk"
                    value={patient.riskNote || 'Yok'}
                  />
                </div>

                {(patient.email || patient.city || patient.emergencyContactName || patient.emergencyContactPhone) && (
                  <details className="mt-3 group">
                    <summary className="cursor-pointer list-none text-xs font-semibold text-brand-teal hover:underline">
                      İletişim ve acil bilgiler
                    </summary>
                    <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {patient.email ? (
                        <p className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-brand-teal" /> {patient.email}
                        </p>
                      ) : null}
                      {patient.city ? (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-brand-teal" /> {patient.city}
                        </p>
                      ) : null}
                      {(patient.emergencyContactName || patient.emergencyContactPhone) && (
                        <p className="inline-flex items-center gap-1.5 rounded-lg bg-dashboard-surface px-2.5 py-1.5 text-xs">
                          <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                          <span>
                            <strong className="text-brand-ink">Acil:</strong>{' '}
                            {patient.emergencyContactName ?? '—'}
                            {patient.emergencyContactPhone ? ` — ${formatPhone(patient.emergencyContactPhone)}` : ''}
                          </span>
                        </p>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>

            {canEdit && (
              <div className="shrink-0">
                <PatientActionButtons
                  patientId={patient.id}
                  businessId={session.businessId}
                  isArchived={patient.isArchived}
                  services={services}
                  staff={staff}
                  doctors={doctors}
                  locations={locations}
                  patientLabel={`${patient.fullName} (#${patient.patientNumber})`}
                  defaultStaffId={session.staffMemberId ?? undefined}
                  initialAction={initialAction}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="genel" className="space-y-3 lg:space-y-4">
        <div className="-mx-4 sticky top-14 z-10 bg-dashboard-bg/95 px-4 backdrop-blur md:static md:mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none lg:top-[68px]">
          <Card className="overflow-hidden">
            <CardContent className="p-1.5 md:p-2">
              <div className="overflow-x-auto no-scrollbar md:overflow-visible">
                <TabsList className="inline-flex h-auto w-max items-stretch gap-1 bg-transparent p-0 md:flex md:w-auto md:flex-wrap md:gap-1 md:p-1">
                  <TabsTrigger value="genel" className="h-10 shrink-0 px-3 text-[13px] md:h-9 md:text-sm">Özet</TabsTrigger>
                  <TabsTrigger value="randevular" className="h-10 shrink-0 px-3 text-[13px] md:h-9 md:text-sm">Randevular ({patient.appointments.length})</TabsTrigger>
                  {canViewMedicalNotes && (
                    <TabsTrigger value="not" className="h-10 shrink-0 px-3 text-[13px] md:h-9 md:text-sm">Notlar ({patient.notes.length})</TabsTrigger>
                  )}
                  <TabsTrigger value="ilac" className="h-10 shrink-0 px-3 text-[13px] md:h-9 md:text-sm">İlaçlar ({patient.medications.length})</TabsTrigger>
                  <TabsTrigger value="alerji" className="h-10 shrink-0 px-3 text-[13px] md:h-9 md:text-sm">Alerjiler ({patient.allergies.length})</TabsTrigger>
                  <TabsTrigger value="tedavi" className="h-10 shrink-0 px-3 text-[13px] md:h-9 md:text-sm">Tedaviler ({patient.treatments.length})</TabsTrigger>
                  <TabsTrigger value="tahlil" className="h-10 shrink-0 px-3 text-[13px] md:h-9 md:text-sm">Tahliller ({patient.labResults.length})</TabsTrigger>
                  {canViewFiles && (
                    <TabsTrigger value="dosya" className="h-10 shrink-0 px-3 text-[13px] md:h-9 md:text-sm">Dosyalar ({patient.files.length})</TabsTrigger>
                  )}
                  <TabsTrigger value="recete" className="h-10 shrink-0 px-3 text-[13px] md:h-9 md:text-sm">Reçeteler ({prescriptions.length})</TabsTrigger>
                  {canViewMedicalNotes && (
                    <TabsTrigger value="hikaye" className="h-10 shrink-0 px-3 text-[13px] md:h-9 md:text-sm">Hikaye</TabsTrigger>
                  )}
                </TabsList>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ÖZET — primary only */}
        <TabsContent value="genel">
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
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
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
                      <ClipboardCheck className="h-4 w-4 text-brand-teal" /> Tedavi Planı
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

            <Card>
              <CardContent className="p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Detay sekmeleri
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <QuickJump label={`İlaçlar (${activeMedications.length} aktif)`} />
                  <QuickJump label={`Tahliller (${patient.labResults.length})`} />
                  <QuickJump label={`Dosyalar (${patient.files.length})`} />
                  <QuickJump label={`Reçeteler (${prescriptions.length})`} />
                  <QuickJump label={`Randevular (${patient.appointments.length})`} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Tam listeler ilgili sekmede. Özet ekranı yalnızca kritik klinik özeti gösterir.
                </p>
              </CardContent>
            </Card>

            <PatientSecondaryPanel timeline={patient.timeline} />
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
                        <p className="text-sm font-medium text-brand-ink">{a.service.name}</p>
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
                        <p className="text-sm font-semibold text-brand-ink">{m.name}</p>
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
                        <p className="text-sm font-semibold text-brand-ink">{a.name}</p>
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
                        <p className="text-sm font-semibold text-brand-ink">{t.title}</p>
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
                      <p className="text-sm font-semibold text-brand-ink">{l.title}</p>
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
        {canViewMedicalNotes && (
          <>
            <TabsContent value="recete">
              <Card>
                <CardContent className="p-5">
                  <PatientPrescriptionsPanel patientId={patient.id} prescriptions={prescriptions} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hikaye">
              <Card>
                <CardContent className="p-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-brand-ink">Anamnez ve Hasta Hikayesi</h3>
                    {patient.patientStory ? (
                      <p className="whitespace-pre-line text-sm leading-6 text-brand-ink">{patient.patientStory}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Hasta hikayesi henüz girilmedi.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-brand-ink">Zaman Çizelgesi</h3>
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
                            <p className="text-sm text-brand-ink">{ev.title}</p>
                            {ev.description && <p className="text-[11px] text-muted-foreground">{ev.description}</p>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        {/* DOSYALAR */}
        {canViewFiles && (
        <TabsContent value="dosya">
          <Card>
            <CardContent className="p-5">
              {patient.files.length === 0 ? (
                <p className="text-sm text-muted-foreground">Yüklü dosya yok.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {patient.files.map((f) => (
                    <a key={f.id} href={f.fileUrl} target="_blank" rel="noreferrer" className="block rounded-xl border bg-white p-3 hover:border-brand-teal/40">
                      <p className="text-sm font-medium text-brand-ink truncate">{f.fileName}</p>
                      <p className="text-[11px] text-muted-foreground">{FILE_CATEGORY_LABELS[f.category] ?? f.category} • {f.fileType}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(f.uploadedAt)}</p>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* NOTLAR */}
        {canViewMedicalNotes && (
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
                        <p className="text-sm font-semibold text-brand-ink">{n.title}</p>
                        {n.isPinned && <Badge className="bg-amber-100 text-amber-800 border-0">Sabit</Badge>}
                      </div>
                      <p className="mt-1 text-sm whitespace-pre-line text-brand-ink">{n.note}</p>
                      <p className="mt-2 text-[10px] text-muted-foreground">{formatDateTime(n.createdAt)} • {n.creator?.fullName ?? n.createdBy}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function SignalChip({
  tone,
  icon,
  label,
  value,
}: {
  tone: 'amber' | 'sky' | 'rose' | 'muted'
  icon: React.ReactNode
  label: string
  value: string
}) {
  const toneClass = {
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    sky: 'border-sky-200 bg-sky-50 text-sky-900',
    rose: 'border-rose-200 bg-rose-50 text-rose-900',
    muted: 'border-border bg-dashboard-surface text-muted-foreground',
  }[tone]
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClass}`}>
      {icon}
      <span className="shrink-0 opacity-80">{label}:</span>
      <span className="truncate font-semibold text-brand-ink">{value}</span>
    </span>
  )
}

function QuickJump({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-brand-ink">
      {label}
    </span>
  )
}

function timelineColor(idx: number) {
  const palette = ['#0071E3', '#16A9E8', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4']
  return palette[idx % palette.length]
}

function timelineIcon(type: string) {
  if (type.includes('APPOINTMENT')) return <CalendarIcon className="h-3 w-3" />
  if (type.includes('MEDICATION')) return <span className="text-[9px] font-bold">Rx</span>
  if (type.includes('LAB')) return <ClipboardCheck className="h-3 w-3" />
  if (type.includes('FILE')) return <FileText className="h-3 w-3" />
  return <Activity className="h-3 w-3" />
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
          <h3 className="text-sm font-semibold text-brand-ink">Hasta Özeti</h3>
          {canEdit && <PatientMetaEditor patientId={patientId} initial={meta} staff={staff} />}
        </div>
        <dl className="grid gap-2 text-sm">
          <SummaryRow icon={<CalendarIcon className="h-3.5 w-3.5" />} label="Son Ziyaret" value={meta.lastVisit ?? '—'} />
          <SummaryRow icon={<ClipboardCheck className="h-3.5 w-3.5" />} label="Son Tanı" value={meta.lastDiagnosis ?? '—'} />
          <SummaryRow icon={<HeartPulse className="h-3.5 w-3.5" />} label="Devam Eden Tedavi" value={meta.currentTreatment ?? '—'} />
          <SummaryRow icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Doktor" value={meta.assignedDoctor ?? '—'} />
          <SummaryRow icon={<StickyNote className="h-3.5 w-3.5" />} label="Not" value={meta.summary ?? '—'} multiline />
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
      <span className={`text-brand-ink ${multiline ? '' : 'truncate'}`}>{value}</span>
    </div>
  )
}
