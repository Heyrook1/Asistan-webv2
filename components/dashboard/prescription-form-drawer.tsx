'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Printer, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { AccessibleField } from '@/components/ui/accessible-field'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createPrescription, getPrescriptionDraft } from '@/lib/actions/prescriptions'
import type { PrescriptionLineInput } from '@/lib/prescriptions/schema'
import { prescriptionUiCopy } from '@/lib/prescriptions/ui-copy'

type DoctorOption = {
  id: string
  fullName: string
  specialty: string | null
  prescriptionTitle: string | null
  kktcIdentityNo: string | null
  medicalLicenseNo: string | null
  diplomaNo: string | null
  phone: string | null
}

type DraftState = {
  patientId: string
  doctorId: string | null
  diagnosis: string
  notes: string
  validUntil: string
  allergyWarning: string
  patient: {
    fullName: string
    identityNumber: string
    birthDate: string
    gender: string
    phone: string
    address: string
    city: string
  }
  clinic: {
    name: string
    address: string
    city: string
    phone: string
  }
  lines: PrescriptionLineInput[]
  missingFields: string[]
}

const emptyLine = (): PrescriptionLineInput => ({
  drugName: '',
  dosage: '',
  frequency: '',
  instructions: '',
})

export function PrescriptionFormDrawer({
  open,
  onOpenChange,
  patientId,
  doctors,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  doctors: DoctorOption[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [doctorId, setDoctorId] = useState<string>('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getPrescriptionDraft(patientId)
      .then((result) => {
        if (!result.ok || !result.data) {
          toast.error(result.ok ? prescriptionUiCopy.draftFailed : result.error)
          return
        }
        const next = result.data as DraftState
        setDraft(next)
        setDoctorId(next.doctorId ?? doctors[0]?.id ?? '')
      })
      .finally(() => setLoading(false))
  }, [open, patientId, doctors])

  const selectedDoctor = doctors.find((doctor) => doctor.id === doctorId) ?? null

  function updateLine(index: number, patch: Partial<PrescriptionLineInput>) {
    if (!draft) return
    setDraft({
      ...draft,
      lines: draft.lines.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line)),
    })
  }

  function addLine() {
    if (!draft) return
    setDraft({ ...draft, lines: [...draft.lines, emptyLine()] })
  }

  function removeLine(index: number) {
    if (!draft || draft.lines.length <= 1) return
    setDraft({ ...draft, lines: draft.lines.filter((_, lineIndex) => lineIndex !== index) })
  }

  function submit() {
    if (!draft || !selectedDoctor) {
      toast.error('Doktor seçimi zorunludur')
      return
    }

    startTransition(async () => {
      const result = await createPrescription({
        patientId,
        doctorId: selectedDoctor.id,
        diagnosis: draft.diagnosis,
        notes: draft.notes || undefined,
        validUntil: draft.validUntil || undefined,
        patientFullName: draft.patient.fullName,
        patientIdentityNumber: draft.patient.identityNumber || undefined,
        patientBirthDate: draft.patient.birthDate || undefined,
        patientGender: draft.patient.gender || undefined,
        patientPhone: draft.patient.phone,
        patientAddress: draft.patient.address || undefined,
        patientCity: draft.patient.city || undefined,
        doctorTitle: selectedDoctor.prescriptionTitle ?? 'Dr.',
        doctorFullName: selectedDoctor.fullName,
        doctorSpecialty: selectedDoctor.specialty ?? undefined,
        doctorKktcIdentityNo: selectedDoctor.kktcIdentityNo ?? undefined,
        doctorMedicalLicenseNo: selectedDoctor.medicalLicenseNo ?? undefined,
        doctorDiplomaNo: selectedDoctor.diplomaNo ?? undefined,
        doctorPhone: selectedDoctor.phone ?? undefined,
        clinicName: draft.clinic.name,
        clinicAddress: draft.clinic.address || undefined,
        clinicCity: draft.clinic.city || undefined,
        clinicPhone: draft.clinic.phone || undefined,
        lines: draft.lines.filter((line) => line.drugName.trim()),
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success(prescriptionUiCopy.createSuccess(result.data.protocolNo))
      onOpenChange(false)
      router.push(`/dashboard/hastalar/${patientId}/receteler/${result.data.id}`)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{prescriptionUiCopy.createTitle}</DialogTitle>
        </DialogHeader>

        {loading || !draft ? (
          <p className="text-sm text-muted-foreground">Hasta ve doktor bilgileri yükleniyor…</p>
        ) : (
          <div className="grid gap-5">
            {draft.missingFields.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="font-semibold">Eksik alanlar</p>
                <p className="mt-1">{draft.missingFields.join(' • ')}</p>
              </div>
            )}

            {draft.allergyWarning && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                <p className="font-semibold">Alerji uyarısı</p>
                <p className="mt-1">{draft.allergyWarning}</p>
              </div>
            )}

            <section className="grid gap-3 sm:grid-cols-2">
              <Field label="Hasta adı">
                <Input
                  value={draft.patient.fullName}
                  onChange={(e) => setDraft({ ...draft, patient: { ...draft.patient, fullName: e.target.value } })}
                />
              </Field>
              <Field label="KKTC kimlik no *" required>
                <Input
                  value={draft.patient.identityNumber}
                  onChange={(e) =>
                    setDraft({ ...draft, patient: { ...draft.patient, identityNumber: e.target.value } })
                  }
                />
              </Field>
              <Field label="Doğum tarihi">
                <Input
                  type="date"
                  value={draft.patient.birthDate}
                  onChange={(e) => setDraft({ ...draft, patient: { ...draft.patient, birthDate: e.target.value } })}
                />
              </Field>
              <Field label="Telefon">
                <Input
                  value={draft.patient.phone}
                  onChange={(e) => setDraft({ ...draft, patient: { ...draft.patient, phone: e.target.value } })}
                />
              </Field>
              <Field label="Adres">
                <Input
                  value={draft.patient.address}
                  onChange={(e) => setDraft({ ...draft, patient: { ...draft.patient, address: e.target.value } })}
                />
              </Field>
              <Field label="Şehir">
                <Input
                  value={draft.patient.city}
                  onChange={(e) => setDraft({ ...draft, patient: { ...draft.patient, city: e.target.value } })}
                />
              </Field>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <Field label="Reçete yazan doktor *" required>
                <Select value={doctorId} onValueChange={setDoctorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Doktor seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.prescriptionTitle ?? 'Dr.'} {doctor.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Geçerlilik tarihi">
                <Input
                  type="date"
                  value={draft.validUntil}
                  onChange={(e) => setDraft({ ...draft, validUntil: e.target.value })}
                />
              </Field>
              <Field label="Doktor KKTC kimlik no">
                <Input value={selectedDoctor?.kktcIdentityNo ?? ''} disabled />
              </Field>
              <Field label="Ruhsat / sicil no">
                <Input value={selectedDoctor?.medicalLicenseNo ?? ''} disabled />
              </Field>
              <Field label="Diploma no">
                <Input value={selectedDoctor?.diplomaNo ?? ''} disabled />
              </Field>
              <Field label="Uzmanlık">
                <Input value={selectedDoctor?.specialty ?? ''} disabled />
              </Field>
            </section>

            <section className="grid gap-3">
              <Field label="Tanı *" required>
                <Textarea
                  value={draft.diagnosis}
                  onChange={(e) => setDraft({ ...draft, diagnosis: e.target.value })}
                  rows={2}
                />
              </Field>
              <Field label="Reçete notu">
                <Textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} rows={2} />
              </Field>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-brand-ink">İlaç satırları</p>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="mr-2 h-4 w-4" />
                  Satır ekle
                </Button>
              </div>

              {draft.lines.map((line, index) => (
                <div key={`line-${index}`} className="rounded-xl border border-border/70 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">İlaç {index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLine(index)}
                      aria-label={`İlaç ${index + 1} satırını sil`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="İlaç adı *" required>
                      <Input value={line.drugName} onChange={(e) => updateLine(index, { drugName: e.target.value })} />
                    </Field>
                    <Field label="Doz">
                      <Input value={line.dosage ?? ''} onChange={(e) => updateLine(index, { dosage: e.target.value })} />
                    </Field>
                    <Field label="Kullanım">
                      <Input
                        value={line.frequency ?? ''}
                        onChange={(e) => updateLine(index, { frequency: e.target.value })}
                      />
                    </Field>
                    <Field label="Süre (gün)">
                      <Input
                        type="number"
                        value={line.durationDays ?? ''}
                        onChange={(e) =>
                          updateLine(index, { durationDays: e.target.value ? Number(e.target.value) : undefined })
                        }
                      />
                    </Field>
                    <Field label="Adet">
                      <Input
                        type="number"
                        value={line.quantity ?? ''}
                        onChange={(e) =>
                          updateLine(index, { quantity: e.target.value ? Number(e.target.value) : undefined })
                        }
                      />
                    </Field>
                    <Field label="Kullanım şekli">
                      <Input
                        value={line.instructions ?? ''}
                        onChange={(e) => updateLine(index, { instructions: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </section>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Vazgeç
              </Button>
              <Button
                type="button"
                disabled={pending}
                className="bg-brand-teal text-white hover:bg-brand-teal-hover"
                onClick={submit}
              >
                <Printer className="mr-2 h-4 w-4" />
                {pending ? prescriptionUiCopy.createPending : prescriptionUiCopy.createSubmit}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactElement
}) {
  return (
    <AccessibleField
      label={label}
      required={required ?? label.includes('*')}
      labelClassName="text-xs text-muted-foreground"
      className="grid gap-1.5"
    >
      {children}
    </AccessibleField>
  )
}
