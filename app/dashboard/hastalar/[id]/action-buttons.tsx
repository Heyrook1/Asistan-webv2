'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AccessibleField } from '@/components/ui/accessible-field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Archive, ArchiveRestore, CalendarPlus, ChevronDown, FilePlus, FileText, Pill, ShieldAlert, ClipboardList, FlaskConical, NotebookPen } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  addAllergy, addLabResult, addMedication, addPatientFile, addPatientNote, addTreatment, archivePatient,
} from '@/lib/actions/patients'
import { uploadPatientFile } from '@/lib/storage'
import { AppointmentFormDrawer } from '@/components/dashboard/appointment-form-drawer'
import { PrescriptionFormDrawer } from '@/components/dashboard/prescription-form-drawer'
import {
  defaultSoapNoteTitle,
  emptySoapSections,
  formatSoapNoteBody,
  soapSectionsHaveContent,
  type SoapSections,
} from '@/lib/clinical-notes/soap'

type Modal = 'note' | 'medication' | 'allergy' | 'treatment' | 'lab' | 'file' | 'appointment' | 'prescription' | null
type NoteMode = 'free' | 'soap'

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

export function PatientActionButtons({
  patientId,
  businessId,
  isArchived,
  services,
  staff,
  doctors,
  locations,
  patientLabel,
  defaultStaffId,
  initialAction,
}: {
  patientId: string
  businessId: string
  isArchived: boolean
  services: { id: string; name: string; durationMin: number }[]
  staff: { id: string; fullName: string }[]
  doctors: DoctorOption[]
  locations: { id: string; name: string }[]
  patientLabel: string
  defaultStaffId?: string
  initialAction?: 'note' | 'file'
}) {
  const router = useRouter()
  const [open, setOpen] = useState<Modal>(null)
  const [pending, startTransition] = useTransition()
  const [noteMode, setNoteMode] = useState<NoteMode>('free')
  const [soap, setSoap] = useState<SoapSections>(() => emptySoapSections())
  const deepLinkHandled = useRef(false)

  // shared form state
  const noteRef = useRef({ title: '', note: '' })
  const medRef = useRef({ name: '', dosage: '', frequency: '', startDate: '', endDate: '', notes: '' })
  const allergyRef = useRef({ name: '', severity: 'ORTA' as 'HAFIF' | 'ORTA' | 'SIDDETLI', reaction: '', notes: '' })
  const treatmentRef = useRef({ title: '', description: '', doctorName: '', startDate: '', endDate: '', status: 'PLANLANDI' as const, cost: '', notes: '' })
  const labRef = useRef({ title: '', description: '', resultDate: '', labName: '', notes: '' })
  const fileRef = useRef<{ file: File | null; category: string; description: string }>({ file: null, category: 'DIGER', description: '' })

  function openNote(mode: NoteMode = 'free') {
    setNoteMode(mode)
    if (mode === 'soap' && !noteRef.current.title.trim()) {
      noteRef.current.title = defaultSoapNoteTitle()
    }
    setOpen('note')
  }

  useEffect(() => {
    if (deepLinkHandled.current || !initialAction) return
    deepLinkHandled.current = true
    setOpen(initialAction)
    router.replace(`/dashboard/hastalar/${patientId}`, { scroll: false })
  }, [initialAction, patientId, router])

  function withTransition(fn: () => Promise<void>) {
    startTransition(() => {
      fn().catch((e) => toast.error(e instanceof Error ? e.message : 'İşlem başarısız'))
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => setOpen('appointment')}
          className="h-11 bg-brand-teal text-white hover:bg-brand-teal-hover md:h-9"
        >
          <CalendarPlus className="mr-2 h-4 w-4" /> Randevu Oluştur
        </Button>
        {doctors.length > 0 && (
          <Button
            onClick={() => setOpen('prescription')}
            variant="outline"
            className="h-11 border-brand-teal/30 text-brand-teal hover:bg-brand-teal/5 md:h-9"
          >
            <FileText className="mr-2 h-4 w-4" /> Reçete
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-11 md:h-9">
              Daha fazla
              <ChevronDown className="ml-1.5 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => openNote('free')}>
              <NotebookPen className="mr-2 h-4 w-4" /> Not ekle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openNote('soap')}>
              <ClipboardList className="mr-2 h-4 w-4" /> SOAP notu
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpen('medication')}>
              <Pill className="mr-2 h-4 w-4" /> İlaç ekle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpen('allergy')}>
              <ShieldAlert className="mr-2 h-4 w-4" /> Alerji ekle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpen('treatment')}>
              <ClipboardList className="mr-2 h-4 w-4" /> Tedavi ekle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpen('lab')}>
              <FlaskConical className="mr-2 h-4 w-4" /> Tahlil ekle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpen('file')}>
              <FilePlus className="mr-2 h-4 w-4" /> Dosya ekle
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                withTransition(async () => {
                  const result = await archivePatient({ id: patientId, archived: !isArchived })
                  if (!result.ok) {
                    toast.error(result.error)
                    return
                  }
                  toast.success(isArchived ? 'Hasta aktifleştirildi' : 'Hasta arşivlendi')
                  router.refresh()
                })
              }
            >
              {isArchived ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
              {isArchived ? 'Aktifleştir' : 'Arşivle'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AppointmentFormDrawer
        open={open === 'appointment'}
        onOpenChange={(v) => setOpen(v ? 'appointment' : null)}
        locations={locations.map((location) => ({ id: location.id, label: location.name }))}
        patients={[{ id: patientId, label: patientLabel }]}
        services={services.map((s) => ({ id: s.id, label: s.name, durationMin: s.durationMin }))}
        staff={staff.map((s) => ({ id: s.id, label: s.fullName }))}
        defaultPatientId={patientId}
        defaultStaffId={defaultStaffId}
      />

      <Dialog
        open={open === 'note'}
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null)
            setSoap(emptySoapSections())
            setNoteMode('free')
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{noteMode === 'soap' ? 'SOAP notu ekle' : 'Not ekle'}</DialogTitle>
          </DialogHeader>
          <div className="mb-1 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={noteMode === 'free' ? 'default' : 'outline'}
              className={noteMode === 'free' ? 'bg-brand-teal text-white hover:bg-brand-teal-hover' : ''}
              onClick={() => setNoteMode('free')}
            >
              Serbest
            </Button>
            <Button
              type="button"
              size="sm"
              variant={noteMode === 'soap' ? 'default' : 'outline'}
              className={noteMode === 'soap' ? 'bg-brand-teal text-white hover:bg-brand-teal-hover' : ''}
              onClick={() => {
                if (!noteRef.current.title.trim()) noteRef.current.title = defaultSoapNoteTitle()
                setNoteMode('soap')
              }}
            >
              SOAP
            </Button>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            {noteMode === 'soap'
              ? 'Yapılandırılmış şablon — ses yazımı veya yapay zeka yok; hekim düzenler ve kaydeder.'
              : 'Serbest klinik notu.'}
          </p>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              const title = noteRef.current.title.trim() || (noteMode === 'soap' ? defaultSoapNoteTitle() : '')
              const note =
                noteMode === 'soap' ? formatSoapNoteBody(soap) : noteRef.current.note.trim()

              if (!title) {
                toast.error('Başlık zorunlu')
                return
              }
              if (noteMode === 'soap') {
                if (!soapSectionsHaveContent(soap)) {
                  toast.error('En az bir SOAP alanı doldurun')
                  return
                }
              } else if (!note) {
                toast.error('Başlık ve not zorunlu')
                return
              }

              withTransition(async () => {
                const result = await addPatientNote({ patientId, title, note })
                if (!result.ok) {
                  toast.error(result.error)
                  return
                }
                toast.success(noteMode === 'soap' ? 'SOAP notu eklendi' : 'Not eklendi')
                noteRef.current = { title: '', note: '' }
                setSoap(emptySoapSections())
                setNoteMode('free')
                setOpen(null)
                router.refresh()
              })
            }}
          >
            <Field label="Başlık *">
              <Input
                key={`note-title-${noteMode}`}
                defaultValue={noteMode === 'soap' ? noteRef.current.title || defaultSoapNoteTitle() : noteRef.current.title}
                onChange={(e) => (noteRef.current.title = e.target.value)}
              />
            </Field>
            {noteMode === 'soap' ? (
              <>
                <Field label="S — Öznel (Subjective)">
                  <Textarea
                    rows={2}
                    placeholder="Hasta şikayeti, öykü…"
                    value={soap.subjective}
                    onChange={(e) => setSoap((s) => ({ ...s, subjective: e.target.value }))}
                  />
                </Field>
                <Field label="O — Nesnel (Objective)">
                  <Textarea
                    rows={2}
                    placeholder="Muayene bulguları, ölçümler…"
                    value={soap.objective}
                    onChange={(e) => setSoap((s) => ({ ...s, objective: e.target.value }))}
                  />
                </Field>
                <Field label="A — Değerlendirme (Assessment)">
                  <Textarea
                    rows={2}
                    placeholder="Tanı / klinik değerlendirme…"
                    value={soap.assessment}
                    onChange={(e) => setSoap((s) => ({ ...s, assessment: e.target.value }))}
                  />
                </Field>
                <Field label="P — Plan">
                  <Textarea
                    rows={2}
                    placeholder="Tedavi, takip, yönlendirme…"
                    value={soap.plan}
                    onChange={(e) => setSoap((s) => ({ ...s, plan: e.target.value }))}
                  />
                </Field>
              </>
            ) : (
              <Field label="Not *">
                <Textarea
                  rows={5}
                  defaultValue=""
                  onChange={(e) => (noteRef.current.note = e.target.value)}
                />
              </Field>
            )}
            <DialogFooter pending={pending} />
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={open === 'medication'} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>İlaç Ekle</DialogTitle></DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (!medRef.current.name.trim()) { toast.error('İlaç adı zorunlu'); return }
              withTransition(async () => {
                const result = await addMedication({ patientId, ...medRef.current })
                if (!result.ok) { toast.error(result.error); return }
                toast.success('İlaç eklendi')
                medRef.current = { name: '', dosage: '', frequency: '', startDate: '', endDate: '', notes: '' }
                setOpen(null)
                router.refresh()
              })
            }}
          >
            <Field label="İlaç *"><Input onChange={(e) => (medRef.current.name = e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Doz"><Input onChange={(e) => (medRef.current.dosage = e.target.value)} /></Field>
              <Field label="Sıklık"><Input onChange={(e) => (medRef.current.frequency = e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Başlangıç"><Input type="date" onChange={(e) => (medRef.current.startDate = e.target.value)} /></Field>
              <Field label="Bitiş"><Input type="date" onChange={(e) => (medRef.current.endDate = e.target.value)} /></Field>
            </div>
            <DialogFooter pending={pending} />
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={open === 'allergy'} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Alerji Ekle</DialogTitle></DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (!allergyRef.current.name.trim()) { toast.error('Alerjen adı zorunlu'); return }
              withTransition(async () => {
                const result = await addAllergy({ patientId, ...allergyRef.current })
                if (!result.ok) { toast.error(result.error); return }
                toast.success('Alerji eklendi')
                allergyRef.current = { name: '', severity: 'ORTA', reaction: '', notes: '' }
                setOpen(null)
                router.refresh()
              })
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Alerjen *"><Input onChange={(e) => (allergyRef.current.name = e.target.value)} /></Field>
              <Field label="Şiddet">
                <Select defaultValue="ORTA" onValueChange={(v) => (allergyRef.current.severity = v as 'HAFIF' | 'ORTA' | 'SIDDETLI')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HAFIF">Hafif</SelectItem>
                    <SelectItem value="ORTA">Orta</SelectItem>
                    <SelectItem value="SIDDETLI">Şiddetli</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Reaksiyon"><Input onChange={(e) => (allergyRef.current.reaction = e.target.value)} /></Field>
            <DialogFooter pending={pending} />
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={open === 'treatment'} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tedavi Ekle</DialogTitle></DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (!treatmentRef.current.title.trim()) { toast.error('Tedavi adı zorunlu'); return }
              withTransition(async () => {
                const payload = {
                  patientId,
                  ...treatmentRef.current,
                  cost: treatmentRef.current.cost ? Number(treatmentRef.current.cost) : undefined,
                }
                const result = await addTreatment(payload)
                if (!result.ok) { toast.error(result.error); return }
                toast.success('Tedavi eklendi')
                treatmentRef.current = { title: '', description: '', doctorName: '', startDate: '', endDate: '', status: 'PLANLANDI', cost: '', notes: '' }
                setOpen(null)
                router.refresh()
              })
            }}
          >
            <Field label="Tedavi *"><Input onChange={(e) => (treatmentRef.current.title = e.target.value)} /></Field>
            <Field label="Açıklama"><Textarea rows={3} onChange={(e) => (treatmentRef.current.description = e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Hekim"><Input onChange={(e) => (treatmentRef.current.doctorName = e.target.value)} /></Field>
              <Field label="Durum">
                <Select defaultValue="PLANLANDI" onValueChange={(v) => (treatmentRef.current.status = v as typeof treatmentRef.current.status)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANLANDI">Planlandı</SelectItem>
                    <SelectItem value="DEVAM_EDIYOR">Devam ediyor</SelectItem>
                    <SelectItem value="TAMAMLANDI">Tamamlandı</SelectItem>
                    <SelectItem value="IPTAL">İptal</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Başlangıç"><Input type="date" onChange={(e) => (treatmentRef.current.startDate = e.target.value)} /></Field>
              <Field label="Bitiş"><Input type="date" onChange={(e) => (treatmentRef.current.endDate = e.target.value)} /></Field>
            </div>
            <Field label="Ücret (TL)"><Input type="number" min={0} onChange={(e) => (treatmentRef.current.cost = e.target.value)} /></Field>
            <DialogFooter pending={pending} />
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={open === 'lab'} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tahlil Ekle</DialogTitle></DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (!labRef.current.title.trim()) { toast.error('Tahlil adı zorunlu'); return }
              if (!labRef.current.resultDate) { toast.error('Tarih zorunlu'); return }
              withTransition(async () => {
                const result = await addLabResult({ patientId, ...labRef.current })
                if (!result.ok) { toast.error(result.error); return }
                toast.success('Tahlil eklendi')
                labRef.current = { title: '', description: '', resultDate: '', labName: '', notes: '' }
                setOpen(null)
                router.refresh()
              })
            }}
          >
            <Field label="Tahlil *"><Input onChange={(e) => (labRef.current.title = e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tarih *"><Input type="date" onChange={(e) => (labRef.current.resultDate = e.target.value)} /></Field>
              <Field label="Laboratuvar"><Input onChange={(e) => (labRef.current.labName = e.target.value)} /></Field>
            </div>
            <Field label="Sonuç / Açıklama"><Textarea rows={3} onChange={(e) => (labRef.current.description = e.target.value)} /></Field>
            <DialogFooter pending={pending} />
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={open === 'file'} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Dosya Yükle</DialogTitle></DialogHeader>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (!fileRef.current.file) { toast.error('Dosya seçiniz'); return }
              withTransition(async () => {
                try {
                  const uploaded = await uploadPatientFile(fileRef.current.file!, {
                    businessId,
                    patientId,
                  })
                  const result = await addPatientFile({
                    patientId,
                    fileName: uploaded.fileName,
                    fileType: uploaded.fileType,
                    fileSize: uploaded.fileSize,
                    category: fileRef.current.category as 'TAHLIL' | 'GORUNTU' | 'RECETE' | 'RAPOR' | 'KIMLIK' | 'DIGER',
                    storageKey: uploaded.storageKey,
                    fileUrl: uploaded.fileUrl,
                    description: fileRef.current.description || undefined,
                  })
                  if (!result.ok) { toast.error(result.error); return }
                  toast.success('Dosya yüklendi')
                  fileRef.current = { file: null, category: 'DIGER', description: '' }
                  setOpen(null)
                  router.refresh()
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'Yükleme başarısız')
                }
              })
            }}
          >
            <Field label="Dosya *">
              <Input
                type="file"
                onChange={(e) => (fileRef.current.file = e.target.files?.[0] ?? null)}
              />
            </Field>
            <Field label="Kategori">
              <Select defaultValue="DIGER" onValueChange={(v) => (fileRef.current.category = v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TAHLIL">Tahlil</SelectItem>
                  <SelectItem value="GORUNTU">Görüntü</SelectItem>
                  <SelectItem value="RECETE">Reçete</SelectItem>
                  <SelectItem value="RAPOR">Rapor</SelectItem>
                  <SelectItem value="KIMLIK">Kimlik</SelectItem>
                  <SelectItem value="DIGER">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Açıklama"><Textarea rows={2} onChange={(e) => (fileRef.current.description = e.target.value)} /></Field>
            <p className="text-[11px] text-muted-foreground">
              Dosya kaydı, kategori ve önizleme bağlantısı hasta kartına eklenecek.
            </p>
            <DialogFooter pending={pending} />
          </form>
        </DialogContent>
      </Dialog>

      <PrescriptionFormDrawer
        open={open === 'prescription'}
        onOpenChange={(value) => setOpen(value ? 'prescription' : null)}
        patientId={patientId}
        doctors={doctors}
      />
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <AccessibleField label={label} labelClassName="text-xs text-muted-foreground mb-1.5 block">
      {children}
    </AccessibleField>
  )
}

function DialogFooter({ pending }: { pending: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <Button type="submit" disabled={pending} className="bg-brand-teal hover:bg-brand-teal-hover text-white">
        {pending ? 'Kaydediliyor...' : 'Kaydet'}
      </Button>
    </div>
  )
}
