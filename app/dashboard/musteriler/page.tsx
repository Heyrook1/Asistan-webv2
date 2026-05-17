'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertTriangle,
  CalendarDays,
  CircleCheck,
  FileText,
  FlaskConical,
  FolderOpen,
  HeartPulse,
  Info,
  Mail,
  MapPin,
  NotepadText,
  Pencil,
  Phone,
  Pill,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Stethoscope,
  Trash2,
  UploadCloud,
  User,
  X,
  Image,
} from 'lucide-react'

type Patient = {
  id: string
  patientNumber: string
  fullName: string
  phone: string
  email?: string | null
  identityNumber?: string | null
  tags: string[]
  allergies?: string | null
  chronicDiseases?: string | null
}

type PatientDetail = Patient & {
  appointments: any[]
  notes: any[]
  medications: any[]
  treatments: any[]
  labResults: any[]
  files: any[]
  timeline: any[]
}

type PatientForm = {
  patientNumber: string
  fullName: string
  phone: string
  email: string
  identityNumber: string
  tags: string
}

const emptyForm: PatientForm = {
  patientNumber: '',
  fullName: '',
  phone: '',
  email: '',
  identityNumber: '',
  tags: '',
}

const demoPatient: Patient = {
  id: 'demo-patient-1',
  patientNumber: 'HST-1024',
  fullName: 'Ayse Yilmaz',
  phone: '0532 145 65 67',
  email: 'ayse.yilmaz@email.com',
  identityNumber: '1000001024',
  tags: ['Aktif Hasta'],
  allergies: 'Penisilin, Polen',
  chronicDiseases: 'Hipertansiyon',
}

const demoDetail: PatientDetail = {
  ...demoPatient,
  appointments: [{ id: 'a1', title: 'Kontrol muayenesi', description: '12 Mayis 2026' }],
  notes: [{ id: 'n1', title: 'AI notu', description: 'Tansiyon degerleri takip edilmeli.' }],
  medications: [
    { id: 'm1', name: 'Amlodipin 5 mg', description: 'Gunde 1 kez' },
    { id: 'm2', name: 'Parol 500 mg', description: 'Gerektiginde' },
    { id: 'm3', name: 'D Vitamini 1000 IU', description: 'Gunde 1 kez' },
  ],
  treatments: [
    { id: 't1', title: 'Tansiyon olcumu', status: 'Aktif' },
    { id: 't2', title: 'Kontrol randevusu', status: 'Planlandi' },
    { id: 't3', title: 'Kan tahlili', status: 'Bekliyor' },
  ],
  labResults: [
    { id: 'l1', title: 'Kan Tahlili.pdf', description: '12.05.2026' },
    { id: 'l2', title: 'Biyokimya Sonuclari.pdf', description: '05.05.2026' },
    { id: 'l3', title: 'EKG Raporu.pdf', description: '22.04.2026' },
  ],
  files: [
    { id: 'f1', fileName: 'Rontgen Goruntusu', description: '12.05.2026' },
    { id: 'f2', fileName: 'Ultrason Raporu', description: '05.05.2026' },
    { id: 'f3', fileName: 'Recete Fotografi', description: '22.04.2026' },
  ],
  timeline: [
    { id: 'h1', title: 'Bugun', description: 'AI notu: Tansiyon degerleri takip edilmeli.' },
    { id: 'h2', title: '12 Mayis', description: 'Kontrol muayenesi tamamlandi.' },
    { id: 'h3', title: '05 Mayis', description: 'Kan tahlili yuklendi.' },
    { id: 'h4', title: '22 Nisan', description: 'Yeni ilac eklendi: Amlodipin 5 mg.' },
  ],
}

async function parseApi(res: Response) {
  const raw = await res.text()
  let json: any = null
  try {
    json = raw ? JSON.parse(raw) : null
  } catch {
    json = null
  }
  return { raw, json }
}

function rowClass(isSelected: boolean) {
  return isSelected
    ? 'cursor-pointer border-l-4 border-l-[#12C8AD] bg-[#ECFCF8] transition-colors'
    : 'cursor-pointer transition-colors hover:bg-[#F6FAFB]'
}

export default function MusterilerPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [inlineEdit, setInlineEdit] = useState(false)
  const [editDraft, setEditDraft] = useState<PatientForm>(emptyForm)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<PatientForm>(emptyForm)
  const [detail, setDetail] = useState<PatientDetail | null>(null)

  const selectedPatient = useMemo(() => patients.find((p) => p.id === selectedId) || null, [patients, selectedId])

  const canCreate = useMemo(
    () => createForm.patientNumber.trim().length > 0 && createForm.fullName.trim().length > 1 && createForm.phone.trim().length > 7,
    [createForm]
  )
  const canUpdate = useMemo(
    () => !!selectedPatient && inlineEdit && editDraft.fullName.trim().length > 1 && editDraft.phone.trim().length > 7,
    [selectedPatient, inlineEdit, editDraft]
  )

  function toForm(patient: Patient): PatientForm {
    return {
      patientNumber: patient.patientNumber || '',
      fullName: patient.fullName || '',
      phone: patient.phone || '',
      email: patient.email || '',
      identityNumber: patient.identityNumber || '',
      tags: (patient.tags || []).join(', '),
    }
  }

  async function loadPatients(q = '') {
    setLoading(true)
    try {
      const res = await fetch(`/api/patients${q ? `?q=${encodeURIComponent(q)}` : ''}`)
      const { raw, json } = await parseApi(res)
      if (!res.ok) throw new Error((json && json.error) || raw || `HTTP ${res.status}`)
      if (!json || !Array.isArray(json.data)) throw new Error('Hasta listesi formati gecersiz.')
      setPatients(json.data.length ? json.data : [demoPatient])
    } catch (e: any) {
      setPatients([demoPatient])
      toast.error(e.message || 'Hasta listesi yuklenemedi')
    } finally {
      setLoading(false)
    }
  }

  async function loadDetail(id: string) {
    if (id === demoPatient.id) {
      setDetail(demoDetail)
      return
    }
    try {
      const res = await fetch(`/api/patients/${id}`)
      const { raw, json } = await parseApi(res)
      if (!res.ok) throw new Error((json && json.error) || raw || `HTTP ${res.status}`)
      if (!json || !json.data) throw new Error('Hasta karti formati gecersiz.')
      setDetail(json.data)
    } catch (e: any) {
      toast.error(e.message || 'Hasta karti acilamadi')
    }
  }

  useEffect(() => {
    void loadPatients()
  }, [])

  async function createPatient(e: React.FormEvent) {
    e.preventDefault()
    if (!canCreate) return
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          tags: createForm.tags ? createForm.tags.split(',').map((x) => x.trim()).filter(Boolean) : [],
        }),
      })
      const { raw, json } = await parseApi(res)
      if (!res.ok) throw new Error((json && json.error) || raw || `HTTP ${res.status}`)
      toast.success('Kayit eklendi')
      setCreateOpen(false)
      setCreateForm(emptyForm)
      await loadPatients(query)
      if (json?.data?.id) {
        setSelectedId(json.data.id)
        await loadDetail(json.data.id)
      }
    } catch (e: any) {
      setPatients((prev) => (prev.some((x) => x.id === demoPatient.id) ? prev : [demoPatient, ...prev]))
      setSelectedId(demoPatient.id)
      setDetail(demoDetail)
      toast.error((e.message || 'Kayit eklenemedi') + ' Demo hasta karti eklendi.')
    }
  }

  function startEdit() {
    if (!selectedPatient) return toast.error('Duzenlemek icin bir kayit secin')
    setEditDraft(toForm(selectedPatient))
    setInlineEdit(true)
  }

  async function updateSelected() {
    if (!selectedPatient) return toast.error('Guncellemek icin bir kayit secin')
    if (!canUpdate) return toast.error('Guncelleme icin ad soyad ve telefon alanlarini kontrol edin')
    try {
      const res = await fetch(`/api/patients/${selectedPatient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editDraft.fullName.trim(),
          phone: editDraft.phone.trim(),
          email: editDraft.email.trim(),
          identityNumber: editDraft.identityNumber.trim(),
          tags: editDraft.tags ? editDraft.tags.split(',').map((x) => x.trim()).filter(Boolean) : [],
        }),
      })
      const { raw, json } = await parseApi(res)
      if (!res.ok) throw new Error((json && json.error) || raw || `HTTP ${res.status}`)
      toast.success('Kayit guncellendi')
      setInlineEdit(false)
      setEditDraft(emptyForm)
      await loadPatients(query)
      if (selectedPatient.id) await loadDetail(selectedPatient.id)
    } catch (e: any) {
      toast.error(e.message || 'Kayit guncellenemedi')
    }
  }

  async function deleteSelected() {
    if (!selectedPatient) return toast.error('Silmek icin bir kayit secin')
    try {
      const res = await fetch(`/api/patients/${selectedPatient.id}`, { method: 'DELETE' })
      const { raw, json } = await parseApi(res)
      if (!res.ok) throw new Error((json && json.error) || raw || `HTTP ${res.status}`)
      toast.success('Kayit silindi')
      setSelectedId(null)
      setInlineEdit(false)
      setEditDraft(emptyForm)
      setDetail(null)
      await loadPatients(query)
    } catch (e: any) {
      toast.error(e.message || 'Kayit silinemedi')
    }
  }

  function openInlineEditFromDetail() {
    if (!detail) return
    setSelectedId(detail.id)
    setEditDraft(toForm(detail))
    setInlineEdit(true)
    toast.info('Liste satirinda duzenleme modu acildi')
  }

  async function quickAdd(path: 'appointments' | 'notes' | 'files', body: Record<string, unknown>, success: string): Promise<void> {
    if (!detail || detail.id === demoPatient.id) {
      toast.info('Demo kartta sadece onizleme var')
      return
    }
    try {
      const res = await fetch(`/api/patients/${detail.id}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const { raw, json } = await parseApi(res)
      if (!res.ok) throw new Error((json && json.error) || raw || `HTTP ${res.status}`)
      toast.success(success)
      await loadDetail(detail.id)
      await loadPatients(query)
    } catch (e: any) {
      toast.error(e.message || 'Islem basarisiz')
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-[#DDE8EC] shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-[28px] text-[#0D1B3D]">Hastalar</CardTitle>
              <p className="text-sm text-[#6B778A]">Modern hasta listeleme tablosu</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setCreateOpen(true)} className="bg-[#13BCA4] text-white hover:bg-[#0FA892]"><Plus className="h-4 w-4" />Kayit Ekle</Button>
              <Button variant="outline" onClick={startEdit} disabled={!selectedPatient}><Pencil className="h-4 w-4" />Kayit Duzenle</Button>
              <Button variant="outline" onClick={updateSelected} disabled={!selectedPatient}><RefreshCw className="h-4 w-4" />Kayit Guncelle</Button>
              <Button variant="destructive" onClick={deleteSelected} disabled={!selectedPatient}><Trash2 className="h-4 w-4" />Kayit Sil</Button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7D8A9E]" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Hasta, rapor, ilac veya dosya ara..." className="pl-9" />
            </div>
            <Button variant="outline" onClick={() => loadPatients(query)}>Ara</Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-hidden rounded-xl border border-[#DDE8EC]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F6FAFB] hover:bg-[#F6FAFB]">
                  <TableHead>Hasta No</TableHead><TableHead>Ad Soyad</TableHead><TableHead>Telefon</TableHead><TableHead>E-posta</TableHead><TableHead>Kimlik No</TableHead><TableHead>Etiket</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="h-20 text-center text-sm text-[#6B778A]">Yukleniyor...</TableCell></TableRow>
                ) : patients.map((patient) => {
                  const isSelected = patient.id === selectedId
                  const showDraft = isSelected && inlineEdit
                  return (
                    <TableRow key={patient.id} className={rowClass(isSelected)} onClick={() => setSelectedId(patient.id)} onDoubleClick={() => loadDetail(patient.id)}>
                      <TableCell className="font-medium">#{showDraft ? editDraft.patientNumber : patient.patientNumber}</TableCell>
                      <TableCell>{showDraft ? <Input value={editDraft.fullName} onChange={(e) => setEditDraft((p) => ({ ...p, fullName: e.target.value }))} className="h-8" /> : patient.fullName}</TableCell>
                      <TableCell>{showDraft ? <Input value={editDraft.phone} onChange={(e) => setEditDraft((p) => ({ ...p, phone: e.target.value }))} className="h-8" /> : patient.phone}</TableCell>
                      <TableCell>{showDraft ? <Input value={editDraft.email} onChange={(e) => setEditDraft((p) => ({ ...p, email: e.target.value }))} className="h-8" /> : patient.email || '-'}</TableCell>
                      <TableCell>{showDraft ? <Input value={editDraft.identityNumber} onChange={(e) => setEditDraft((p) => ({ ...p, identityNumber: e.target.value }))} className="h-8" /> : patient.identityNumber || '-'}</TableCell>
                      <TableCell>{showDraft ? <Input value={editDraft.tags} onChange={(e) => setEditDraft((p) => ({ ...p, tags: e.target.value }))} className="h-8" /> : <Badge variant="secondary">{patient.tags?.[0] || '-'}</Badge>}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 text-xs text-[#7E8A9C]">Hasta karti icin satira cift tiklayin.</p>
        </CardContent>
      </Card>

      {detail ? (
        <Card className="border-[#DDE8EC] bg-white shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[40px] font-semibold leading-none text-[#0D1B3D]">Hasta Karti</h2>
                <p className="mt-2 text-sm text-[#6B778A]">Hastanin tum klinik gecmisi, ilaclari, notlari ve dosyalari tek ekranda.</p>
              </div>
              <Button variant="outline" size="icon" onClick={() => setDetail(null)} aria-label="Listeye don"><X className="h-4 w-4" /></Button>
            </div>

            <Card className="border-[#DDE8EC]">
              <CardContent className="p-4">
                <div className="grid gap-3 xl:grid-cols-[2.1fr_1.2fr]">
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="grid h-20 w-20 place-items-center rounded-full bg-[#14BCA5] text-4xl font-semibold text-white">{detail.fullName.slice(0, 2).toUpperCase()}</div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-[34px] font-semibold leading-none text-[#0D1B3D]">{detail.fullName}</p>
                          <Badge className="bg-[#E8FBF7] text-[#139C86] hover:bg-[#E8FBF7]"><CircleCheck className="mr-1 h-3.5 w-3.5" />Aktif Hasta</Badge>
                        </div>
                        <p className="mt-2 text-base font-semibold text-[#1C84DF]">#{detail.patientNumber}</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          <StatMini label="Yas" value="34" />
                          <StatMini label="Cinsiyet" value="Kadin" />
                          <StatMini label="Kan Grubu" value="A Rh+" />
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-3">
                      <InfoChip icon={<Phone className="h-4 w-4" />} text={detail.phone} />
                      <InfoChip icon={<Mail className="h-4 w-4" />} text={detail.email || '-'} />
                      <InfoChip icon={<MapPin className="h-4 w-4" />} text="Lefkosa, KKTC" />
                    </div>
                    <InfoChip icon={<User className="h-4 w-4" />} text={`Acil iletisim: Mehmet Yilmaz — ${detail.phone}`} />
                  </div>

                  <div className="space-y-2">
                    <RiskCard icon={<AlertTriangle className="h-4 w-4 text-[#E69A00]" />} title="Alerjiler" text={detail.allergies || '-'} color="amber" />
                    <RiskCard icon={<HeartPulse className="h-4 w-4 text-[#1E76D6]" />} title="Kronik Durum" text={detail.chronicDiseases || '-'} color="blue" />
                    <RiskCard icon={<Info className="h-4 w-4 text-[#1E76D6]" />} title="Risk Notu" text="Duzenli tansiyon takibi onerilir" color="blue" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ActionBtn
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Randevu Olustur"
                    primary
                    onClick={() =>
                      quickAdd(
                        'appointments',
                        {
                          serviceId: 'GENEL',
                          staffId: 'DOKTOR',
                          date: new Date().toISOString(),
                          startTime: '10:00',
                          endTime: '10:30',
                          status: 'scheduled',
                        },
                        'Randevu olusturuldu'
                      )
                    }
                  />
                  <ActionBtn
                    icon={<NotepadText className="h-4 w-4" />}
                    label="Not Ekle"
                    onClick={() => quickAdd('notes', { title: 'Klinik Not', note: 'Hizli not eklendi', createdBy: 'Doktor' }, 'Not eklendi')}
                  />
                  <ActionBtn
                    icon={<UploadCloud className="h-4 w-4" />}
                    label="Dosya Yukle"
                    onClick={() =>
                      quickAdd(
                        'files',
                        { fileName: 'ornek-rapor.pdf', fileType: 'application/pdf', category: 'rapor', fileUrl: 'storage://pending/ornek-rapor.pdf' },
                        'Dosya kaydedildi'
                      )
                    }
                  />
                  <ActionBtn icon={<FileText className="h-4 w-4" />} label="PDF Rapor Olustur" onClick={() => window.print()} />
                </div>
              </CardContent>
            </Card>

            <div className="border-b border-[#E1EAF0] pb-2">
              <div className="flex flex-wrap gap-1">
                {['Genel Bilgi', 'Klinik Gecmis', 'Ilaclar', 'Tedaviler', 'Tahliller', 'Goruntuler', 'Dosyalar', 'Notlar'].map((t, i) => (
                  <button key={t} className={`rounded px-3 py-1.5 text-sm font-medium ${i === 0 ? 'bg-[#E8FBF7] text-[#129C87]' : 'text-[#33425B] hover:bg-[#F4F8FA]'}`}>{t}</button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-[1.25fr_1.9fr_1.45fr]">
              <div className="space-y-3">
                <DataCard title="Hasta Ozeti" icon={<Info className="h-4 w-4" />} onEdit={openInlineEditFromDetail} rows={[
                  ['Son Ziyaret', '12 Mayis 2026'], ['Son Tani', 'Kontrol Muayenesi'], ['Devam Eden Tedavi', 'Tansiyon takibi'], ['Doktor', 'Dr. Mehmet Yildiz'], ['Not', 'Hasta son haftalarda bas agrisi ve yorgunluk bildirdi.'],
                ]} />
                <DataCard title="Tedavi Plani" icon={<Stethoscope className="h-4 w-4" />} onEdit={openInlineEditFromDetail} rows={[
                  ['Tansiyon olcumu', 'Her gun'], ['Kontrol randevusu', '2 hafta icinde'], ['Kan tahlili', 'Bekliyor'], ['Diyet ve egzersiz onerisi', 'Aktif'],
                ]} />
              </div>

              <div className="space-y-3">
                <MedCard items={detail.medications} onEdit={openInlineEditFromDetail} />
                <LabCard items={detail.labResults} onEdit={openInlineEditFromDetail} />
                <FileGallery items={detail.files} />
              </div>

              <div className="space-y-3">
                <TimelineCard items={detail.timeline} onEdit={openInlineEditFromDetail} />
                <SuggestionsCard onEdit={openInlineEditFromDetail} />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Kayit Ekle</DialogTitle><DialogDescription>Yeni hasta kaydini olusturun.</DialogDescription></DialogHeader>
          <form className="grid gap-3" onSubmit={createPatient}>
            <Input required placeholder="Hasta Numarasi" value={createForm.patientNumber} onChange={(e) => setCreateForm((p) => ({ ...p, patientNumber: e.target.value }))} />
            <Input required placeholder="Ad Soyad" value={createForm.fullName} onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))} />
            <Input required placeholder="Telefon" value={createForm.phone} onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))} />
            <Input placeholder="E-posta" value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} />
            <Input placeholder="Kimlik No" value={createForm.identityNumber} onChange={(e) => setCreateForm((p) => ({ ...p, identityNumber: e.target.value }))} />
            <Input placeholder="Etiketler (virgul)" value={createForm.tags} onChange={(e) => setCreateForm((p) => ({ ...p, tags: e.target.value }))} />
            <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Vazgec</Button><Button type="submit" disabled={!canCreate} className="bg-[#13BCA4] text-white hover:bg-[#0FA892]">Kaydet</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatMini({ label, value }: { label: string; value: string }) {
  return <div className="rounded border border-[#E3ECF1] px-2 py-1"><p className="text-[11px] text-[#7D8A9E]">{label}</p><p className="text-sm font-semibold text-[#253654]">{value}</p></div>
}

function InfoChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded border border-[#E3ECF1] px-3 py-2 text-sm text-[#243552]">
      <span className="text-[#6E7E93]">{icon}</span>
      <span className="truncate">{text}</span>
      <Pencil className="ml-auto h-3.5 w-3.5 text-[#9AA9BB]" />
    </div>
  )
}

function RiskCard({ icon, title, text, color }: { icon: React.ReactNode; title: string; text: string; color: 'amber' | 'blue' }) {
  const cls = color === 'amber' ? 'border-[#F2C37B] bg-[#FFF9EF]' : 'border-[#7CB2EB] bg-[#F4F9FF]'
  return <div className={`rounded-lg border p-3 ${cls}`}><p className="flex items-center gap-2 text-xs font-semibold text-[#1E2D47]">{icon}{title}</p><p className="mt-1 text-xs text-[#4A5A73]">{text}</p></div>
}

function ActionBtn({ icon, label, primary, onClick }: { icon: React.ReactNode; label: string; primary?: boolean; onClick?: () => void | Promise<void> }) {
  return <Button onClick={onClick} className={primary ? 'bg-[#12B59E] text-white hover:bg-[#0FA08B]' : 'border border-[#D8E4EC] bg-white text-[#2D3C56] hover:bg-[#F5FAFC]'}>{icon}{label}</Button>
}

function DataCard({ title, icon, rows, onEdit }: { title: string; icon: React.ReactNode; rows: [string, string][]; onEdit?: () => void }) {
  return (
    <Card className="border-[#DDE8EC]"><CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-lg text-[#182A47]">{title}<button onClick={onEdit} className="flex items-center gap-2 text-[#7B8AA0] hover:text-[#3D557A]">{icon}<Pencil className="h-3.5 w-3.5" /></button></CardTitle></CardHeader>
      <CardContent className="space-y-2 pt-0">
        {rows.map(([k, v]) => <div key={k} className="grid grid-cols-[1.2fr_1.6fr] gap-2 text-sm"><p className="text-[#6D7D93]">{k}</p><p className="text-[#2C3E5A]">{v}</p></div>)}
      </CardContent>
    </Card>
  )
}

function MedCard({ items, onEdit }: { items: any[]; onEdit?: () => void }) {
  return (
    <Card className="border-[#DDE8EC]">
      <CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-lg text-[#182A47]">Kullandigi Ilaclar <button onClick={onEdit} className="flex items-center gap-2 text-[#7B8AA0] hover:text-[#3D557A]"><Pill className="h-4 w-4" /><Pencil className="h-3.5 w-3.5" /></button></CardTitle></CardHeader>
      <CardContent className="space-y-2 pt-0">
        {items.map((m) => <div key={m.id} className="grid grid-cols-[1.8fr_1fr_auto] items-center rounded border border-[#E3ECF1] px-3 py-2 text-sm"><p className="font-medium text-[#243552]">{m.name || m.title}</p><p className="text-[#6D7D93]">{m.description || '-'}</p><Badge className="bg-[#E8FBF7] text-[#119A84] hover:bg-[#E8FBF7]">Aktif</Badge></div>)}
      </CardContent>
    </Card>
  )
}

function LabCard({ items, onEdit }: { items: any[]; onEdit?: () => void }) {
  function downloadItem(name: string) {
    const blob = new Blob([`Rapor: ${name}`], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name.replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <Card className="border-[#DDE8EC]">
      <CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-lg text-[#182A47]">Tahliller ve Raporlar <button onClick={onEdit} className="flex items-center gap-2 text-[#7B8AA0] hover:text-[#3D557A]"><FlaskConical className="h-4 w-4" /><Pencil className="h-3.5 w-3.5" /></button></CardTitle></CardHeader>
      <CardContent className="space-y-2 pt-0">
        {items.map((x) => <div key={x.id} className="grid grid-cols-[1.6fr_1fr_auto] items-center rounded border border-[#E3ECF1] px-3 py-2 text-sm"><p className="text-[#243552]">{x.title}</p><p className="text-[#6D7D93]">{x.description || '-'}</p><div className="flex gap-1 text-[#6D7D93]"><button onClick={() => toast.info(`Onizleme: ${x.title}`)} className="rounded p-1 hover:bg-[#EEF4F8]"><Info className="h-3.5 w-3.5" /></button><button onClick={() => downloadItem(x.title)} className="rounded p-1 hover:bg-[#EEF4F8]"><DownloadIcon /></button></div></div>)}
        <div className="grid grid-cols-2 gap-2 pt-1"><Button variant="outline">PDF Goruntule</Button><Button className="bg-[#2B7DE0] text-white hover:bg-[#236fca]">Yeni Rapor Yukle</Button></div>
      </CardContent>
    </Card>
  )
}

function TimelineCard({ items, onEdit }: { items: any[]; onEdit?: () => void }) {
  return (
    <Card className="border-[#DDE8EC]">
      <CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-lg text-[#182A47]">Hasta Hikayesi <button onClick={onEdit}><Pencil className="h-3.5 w-3.5 text-[#7B8AA0] hover:text-[#3D557A]" /></button></CardTitle></CardHeader>
      <CardContent className="space-y-3 pt-0">
        {items.map((x, i) => <div key={x.id} className="flex gap-2"><div className={`mt-1 grid h-8 w-8 place-items-center rounded-full text-white ${i === 0 ? 'bg-[#16B29B]' : i === 1 ? 'bg-[#2A80E0]' : i === 2 ? 'bg-[#3E8FF2]' : 'bg-[#8B63E5]'}`}><CalendarDays className="h-4 w-4" /></div><div><p className="text-sm font-semibold text-[#253654]">{x.title}</p><p className="text-sm text-[#4E5F78]">{x.description}</p></div></div>)}
      </CardContent>
    </Card>
  )
}

function SuggestionsCard({ onEdit }: { onEdit?: () => void }) {
  const rows = ['Son 3 olcumde tansiyon yuksek gorunuyor.', '2 hafta icinde kontrol randevusu onerilir.', 'Penisilin alerjisi nedeniyle recete kontrolu yapilmali.']
  return (
    <Card className="border-[#DDE8EC]">
      <CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-lg text-[#182A47]">AI Klinik Onerileri <button onClick={onEdit}><Pencil className="h-3.5 w-3.5 text-[#7B8AA0] hover:text-[#3D557A]" /></button></CardTitle></CardHeader>
      <CardContent className="space-y-2 pt-0">
        {rows.map((r) => <button key={r} onClick={() => toast.info(r)} className="w-full rounded border border-[#E3ECF1] bg-[#FBFDFE] px-3 py-2 text-left text-sm text-[#31425C] hover:bg-[#F4FAFF]">{r}</button>)}
      </CardContent>
    </Card>
  )
}

function FileGallery({ items }: { items: any[] }) {
  return (
    <Card className="border-[#DDE8EC]">
      <CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-lg text-[#182A47]">Goruntuler / Dosyalar <FolderOpen className="h-4 w-4 text-[#7B8AA0]" /></CardTitle></CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2 md:grid-cols-4">
          {items.map((f) => <div key={f.id} className="overflow-hidden rounded border border-[#E3ECF1] bg-white"><div className="grid h-20 place-items-center bg-[#EEF4F8] text-[#51627B]"><Image className="h-5 w-5" /></div><div className="p-2"><p className="truncate text-sm font-medium text-[#263754]">{f.fileName}</p><p className="text-xs text-[#6E7E94]">{f.description}</p></div></div>)}
          <div className="grid place-items-center rounded border border-dashed border-[#BFD3E0] bg-[#F9FCFE] p-3 text-center">
            <UploadCloud className="h-5 w-5 text-[#7890A8]" />
            <p className="mt-1 text-xs text-[#667892]">Resim, PDF veya rapor</p>
            <Button variant="outline" size="sm" className="mt-2">Dosya Sec</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  )
}
