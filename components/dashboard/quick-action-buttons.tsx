'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDashboardData } from '@/components/dashboard/dashboard-data-provider'
import { toast } from 'sonner'
import { CalendarPlus, Share2, UserPlus } from 'lucide-react'

type Modal = 'patient' | 'appointment' | 'service' | 'share' | null

export function QuickActionButtons() {
  const { db, addPatient, addAppointment, addService } = useDashboardData()
  const [open, setOpen] = useState<Modal>(null)
  const [patient, setPatient] = useState({ fullName: '', phone: '', email: '', birthDate: '', gender: '', notes: '', tags: '' })
  const [service, setService] = useState({ name: '', duration: '30', price: '0', category: '', color: '#12C8AD', description: '' })
  const [appointment, setAppointment] = useState({ patientId: '', serviceId: '', staffId: '', date: '', startTime: '', notes: '' })

  const bookingLink = useMemo(() => `${typeof window !== 'undefined' ? window.location.origin : 'https://asistan.app'}/book/demo`, [])

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setOpen('appointment')} className="bg-[#12C8AD] text-white hover:bg-[#10b49c]"><CalendarPlus className="mr-2 h-4 w-4" />Randevu Oluştur</Button>
        <Button variant="outline" onClick={() => setOpen('patient')}><UserPlus className="mr-2 h-4 w-4" />Hasta Ekle</Button>
        <Button variant="outline" onClick={() => setOpen('service')}>Hizmet Ekle</Button>
        <Button variant="outline" onClick={() => setOpen('share')}><Share2 className="mr-2 h-4 w-4" />Takvimi Paylaş</Button>
      </div>

      <Dialog open={open === 'patient'} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent><DialogHeader><DialogTitle>Hasta Ekle</DialogTitle></DialogHeader>
          <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); addPatient({ ...patient, tags: patient.tags ? patient.tags.split(',').map((x) => x.trim()) : [] }); toast.success('Hasta eklendi'); setOpen(null) }}>
            <Input required placeholder="Ad Soyad" value={patient.fullName} onChange={(e) => setPatient({ ...patient, fullName: e.target.value })} />
            <Input required placeholder="Telefon" value={patient.phone} onChange={(e) => setPatient({ ...patient, phone: e.target.value })} />
            <Input type="email" placeholder="E-posta" value={patient.email} onChange={(e) => setPatient({ ...patient, email: e.target.value })} />
            <Input type="date" value={patient.birthDate} onChange={(e) => setPatient({ ...patient, birthDate: e.target.value })} />
            <Select value={patient.gender} onValueChange={(v) => setPatient({ ...patient, gender: v })}><SelectTrigger><SelectValue placeholder="Cinsiyet" /></SelectTrigger><SelectContent><SelectItem value="Kadin">Kadın</SelectItem><SelectItem value="Erkek">Erkek</SelectItem><SelectItem value="Diger">Diğer</SelectItem></SelectContent></Select>
            <Textarea placeholder="Notlar" value={patient.notes} onChange={(e) => setPatient({ ...patient, notes: e.target.value })} />
            <Input placeholder="Etiketler (virgülle)" value={patient.tags} onChange={(e) => setPatient({ ...patient, tags: e.target.value })} />
            <Button type="submit" className="bg-[#12C8AD] text-white hover:bg-[#10b49c]">Kaydet</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={open === 'service'} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent><DialogHeader><DialogTitle>Hizmet Ekle</DialogTitle></DialogHeader>
          <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); addService({ name: service.name, duration: Number(service.duration), price: Number(service.price), category: service.category, color: service.color, description: service.description }); toast.success('Hizmet eklendi'); setOpen(null) }}>
            <Input required placeholder="Hizmet adı" value={service.name} onChange={(e) => setService({ ...service, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3"><Input required type="number" placeholder="Süre" value={service.duration} onChange={(e) => setService({ ...service, duration: e.target.value })} /><Input required type="number" placeholder="Fiyat" value={service.price} onChange={(e) => setService({ ...service, price: e.target.value })} /></div>
            <Input placeholder="Kategori" value={service.category} onChange={(e) => setService({ ...service, category: e.target.value })} />
            <Input type="color" value={service.color} onChange={(e) => setService({ ...service, color: e.target.value })} />
            <Textarea placeholder="Açıklama" value={service.description} onChange={(e) => setService({ ...service, description: e.target.value })} />
            <Button type="submit" className="bg-[#12C8AD] text-white hover:bg-[#10b49c]">Kaydet</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={open === 'appointment'} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent><DialogHeader><DialogTitle>Randevu Oluştur</DialogTitle></DialogHeader>
          <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); if (!appointment.patientId || !appointment.serviceId || !appointment.date || !appointment.startTime) return toast.error('Eksik alan var'); addAppointment(appointment); toast.success('Randevu oluşturuldu'); setOpen(null) }}>
            <Label>Hasta seç</Label><Select value={appointment.patientId} onValueChange={(v) => setAppointment({ ...appointment, patientId: v })}><SelectTrigger><SelectValue placeholder="Hasta" /></SelectTrigger><SelectContent>{db.patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>)}</SelectContent></Select>
            <Label>Hizmet seç</Label><Select value={appointment.serviceId} onValueChange={(v) => setAppointment({ ...appointment, serviceId: v })}><SelectTrigger><SelectValue placeholder="Hizmet" /></SelectTrigger><SelectContent>{db.services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
            <Label>Personel seç</Label><Select value={appointment.staffId} onValueChange={(v) => setAppointment({ ...appointment, staffId: v })}><SelectTrigger><SelectValue placeholder="Personel" /></SelectTrigger><SelectContent>{db.team.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
            <div className="grid grid-cols-2 gap-3"><Input type="date" value={appointment.date} onChange={(e) => setAppointment({ ...appointment, date: e.target.value })} /><Input type="time" value={appointment.startTime} onChange={(e) => setAppointment({ ...appointment, startTime: e.target.value })} /></div>
            <Textarea placeholder="Not" value={appointment.notes} onChange={(e) => setAppointment({ ...appointment, notes: e.target.value })} />
            <Button type="button" variant="outline" onClick={() => setOpen('service')}>Hizmet Ekle</Button>
            <Button type="submit" className="bg-[#12C8AD] text-white hover:bg-[#10b49c]">Kaydet</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={open === 'share'} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent><DialogHeader><DialogTitle>Takvimi Paylaş</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Input readOnly value={bookingLink} />
            <Button onClick={() => { navigator.clipboard.writeText(bookingLink); toast.success('Bağlantı kopyalandı') }}>Bağlantıyı Kopyala</Button>
            <Button variant="outline" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(bookingLink)}`, '_blank')}>WhatsApp ile Paylaş</Button>
            <Button variant="outline" onClick={() => window.open(`mailto:?subject=Online Randevu&body=${encodeURIComponent(bookingLink)}`)}>E-posta ile Paylaş</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
