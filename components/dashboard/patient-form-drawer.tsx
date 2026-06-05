'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2, UserPlus, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { createPatient } from '@/lib/actions/patients'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 'temel', label: 'Temel Bilgiler', description: 'Kimlik ve İletişim' },
  { id: 'tibbi', label: 'Tıbbi Geçmiş', description: 'Sağlık, Alerji, İlaç' },
  { id: 'klinik', label: 'Klinik Kayıtları', description: 'Tedavi, Tahlil, Not' },
] as const

type AllergyDraft = { name: string; severity: 'HAFIF' | 'ORTA' | 'SIDDETLI'; reaction: string; notes: string }
type MedicationDraft = { name: string; dosage: string; frequency: string; startDate: string; endDate: string; notes: string }
type TreatmentDraft = { title: string; description: string; doctorName: string; startDate: string; endDate: string; status: 'PLANLANDI' | 'DEVAM_EDIYOR' | 'TAMAMLANDI' | 'IPTAL'; cost: string; notes: string }
type LabDraft = { title: string; description: string; resultDate: string; labName: string; notes: string }
type NoteDraft = { title: string; note: string; isPinned: boolean }

const emptyAllergy: AllergyDraft = { name: '', severity: 'ORTA', reaction: '', notes: '' }
const emptyMedication: MedicationDraft = { name: '', dosage: '', frequency: '', startDate: '', endDate: '', notes: '' }
const emptyTreatment: TreatmentDraft = { title: '', description: '', doctorName: '', startDate: '', endDate: '', status: 'PLANLANDI', cost: '', notes: '' }
const emptyLab: LabDraft = { title: '', description: '', resultDate: '', labName: '', notes: '' }
const emptyNote: NoteDraft = { title: '', note: '', isPinned: false }

export function PatientFormDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (next: boolean) => void
}) {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [identity, setIdentity] = useState({
    fullName: '',
    identityNumber: '',
    birthDate: '',
    gender: '',
    bloodType: '',
  })
  const [contact, setContact] = useState({
    phone: '',
    email: '',
    address: '',
    city: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    occupation: '',
    insuranceProvider: '',
  })
  const [health, setHealth] = useState({
    chronicDiseases: '',
    familyHistory: '',
    patientStory: '',
    tags: '',
  })

  const [allergies, setAllergies] = useState<AllergyDraft[]>([])
  const [medications, setMedications] = useState<MedicationDraft[]>([])
  const [treatments, setTreatments] = useState<TreatmentDraft[]>([])
  const [labResults, setLabResults] = useState<LabDraft[]>([])
  const [notes, setNotes] = useState<NoteDraft[]>([])

  function reset() {
    setIdentity({ fullName: '', identityNumber: '', birthDate: '', gender: '', bloodType: '' })
    setContact({ phone: '', email: '', address: '', city: '', emergencyContactName: '', emergencyContactPhone: '', occupation: '', insuranceProvider: '' })
    setHealth({ chronicDiseases: '', familyHistory: '', patientStory: '', tags: '' })
    setAllergies([])
    setMedications([])
    setTreatments([])
    setLabResults([])
    setNotes([])
    setErrors({})
    setStepIndex(0)
  }

  function handleNext() {
    // Step 1 Validation
    if (stepIndex === 0) {
      const nextErrors: Record<string, string> = {}
      if (!identity.fullName.trim()) nextErrors.fullName = 'Zorunlu alan'
      if (!contact.phone.trim()) nextErrors.phone = 'Zorunlu alan'
      
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors)
        toast.error('Lütfen zorunlu alanları doldurun.')
        return
      }
    }
    
    setErrors({})
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))
  }

  function handleBack() {
    setStepIndex((i) => Math.max(0, i - 1))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Final check just in case
    if (!identity.fullName.trim() || !contact.phone.trim()) {
      setStepIndex(0)
      toast.error('Ad Soyad ve Telefon zorunludur.')
      return
    }

    const payload = {
      ...identity,
      ...contact,
      ...health,
      tags: health.tags.split(',').map((t) => t.trim()).filter(Boolean),
      allergies: allergies.filter((a) => a.name.trim()).map((a) => ({
        name: a.name.trim(),
        severity: a.severity,
        reaction: a.reaction.trim() || undefined,
        notes: a.notes.trim() || undefined,
      })),
      medications: medications.filter((m) => m.name.trim()).map((m) => ({
        name: m.name.trim(),
        dosage: m.dosage.trim() || undefined,
        frequency: m.frequency.trim() || undefined,
        startDate: m.startDate || undefined,
        endDate: m.endDate || undefined,
        notes: m.notes.trim() || undefined,
      })),
      treatments: treatments.filter((t) => t.title.trim()).map((t) => ({
        title: t.title.trim(),
        description: t.description.trim() || undefined,
        doctorName: t.doctorName.trim() || undefined,
        startDate: t.startDate || undefined,
        endDate: t.endDate || undefined,
        status: t.status,
        cost: t.cost ? Number(t.cost) : undefined,
        notes: t.notes.trim() || undefined,
      })),
      labResults: labResults.filter((l) => l.title.trim() && l.resultDate).map((l) => ({
        title: l.title.trim(),
        description: l.description.trim() || undefined,
        resultDate: l.resultDate,
        labName: l.labName.trim() || undefined,
        notes: l.notes.trim() || undefined,
      })),
      notes: notes.filter((n) => n.title.trim() && n.note.trim()).map((n) => ({
        title: n.title.trim(),
        note: n.note.trim(),
        isPinned: n.isPinned,
      })),
    }

    startTransition(async () => {
      const result = await createPatient(payload)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Hasta kaydı başarıyla oluşturuldu!')
      reset()
      onOpenChange(false)
      router.push(`/dashboard/hastalar/${result.data.id}`)
      router.refresh()
    })
  }

  const isFirst = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1
  const currentStep = STEPS[stepIndex]

  return (
    <Sheet open={open} onOpenChange={(val) => {
      if (!val) reset()
      onOpenChange(val)
    }}>
      <SheetContent
        side="right"
        className="w-full max-w-full overflow-hidden p-0 sm:max-w-2xl bg-brand-light"
      >
        <div className="flex h-full flex-col">
          {/* Header & Stepper */}
          <SheetHeader className="shrink-0 border-b bg-white px-5 py-5 pt-safe shadow-sm z-10">
            <SheetTitle className="flex items-center gap-2 text-brand-ink text-lg font-bold">
              <UserPlus className="h-5 w-5 text-brand-teal" />
              Yeni Hasta Kaydı
            </SheetTitle>
            
            {/* Visual Stepper */}
            <div className="mt-6 flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-slate-100 -z-10" />
              <div 
                className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-brand-teal transition-all duration-300 -z-10" 
                style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }} 
              />
              
              {STEPS.map((step, idx) => {
                const isActive = idx === stepIndex
                const isPassed = idx < stepIndex
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                      isActive ? "bg-brand-teal text-white ring-4 ring-cyan-50" : 
                      isPassed ? "bg-brand-teal text-white" : "bg-slate-100 text-slate-400"
                    )}>
                      {isPassed ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </div>
                    <span className={cn(
                      "text-[11px] font-semibold hidden sm:block",
                      isActive ? "text-brand-ink" : "text-muted-foreground"
                    )}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
            
            <SheetDescription className="text-center mt-3 text-xs font-medium text-brand-teal">
              Adım {stepIndex + 1}: {currentStep.label} - {currentStep.description}
            </SheetDescription>
          </SheetHeader>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
            
            {/* STEP 1: TEMEL BİLGİLER */}
            <div className={cn("space-y-6 animate-in fade-in slide-in-from-right-4 duration-300", stepIndex !== 0 && "hidden")}>
              <Section title="Kimlik Bilgileri" required>
                <Field label="Ad Soyad *" error={errors.fullName}>
                  <Input
                    value={identity.fullName}
                    onChange={(e) => setIdentity({ ...identity, fullName: e.target.value })}
                    placeholder="Örn: Ahmet Yılmaz"
                    className={errors.fullName ? "border-red-500 ring-red-500" : ""}
                  />
                </Field>
                <Field label="TC Kimlik No">
                  <Input value={identity.identityNumber} onChange={(e) => setIdentity({ ...identity, identityNumber: e.target.value.replace(/\D/g, '').slice(0, 11) })} placeholder="11 haneli" inputMode="numeric" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Doğum Tarihi">
                    <Input type="date" value={identity.birthDate} onChange={(e) => setIdentity({ ...identity, birthDate: e.target.value })} />
                  </Field>
                  <Field label="Cinsiyet">
                    <Select value={identity.gender || undefined} onValueChange={(v) => setIdentity({ ...identity, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kadın">Kadın</SelectItem>
                        <SelectItem value="Erkek">Erkek</SelectItem>
                        <SelectItem value="Diğer">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Kan Grubu">
                  <Select value={identity.bloodType || undefined} onValueChange={(v) => setIdentity({ ...identity, bloodType: v })}>
                    <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                    <SelectContent>
                      {['A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-', '0 Rh+', '0 Rh-'].map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </Section>

              <Section title="İletişim Bilgileri" required>
                <Field label="Telefon Numarası *" error={errors.phone}>
                  <Input
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    placeholder="Örn: 05XX XXX XX XX"
                    className={errors.phone ? "border-red-500 ring-red-500" : ""}
                  />
                </Field>
                <Field label="E-posta Adresi">
                  <Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="ornek@email.com" />
                </Field>
                <Field label="Açık Adres">
                  <Textarea value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} placeholder="Mahalle, sokak, no..." rows={2} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Şehir">
                    <Input value={contact.city} onChange={(e) => setContact({ ...contact, city: e.target.value })} placeholder="İstanbul" />
                  </Field>
                  <Field label="Meslek">
                    <Input value={contact.occupation} onChange={(e) => setContact({ ...contact, occupation: e.target.value })} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Acil Durum Kişisi">
                    <Input value={contact.emergencyContactName} onChange={(e) => setContact({ ...contact, emergencyContactName: e.target.value })} />
                  </Field>
                  <Field label="Acil Telefon">
                    <Input value={contact.emergencyContactPhone} onChange={(e) => setContact({ ...contact, emergencyContactPhone: e.target.value })} />
                  </Field>
                </div>
                <Field label="Sigorta / Kurum">
                  <Input value={contact.insuranceProvider} onChange={(e) => setContact({ ...contact, insuranceProvider: e.target.value })} placeholder="SGK, Özel Sigorta..." />
                </Field>
              </Section>
            </div>

            {/* STEP 2: TIBBİ GEÇMİŞ */}
            <div className={cn("space-y-6 animate-in fade-in slide-in-from-right-4 duration-300", stepIndex !== 1 && "hidden")}>
              <Section title="Sağlık Özeti">
                <Field label="Kronik Rahatsızlıklar">
                  <Textarea value={health.chronicDiseases} onChange={(e) => setHealth({ ...health, chronicDiseases: e.target.value })} rows={2} placeholder="Diyabet, Hipertansiyon, Astım..." />
                </Field>
                <Field label="Aile Öyküsü">
                  <Textarea value={health.familyHistory} onChange={(e) => setHealth({ ...health, familyHistory: e.target.value })} rows={2} />
                </Field>
                <Field label="Etiketler (Virgülle ayırın)">
                  <Input value={health.tags} onChange={(e) => setHealth({ ...health, tags: e.target.value })} placeholder="VIP, Kalp Hastası, Hamile" />
                </Field>
              </Section>

              <RepeaterSection
                title="Alerjiler"
                items={allergies}
                empty={emptyAllergy}
                onChange={setAllergies}
                render={(item, set, remove, idx) => (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Alerjen *">
                        <Input value={item.name} onChange={(e) => set({ ...item, name: e.target.value })} placeholder="Örn: Penisilin" />
                      </Field>
                      <Field label="Şiddet">
                        <Select value={item.severity} onValueChange={(v) => set({ ...item, severity: v as AllergyDraft['severity'] })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HAFIF">Hafif</SelectItem>
                            <SelectItem value="ORTA">Orta</SelectItem>
                            <SelectItem value="SIDDETLI">Şiddetli</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <Field label="Reaksiyon">
                      <Input value={item.reaction} onChange={(e) => set({ ...item, reaction: e.target.value })} placeholder="Döküntü, nefes darlığı..." />
                    </Field>
                    <RepeaterFooter index={idx} onRemove={remove} />
                  </div>
                )}
              />

              <RepeaterSection
                title="Kullandığı İlaçlar"
                items={medications}
                empty={emptyMedication}
                onChange={setMedications}
                render={(item, set, remove, idx) => (
                  <div className="grid gap-4">
                    <Field label="İlaç Adı *">
                      <Input value={item.name} onChange={(e) => set({ ...item, name: e.target.value })} placeholder="Örn: Parol" />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Doz"><Input value={item.dosage} onChange={(e) => set({ ...item, dosage: e.target.value })} placeholder="500 mg" /></Field>
                      <Field label="Sıklık"><Input value={item.frequency} onChange={(e) => set({ ...item, frequency: e.target.value })} placeholder="Günde 2" /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Başlangıç"><Input type="date" value={item.startDate} onChange={(e) => set({ ...item, startDate: e.target.value })} /></Field>
                      <Field label="Bitiş"><Input type="date" value={item.endDate} onChange={(e) => set({ ...item, endDate: e.target.value })} /></Field>
                    </div>
                    <RepeaterFooter index={idx} onRemove={remove} />
                  </div>
                )}
              />
            </div>

            {/* STEP 3: KLİNİK KAYITLARI */}
            <div className={cn("space-y-6 animate-in fade-in slide-in-from-right-4 duration-300", stepIndex !== 2 && "hidden")}>
              
              <Section title="Detaylı Hikaye (Anamnez)">
                <Field label="Hasta Hikayesi">
                  <Textarea value={health.patientStory} onChange={(e) => setHealth({ ...health, patientStory: e.target.value })} rows={4} placeholder="Şikayet öyküsü, geçmiş tedaviler, önemli notlar..." />
                </Field>
              </Section>

              <RepeaterSection
                title="Geçmiş / Planlanan Tedaviler"
                items={treatments}
                empty={emptyTreatment}
                onChange={setTreatments}
                render={(item, set, remove, idx) => (
                  <div className="grid gap-4">
                    <Field label="Tedavi Adı *">
                      <Input value={item.title} onChange={(e) => set({ ...item, title: e.target.value })} placeholder="Örn: Kanal Tedavisi" />
                    </Field>
                    <Field label="Detay / Not">
                      <Textarea value={item.description} onChange={(e) => set({ ...item, description: e.target.value })} rows={2} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="İlgili Doktor"><Input value={item.doctorName} onChange={(e) => set({ ...item, doctorName: e.target.value })} /></Field>
                      <Field label="Durum">
                        <Select value={item.status} onValueChange={(v) => set({ ...item, status: v as TreatmentDraft['status'] })}>
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
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Tarih"><Input type="date" value={item.startDate} onChange={(e) => set({ ...item, startDate: e.target.value })} /></Field>
                      <Field label="Maliyet (TL)">
                        <Input type="number" min={0} value={item.cost} onChange={(e) => set({ ...item, cost: e.target.value })} />
                      </Field>
                    </div>
                    <RepeaterFooter index={idx} onRemove={remove} />
                  </div>
                )}
              />

              <RepeaterSection
                title="Tahlil Sonuçları"
                items={labResults}
                empty={emptyLab}
                onChange={setLabResults}
                render={(item, set, remove, idx) => (
                  <div className="grid gap-4">
                    <Field label="Tahlil Adı *">
                      <Input value={item.title} onChange={(e) => set({ ...item, title: e.target.value })} placeholder="Örn: Tam Kan Sayımı" />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Tarih *"><Input type="date" value={item.resultDate} onChange={(e) => set({ ...item, resultDate: e.target.value })} /></Field>
                      <Field label="Laboratuvar"><Input value={item.labName} onChange={(e) => set({ ...item, labName: e.target.value })} /></Field>
                    </div>
                    <Field label="Açıklama / Sonuç">
                      <Textarea value={item.description} onChange={(e) => set({ ...item, description: e.target.value })} rows={2} />
                    </Field>
                    <RepeaterFooter index={idx} onRemove={remove} />
                  </div>
                )}
              />

              <RepeaterSection
                title="Doktor Notları"
                items={notes}
                empty={emptyNote}
                onChange={setNotes}
                render={(item, set, remove, idx) => (
                  <div className="grid gap-4">
                    <Field label="Başlık *">
                      <Input value={item.title} onChange={(e) => set({ ...item, title: e.target.value })} placeholder="Örn: Muayene Notu" />
                    </Field>
                    <Field label="Not *">
                      <Textarea value={item.note} onChange={(e) => set({ ...item, note: e.target.value })} rows={3} />
                    </Field>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        id={`note-pinned-${idx}`}
                        name={`notes[${idx}].isPinned`}
                        type="checkbox"
                        checked={item.isPinned}
                        onChange={(e) => set({ ...item, isPinned: e.target.checked })}
                        className="rounded text-brand-teal focus:ring-brand-teal"
                      />
                      Bu notu hasta profilinde üste sabitle
                    </label>
                    <RepeaterFooter index={idx} onRemove={remove} />
                  </div>
                )}
              />
            </div>
            
          </div>

          {/* Sticky Footer for Navigation */}
          <div className="shrink-0 border-t bg-white px-5 py-4 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.02)] z-10">
            <div className="flex items-center justify-between gap-3 max-w-full">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isFirst}
                onClick={handleBack}
                className={cn("h-12 w-1/3 rounded-xl font-semibold", isFirst && "opacity-0 pointer-events-none")}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Geri
              </Button>
              
              {!isLast ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={handleNext}
                  className="h-12 flex-1 rounded-xl bg-brand-teal text-white hover:bg-brand-teal-hover font-semibold"
                >
                  Sonraki Adım <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={onSubmit}
                  size="lg"
                  disabled={pending}
                  className="h-12 flex-1 rounded-xl bg-brand-teal text-white hover:bg-brand-teal-hover font-semibold"
                >
                  {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  {pending ? 'Kaydediliyor...' : 'Hastayı Kaydet'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function Section({ title, required, children }: { title: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-brand-ink">{title}</h3>
        {required && <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">Zorunlu</span>}
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-semibold text-slate-500 mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-[11px] font-medium text-rose-500">{error}</p>}
    </div>
  )
}

function RepeaterSection<T>({
  title,
  items,
  empty,
  onChange,
  render,
}: {
  title: string
  items: T[]
  empty: T
  onChange: (next: T[]) => void
  render: (item: T, set: (next: T) => void, remove: () => void, index: number) => React.ReactNode
}) {
  function add() {
    onChange([...items, { ...empty }])
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-brand-ink">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={add} className="h-8 px-2 text-brand-teal hover:bg-cyan-50">
          <Plus className="h-4 w-4 mr-1" /> Ekle
        </Button>
      </div>
      <div className="p-4 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <p className="text-sm text-slate-500 font-medium">Bu bölüm için kayıt eklemediniz.</p>
            <p className="text-xs text-slate-400 mt-1">Daha sonra hasta profilinden de ekleyebilirsiniz.</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm relative">
              {render(
                item,
                (next) => {
                  const copy = [...items]
                  copy[idx] = next
                  onChange(copy)
                },
                () => onChange(items.filter((_, i) => i !== idx)),
                idx
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function RepeaterFooter({ index, onRemove }: { index: number; onRemove: () => void }) {
  return (
    <div className="flex justify-between items-center pt-3 mt-1 border-t border-slate-100">
      <span className="text-[11px] font-medium text-slate-400">Kayıt #{index + 1}</span>
      <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="h-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2">
        <Trash2 className="h-3.5 w-3.5 mr-1" /> Sil
      </Button>
    </div>
  )
}
