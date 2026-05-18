'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plus, Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { createPatient } from '@/lib/actions/patients'

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
  const [tab, setTab] = useState('kimlik')
  const [pending, startTransition] = useTransition()

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
    setTab('kimlik')
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!identity.fullName.trim()) {
      toast.error('Ad soyad zorunlu')
      setTab('kimlik')
      return
    }
    if (!contact.phone.trim()) {
      toast.error('Telefon zorunlu')
      setTab('iletisim')
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
      toast.success('Hasta kaydı oluşturuldu')
      reset()
      onOpenChange(false)
      router.push(`/dashboard/hastalar/${result.data.id}`)
      router.refresh()
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <form onSubmit={onSubmit} className="flex h-full flex-col">
          <SheetHeader className="border-b px-6 py-5 bg-gradient-to-r from-[#06142A] to-[#0E2D52] text-white">
            <SheetTitle className="text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#12C8AD]" />
              Yeni Hasta Kaydı
            </SheetTitle>
            <SheetDescription className="text-white/60">
              Tüm sekmeleri doldurabilirsiniz; sadece kimlik ve iletişim zorunludur.
            </SheetDescription>
          </SheetHeader>

          <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
            <div className="border-b px-6 pt-3 bg-white sticky top-0 z-10 overflow-x-auto">
              <TabsList className="bg-transparent h-auto p-0 gap-1 inline-flex">
                <TabsTrigger value="kimlik">Kimlik</TabsTrigger>
                <TabsTrigger value="iletisim">İletişim</TabsTrigger>
                <TabsTrigger value="saglik">Sağlık</TabsTrigger>
                <TabsTrigger value="alerji">Alerji</TabsTrigger>
                <TabsTrigger value="ilac">İlaç</TabsTrigger>
                <TabsTrigger value="tedavi">Tedavi</TabsTrigger>
                <TabsTrigger value="tahlil">Tahlil</TabsTrigger>
                <TabsTrigger value="not">Not</TabsTrigger>
                <TabsTrigger value="hikaye">Hikaye</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-[#F7F9FB]">
              <TabsContent value="kimlik" className="m-0 space-y-3">
                <Section title="Kimlik Bilgileri">
                  <Field label="Ad Soyad *">
                    <Input value={identity.fullName} onChange={(e) => setIdentity({ ...identity, fullName: e.target.value })} placeholder="Ahmet Yılmaz" required />
                  </Field>
                  <Field label="TC Kimlik No">
                    <Input value={identity.identityNumber} onChange={(e) => setIdentity({ ...identity, identityNumber: e.target.value.replace(/\D/g, '').slice(0, 11) })} placeholder="11 haneli" inputMode="numeric" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
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
              </TabsContent>

              <TabsContent value="iletisim" className="m-0 space-y-3">
                <Section title="İletişim Bilgileri">
                  <Field label="Telefon *">
                    <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="05XX XXX XX XX" required />
                  </Field>
                  <Field label="E-posta">
                    <Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="ornek@email.com" />
                  </Field>
                  <Field label="Adres">
                    <Textarea value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} placeholder="Mahalle, sokak, no..." rows={2} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Şehir">
                      <Input value={contact.city} onChange={(e) => setContact({ ...contact, city: e.target.value })} placeholder="İstanbul" />
                    </Field>
                    <Field label="Meslek">
                      <Input value={contact.occupation} onChange={(e) => setContact({ ...contact, occupation: e.target.value })} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Acil Durum Kişisi">
                      <Input value={contact.emergencyContactName} onChange={(e) => setContact({ ...contact, emergencyContactName: e.target.value })} />
                    </Field>
                    <Field label="Acil Telefon">
                      <Input value={contact.emergencyContactPhone} onChange={(e) => setContact({ ...contact, emergencyContactPhone: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Sigorta / Sağlık Kurumu">
                    <Input value={contact.insuranceProvider} onChange={(e) => setContact({ ...contact, insuranceProvider: e.target.value })} placeholder="SGK, özel sigorta..." />
                  </Field>
                </Section>
              </TabsContent>

              <TabsContent value="saglik" className="m-0 space-y-3">
                <Section title="Sağlık Bilgileri">
                  <Field label="Kronik Rahatsızlıklar">
                    <Textarea value={health.chronicDiseases} onChange={(e) => setHealth({ ...health, chronicDiseases: e.target.value })} rows={3} placeholder="Diyabet, hipertansiyon..." />
                  </Field>
                  <Field label="Aile Öyküsü">
                    <Textarea value={health.familyHistory} onChange={(e) => setHealth({ ...health, familyHistory: e.target.value })} rows={3} />
                  </Field>
                  <Field label="Etiketler (virgülle ayrılmış)">
                    <Input value={health.tags} onChange={(e) => setHealth({ ...health, tags: e.target.value })} placeholder="VIP, Hamile, Pediatrik" />
                  </Field>
                </Section>
              </TabsContent>

              <TabsContent value="alerji" className="m-0">
                <RepeaterSection
                  title="Alerjiler"
                  items={allergies}
                  empty={emptyAllergy}
                  onChange={setAllergies}
                  render={(item, set, remove, idx) => (
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Alerjen *">
                          <Input value={item.name} onChange={(e) => set({ ...item, name: e.target.value })} placeholder="Penisilin" />
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
                        <Input value={item.reaction} onChange={(e) => set({ ...item, reaction: e.target.value })} placeholder="Kaşıntı, döküntü..." />
                      </Field>
                      <RepeaterFooter index={idx} onRemove={remove} />
                    </div>
                  )}
                />
              </TabsContent>

              <TabsContent value="ilac" className="m-0">
                <RepeaterSection
                  title="Kullandığı İlaçlar"
                  items={medications}
                  empty={emptyMedication}
                  onChange={setMedications}
                  render={(item, set, remove, idx) => (
                    <div className="grid gap-3">
                      <Field label="İlaç Adı *">
                        <Input value={item.name} onChange={(e) => set({ ...item, name: e.target.value })} placeholder="Parol 500 mg" />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Doz"><Input value={item.dosage} onChange={(e) => set({ ...item, dosage: e.target.value })} placeholder="500 mg" /></Field>
                        <Field label="Sıklık"><Input value={item.frequency} onChange={(e) => set({ ...item, frequency: e.target.value })} placeholder="Günde 2 kez" /></Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Başlangıç"><Input type="date" value={item.startDate} onChange={(e) => set({ ...item, startDate: e.target.value })} /></Field>
                        <Field label="Bitiş"><Input type="date" value={item.endDate} onChange={(e) => set({ ...item, endDate: e.target.value })} /></Field>
                      </div>
                      <RepeaterFooter index={idx} onRemove={remove} />
                    </div>
                  )}
                />
              </TabsContent>

              <TabsContent value="tedavi" className="m-0">
                <RepeaterSection
                  title="Tedaviler"
                  items={treatments}
                  empty={emptyTreatment}
                  onChange={setTreatments}
                  render={(item, set, remove, idx) => (
                    <div className="grid gap-3">
                      <Field label="Tedavi Adı *">
                        <Input value={item.title} onChange={(e) => set({ ...item, title: e.target.value })} placeholder="Kanal Tedavisi" />
                      </Field>
                      <Field label="Açıklama">
                        <Textarea value={item.description} onChange={(e) => set({ ...item, description: e.target.value })} rows={2} />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Doktor"><Input value={item.doctorName} onChange={(e) => set({ ...item, doctorName: e.target.value })} /></Field>
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
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Başlangıç"><Input type="date" value={item.startDate} onChange={(e) => set({ ...item, startDate: e.target.value })} /></Field>
                        <Field label="Bitiş"><Input type="date" value={item.endDate} onChange={(e) => set({ ...item, endDate: e.target.value })} /></Field>
                      </div>
                      <Field label="Ücret (TL)">
                        <Input type="number" min={0} value={item.cost} onChange={(e) => set({ ...item, cost: e.target.value })} />
                      </Field>
                      <RepeaterFooter index={idx} onRemove={remove} />
                    </div>
                  )}
                />
              </TabsContent>

              <TabsContent value="tahlil" className="m-0">
                <RepeaterSection
                  title="Tahliller"
                  items={labResults}
                  empty={emptyLab}
                  onChange={setLabResults}
                  render={(item, set, remove, idx) => (
                    <div className="grid gap-3">
                      <Field label="Tahlil Adı *">
                        <Input value={item.title} onChange={(e) => set({ ...item, title: e.target.value })} placeholder="Tam Kan Sayımı" />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
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
              </TabsContent>

              <TabsContent value="not" className="m-0">
                <RepeaterSection
                  title="Doktor Notları"
                  items={notes}
                  empty={emptyNote}
                  onChange={setNotes}
                  render={(item, set, remove, idx) => (
                    <div className="grid gap-3">
                      <Field label="Başlık *">
                        <Input value={item.title} onChange={(e) => set({ ...item, title: e.target.value })} />
                      </Field>
                      <Field label="Not *">
                        <Textarea value={item.note} onChange={(e) => set({ ...item, note: e.target.value })} rows={4} />
                      </Field>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={item.isPinned} onChange={(e) => set({ ...item, isPinned: e.target.checked })} />
                        Üste sabitle
                      </label>
                      <RepeaterFooter index={idx} onRemove={remove} />
                    </div>
                  )}
                />
              </TabsContent>

              <TabsContent value="hikaye" className="m-0 space-y-3">
                <Section title="Hasta Hikayesi">
                  <Field label="Hasta Hikayesi">
                    <Textarea value={health.patientStory} onChange={(e) => setHealth({ ...health, patientStory: e.target.value })} rows={10} placeholder="Anamnez, şikayet öyküsü, geçmiş tedaviler..." />
                  </Field>
                </Section>
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex items-center justify-end gap-2 border-t bg-white px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>İptal</Button>
            <Button type="submit" disabled={pending} className="bg-[#12C8AD] hover:bg-[#10b49c] text-white">
              {pending ? 'Kaydediliyor...' : 'Hasta Kaydet'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-5 space-y-3 shadow-sm">
      <p className="text-sm font-semibold text-[#0C1D36]">{title}</p>
      <div className="grid gap-3">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#0C1D36]">{title}</p>
        <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1">
          <Plus className="h-4 w-4" /> Ekle
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-muted-foreground">
          Bu hasta için kayıt eklemediniz. Daha sonra hasta kartından da ekleyebilirsiniz.
        </div>
      ) : (
        items.map((item, idx) => (
          <div key={idx} className="rounded-2xl border bg-white p-5 shadow-sm">
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
  )
}

function RepeaterFooter({ index, onRemove }: { index: number; onRemove: () => void }) {
  return (
    <div className="flex justify-between items-center pt-2 border-t mt-2">
      <span className="text-[11px] text-muted-foreground">#{index + 1}</span>
      <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-rose-600 hover:text-rose-700 gap-1">
        <Trash2 className="h-3.5 w-3.5" /> Sil
      </Button>
    </div>
  )
}
