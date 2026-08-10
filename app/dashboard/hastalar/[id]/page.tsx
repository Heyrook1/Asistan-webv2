import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Phone, Mail, MapPin, AlertTriangle, HeartPulse,
  ShieldAlert, Calendar as CalendarIcon, ShieldCheck,
  ClipboardCheck, StickyNote,
} from 'lucide-react'
import { requirePagePermission, can } from '@/lib/session'
import { getPatientDetail } from '@/lib/queries'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TabsContent } from '@/components/ui/tabs'
import { PatientChartTabs } from '@/components/dashboard/patient-chart-tabs'
import { MobilePatientChart } from '@/components/dashboard/mobile-patient-chart'
import {
  ageFromBirthDate, formatPhone, formatDate, formatTime, formatDateTime, formatCurrency,
  APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS, TREATMENT_STATUS_LABELS, FILE_CATEGORY_LABELS,
  labelAllergySeverity,
} from '@/lib/format'
import { labelInvoiceStatus } from '@/lib/ui-labels'
import { PatientActionButtons } from './action-buttons'
import { PatientMetaEditor } from './meta-editor'
import { TreatmentPlanBoard } from './treatment-plan'
import { PatientSecondaryPanel } from './secondary-panel'
import { listPatientPrescriptions } from '@/lib/actions/prescriptions'
import { PatientPrescriptionsPanel } from '@/components/dashboard/patient-prescriptions-panel'
import { IntakeResponsePanel } from '@/components/intake/intake-response-panel'
import { parseIntakeFields } from '@/lib/intake/schema'
import { listClinicAssignableStaff } from '@/lib/team/clinic-staff'
import { HealthTimeline } from '@/components/health-timeline/health-timeline'
import { PatientNoteBody, SoapNoteBadge } from '@/components/dashboard/patient-note-body'
import { buildClinicHealthTimeline } from '@/lib/health-timeline'

export const dynamic = 'force-dynamic'

export default async function PatientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ action?: string; tab?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const session = await requirePagePermission('patient.view')
  const canEdit = can(session, 'patient.edit')
  const canViewMedicalNotes = can(session, 'medical_note.view')
  const canViewFiles = can(session, 'file.view')
  const canManageAppointments = can(session, 'appointment.manage')
  const initialAction = sp.action === 'note' || sp.action === 'file' ? sp.action : undefined
  const initialTab = sp.tab
  const patient = await getPatientDetail(session.businessId, id, {
    includeMedicalNotes: canViewMedicalNotes,
    includeFiles: canViewFiles,
    actorUserId: session.userId,
  })
  if (!patient) notFound()

  const age = ageFromBirthDate(patient.birthDate)

  const clinicTimeZone =
    (
      await prisma.business.findUnique({
        where: { id: session.businessId },
        select: { timezone: true },
      })
    )?.timezone ?? 'Asia/Nicosia'

  const canViewInvoices =
    session.isOwner || can(session, 'appointment.manage') || can(session, 'analytics.revenue.view')

  const [services, staff, locations, prescriptions, intakeResponses, intakeInvites, doctors, patientInvoices] =
    await Promise.all([
      prisma.service.findMany({
        where: { businessId: session.businessId, isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, durationMin: true },
      }),
      listClinicAssignableStaff(session.businessId),
      prisma.location.findMany({
        where: { businessId: session.businessId, isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true },
      }),
      listPatientPrescriptions(id),
      canViewMedicalNotes
        ? prisma.intakeResponse.findMany({
            where: { businessId: session.businessId, patientId: id },
            orderBy: { submittedAt: 'desc' },
            include: {
              form: { select: { name: true } },
              appointment: {
                select: {
                  id: true,
                  date: true,
                  startTime: true,
                  service: { select: { name: true } },
                },
              },
            },
            take: 50,
          })
        : Promise.resolve([]),
      canViewMedicalNotes || canManageAppointments
        ? prisma.intakeInvite.findMany({
            where: {
              businessId: session.businessId,
              patientId: id,
              status: 'PENDING',
            },
            orderBy: { expiresAt: 'asc' },
            include: {
              form: { select: { name: true } },
              appointment: {
                select: {
                  date: true,
                  startTime: true,
                  service: { select: { name: true } },
                },
              },
            },
            take: 20,
          })
        : Promise.resolve([]),
      prisma.teamMember.findMany({
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
      }),
      canViewInvoices
        ? prisma.clinicInvoice.findMany({
            where: { businessId: session.businessId, patientId: id },
            orderBy: { createdAt: 'desc' },
            take: 50,
            select: {
              id: true,
              number: true,
              status: true,
              total: true,
              currency: true,
              issuedAt: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),
    ])

  const showFinans = canViewInvoices && patientInvoices.length > 0

  const initials = patient.fullName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const lastAppointment = patient.appointments.find((a) => a.status === 'COMPLETED') ?? patient.appointments[0]
  const allergyNames = patient.allergies.slice(0, 3).map((a) => a.name).join(', ')

  const healthTimelineItems = buildClinicHealthTimeline({
    appointments: patient.appointments,
    labResults: patient.labResults,
    medications: patient.medications,
    allergies: patient.allergies,
    treatments: patient.treatments,
    notes: patient.notes,
    files: patient.files,
    timeline: patient.timeline,
    timeZone: clinicTimeZone,
    prescriptions: canViewMedicalNotes
      ? prescriptions.map((rx) => ({
          id: rx.id,
          protocolNo: rx.protocolNo,
          diagnosis: rx.diagnosis,
          issuedAt: rx.issuedAt,
        }))
      : [],
    intakeResponses: canViewMedicalNotes
      ? intakeResponses.map((row) => ({
          id: row.id,
          submittedAt: row.submittedAt,
          form: row.form,
          appointment: row.appointment,
        }))
      : [],
    includeNotes: canViewMedicalNotes,
    includeFiles: canViewFiles,
  }).map((item) =>
    item.id.startsWith('prescription:') && item.sourceEntityId
      ? {
          ...item,
          href: `/dashboard/hastalar/${patient.id}/receteler/${item.sourceEntityId}`,
        }
      : item
  )

  return (
    <div className="space-y-3 lg:space-y-4">
      <Link href="/dashboard/hastalar" className="tap-target inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand-teal">
        <ChevronLeft className="h-4 w-4" /> Hasta listesine dön
      </Link>

      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold text-brand-ink">Hasta Kartı</h1>
        <p className="text-sm text-muted-foreground">Özet önce; detaylar sekmelerde.</p>
      </div>

      <MobilePatientChart
        fullName={patient.fullName}
        patientNumber={patient.patientNumber}
        isArchived={patient.isArchived}
        ageLabel={age != null ? `${age} yaş` : null}
        phone={patient.phone}
        allergySummary={allergyNames || null}
      />

      {/* Header card — desktop / tablet */}
      <Card className="hidden md:block">
        <CardContent className="p-4 lg:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-hover text-lg font-bold text-white">
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
          </div>
        </CardContent>
      </Card>

      {canEdit ? (
        <div className="flex justify-end">
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
      ) : null}

      <PatientChartTabs
        initialTab={initialTab}
        canViewMedicalNotes={canViewMedicalNotes}
        canViewFiles={canViewFiles}
        canManageAppointments={canManageAppointments}
        showFinans={showFinans}
        counts={{
          timeline: healthTimelineItems.length,
          appointments: patient.appointments.length,
          medications: patient.medications.length,
          prescriptions: prescriptions.length,
          labs: patient.labResults.length,
          files: patient.files.length,
          notes: patient.notes.length,
          intake: intakeResponses.length + intakeInvites.length,
          allergies: patient.allergies.length,
          treatments: patient.treatments.length,
          invoices: patientInvoices.length,
        }}
      >
        {/* GENEL — özet + tedavi planı + hızlı bakış */}
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
                  Hızlı bakış
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <QuickJump label={`Klinik kayıtlar (${prescriptions.length + patient.medications.length + patient.allergies.length})`} />
                  <QuickJump label={`Belgeler (${patient.labResults.length + (canViewFiles ? patient.files.length : 0)})`} />
                  <QuickJump label={`Geçmiş (${healthTimelineItems.length})`} />
                  <QuickJump label={`Randevular (${patient.appointments.length})`} />
                  {showFinans ? <QuickJump label={`Faturalar (${patientInvoices.length})`} /> : null}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Detaylar Klinik, Belgeler ve Geçmiş sekmelerinde. Genel yalnızca kritik özeti gösterir.
                </p>
              </CardContent>
            </Card>

            <PatientSecondaryPanel timeline={patient.timeline} />
          </div>
        </TabsContent>

        {/* KLİNİK — reçete, ilaç, alerji, tedavi, not, anket, hikaye */}
        <TabsContent value="klinik">
          <div className="space-y-4">
            {canViewMedicalNotes && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-3 text-sm font-semibold text-brand-ink">Reçeteler</h3>
                  <PatientPrescriptionsPanel patientId={patient.id} prescriptions={prescriptions} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-brand-ink">İlaçlar</h3>
                {patient.medications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Kayıtlı ilaç yok.</p>
                ) : (
                  <ul className="space-y-3">
                    {patient.medications.map((m) => (
                      <li key={m.id} className="rounded-xl border bg-white p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-brand-ink">{m.name}</p>
                          <Badge
                            variant="outline"
                            className={m.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                          >
                            {m.active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {[m.dosage, m.frequency].filter(Boolean).join(' • ') || 'Detay yok'}
                        </p>
                        {(m.startDate || m.endDate) && (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {m.startDate ? formatDate(m.startDate) : '—'} →{' '}
                            {m.endDate ? formatDate(m.endDate) : 'devam ediyor'}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-brand-ink">Alerjiler</h3>
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
                            {labelAllergySeverity(a.severity)}
                          </Badge>
                        </div>
                        {a.reaction && (
                          <p className="mt-1 text-xs text-muted-foreground">Reaksiyon: {a.reaction}</p>
                        )}
                        {a.notes && <p className="mt-1 text-xs whitespace-pre-line">{a.notes}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-brand-ink">Tedaviler</h3>
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

            {canViewMedicalNotes && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-3 text-sm font-semibold text-brand-ink">Klinik notlar</h3>
                  {patient.notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Bu hasta için not yok.</p>
                  ) : (
                    <ul className="space-y-3">
                      {patient.notes.map((n) => (
                        <li key={n.id} className="rounded-xl border bg-white p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-brand-ink">{n.title}</p>
                              <SoapNoteBadge note={n.note} />
                            </div>
                            {n.isPinned && (
                              <Badge className="bg-amber-100 text-amber-800 border-0">Sabit</Badge>
                            )}
                          </div>
                          <PatientNoteBody note={n.note} />
                          <p className="mt-2 text-[10px] text-muted-foreground">
                            {formatDateTime(n.createdAt)} • {n.creator?.fullName ?? n.createdBy}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}

            {(canViewMedicalNotes || canManageAppointments) && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-3 text-sm font-semibold text-brand-ink">Anketler</h3>
                  <IntakeResponsePanel
                    canManageAppointments={canManageAppointments}
                    responses={
                      canViewMedicalNotes
                        ? intakeResponses.map((row) => ({
                            id: row.id,
                            submittedAt: row.submittedAt.toISOString(),
                            formName: row.form.name,
                            answers: (row.answers && typeof row.answers === 'object'
                              ? row.answers
                              : {}) as Record<string, string | boolean | null>,
                            fields: parseIntakeFields(row.formSnapshot),
                            appointment: row.appointment
                              ? {
                                  id: row.appointment.id,
                                  date: row.appointment.date.toISOString().slice(0, 10),
                                  startTime: row.appointment.startTime,
                                  serviceName: row.appointment.service.name,
                                }
                              : null,
                          }))
                        : []
                    }
                    pendingInvites={intakeInvites.map((invite) => ({
                      id: invite.id,
                      appointmentId: invite.appointmentId,
                      status: invite.status,
                      formName: invite.form.name,
                      expiresAt: invite.expiresAt.toISOString(),
                      appointment: {
                        date: invite.appointment.date.toISOString().slice(0, 10),
                        startTime: invite.appointment.startTime,
                        serviceName: invite.appointment.service.name,
                      },
                    }))}
                  />
                </CardContent>
              </Card>
            )}

            {canViewMedicalNotes && (
              <Card>
                <CardContent className="p-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-brand-ink">Anamnez ve hasta hikayesi</h3>
                    {patient.patientStory ? (
                      <p className="whitespace-pre-line text-sm leading-6 text-brand-ink">{patient.patientStory}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Hasta hikayesi henüz girilmedi.</p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-dashed border-border bg-dashboard-surface p-4">
                    <h3 className="text-sm font-semibold text-brand-ink">Boylamsal kayıt</h3>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Randevu, tahlil, ilaç ve diğer klinik olaylar{' '}
                      <span className="font-semibold text-brand-ink">Geçmiş</span> sekmesinde gün bazında birleşiyor (
                      {healthTimelineItems.length} kayıt).
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* FİNANS — hastaya bağlı faturalar */}
        {showFinans ? (
          <TabsContent value="finans">
            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-ink">Faturalar</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Bu hastaya bağlı klinik faturalar.</p>
                  </div>
                  <Link
                    href="/dashboard/faturalar"
                    className="text-xs font-semibold text-brand-teal hover:underline"
                  >
                    Tüm faturalar →
                  </Link>
                </div>
                <ul className="divide-y">
                  {patientInvoices.map((inv) => (
                    <li key={inv.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-brand-ink">
                          {inv.number ?? `Taslak · ${inv.id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(inv.issuedAt ?? inv.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-brand-ink">
                          {formatCurrency(Number(inv.total), inv.currency)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{labelInvoiceStatus(inv.status)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}

        {/* BELGELER — tahlil + dosya */}
        <TabsContent value="belgeler">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-brand-ink">Tahliller</h3>
                {patient.labResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Kayıtlı tahlil yok.</p>
                ) : (
                  <ul className="space-y-3">
                    {patient.labResults.map((l) => (
                      <li key={l.id} className="rounded-xl border bg-white p-3">
                        <p className="text-sm font-semibold text-brand-ink">{l.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(l.resultDate)}
                          {l.labName ? ` • ${l.labName}` : ''}
                        </p>
                        {l.description && <p className="text-xs mt-1 whitespace-pre-line">{l.description}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            {canViewFiles && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-3 text-sm font-semibold text-brand-ink">Dosyalar</h3>
                  {patient.files.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Yüklü dosya yok.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {patient.files.map((f) => (
                        <a
                          key={f.id}
                          href={f.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-xl border bg-white p-3 hover:border-brand-teal/40"
                        >
                          <p className="text-sm font-medium text-brand-ink truncate">{f.fileName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {FILE_CATEGORY_LABELS[f.category] ?? f.category} • {f.fileType}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDateTime(f.uploadedAt)}
                          </p>
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* GEÇMİŞ — zaman çizelgesi + randevular */}
        <TabsContent value="gecmis">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-brand-ink">Klinik zaman çizelgesi</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Randevu, tahlil, ilaç, alerji, tedavi, not ve dosyalar gün bazında birleşir.
                  </p>
                </div>
                <HealthTimeline
                  items={healthTimelineItems}
                  variant="clinic"
                  locale="tr"
                  timeZone={clinicTimeZone}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-brand-ink">Randevular</h3>
                {patient.appointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Henüz randevu yok.</p>
                ) : (
                  <ul className="divide-y">
                    {patient.appointments.map((a) => (
                      <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-brand-ink">{a.service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(a.date)} • {formatTime(a.startTime)}-{formatTime(a.endTime)}
                            {a.staff ? ` • ${a.staff.fullName}` : ''}
                          </p>
                          {a.notes && <p className="mt-1 text-xs text-muted-foreground">{a.notes}</p>}
                        </div>
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[10px] ${APPOINTMENT_STATUS_COLORS[a.status]}`}
                        >
                          {APPOINTMENT_STATUS_LABELS[a.status]}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </PatientChartTabs>
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
