'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  CalendarPlus, UserPlus, Scissors, Share2,
  Bell, Loader2, Calendar, Users, Briefcase,
  Clock, Send,
} from 'lucide-react'
import Link from 'next/link'

type ModalType = 'appointment' | 'customer' | 'service' | 'notification' | null

interface QuickActionButtonsProps {
  providerId?: string
  variant?: 'header' | 'dashboard' | 'compact'
  canEditAppointments?: boolean
  canManageCustomers?: boolean
}

export function QuickActionButtons({ providerId, variant = 'dashboard', canEditAppointments = true, canManageCustomers = true }: QuickActionButtonsProps) {
  const router = useRouter()
  const [modal, setModal] = useState<ModalType>(null)
  const [loading, setLoading] = useState(false)

  const [appointmentForm, setAppointmentForm] = useState({
    customer_name: '', service: '', date: '', time: '', notes: '',
  })
  const [customerForm, setCustomerForm] = useState({
    full_name: '', phone: '', email: '', notes: '',
  })
  const [serviceForm, setServiceForm] = useState({
    name: '', duration_minutes: '30', price: '', description: '',
  })
  const [notifForm, setNotifForm] = useState({
    recipient: '', channel: 'sms', message: '',
  })

  function reset() {
    setAppointmentForm({ customer_name: '', service: '', date: '', time: '', notes: '' })
    setCustomerForm({ full_name: '', phone: '', email: '', notes: '' })
    setServiceForm({ name: '', duration_minutes: '30', price: '', description: '' })
    setNotifForm({ recipient: '', channel: 'sms', message: '' })
    setLoading(false)
  }

  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault()
    toast.info('Randevu oluşturma yakında aktif olacak.')
    setModal(null)
    reset()
  }

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault()
    if (!customerForm.full_name || !customerForm.phone) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Oturum bulunamadı')

      const { error } = await supabase.from('users').insert({
        id: crypto.randomUUID(),
        email: customerForm.email || `${Date.now()}@noemail.local`,
        full_name: customerForm.full_name,
        phone: customerForm.phone,
        role: 'customer',
        is_active: true,
      })
      if (error) throw error

      toast.success('Müşteri eklendi')
      setModal(null)
      reset()
      router.refresh()
    } catch {
      toast.error('Müşteri eklenemedi')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault()
    if (!providerId) {
      toast.error('Önce işletme profilinizi oluşturun')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('services').insert({
        provider_id: providerId,
        name: serviceForm.name,
        description: serviceForm.description || null,
        duration_minutes: parseInt(serviceForm.duration_minutes) || 30,
        price: parseFloat(serviceForm.price) || 0,
        currency: 'TRY',
        is_active: true,
      })
      if (error) throw error

      toast.success('Hizmet eklendi')
      setModal(null)
      reset()
      router.refresh()
    } catch {
      toast.error('Hizmet eklenemedi')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendNotification(e: React.FormEvent) {
    e.preventDefault()
    toast.info('Bildirim gönderme yakında aktif olacak.')
    setModal(null)
    reset()
  }

  if (variant === 'header') {
    return (
      <>
        <Button
          size="sm"
          className="gap-2 bg-[#12C8AD] hover:bg-[#10B49C] text-white font-semibold shadow-sm"
          onClick={() => setModal('appointment')}
          disabled={!canEditAppointments}
        >
          <CalendarPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Yeni Randevu</span>
        </Button>
        <AppointmentModal open={modal === 'appointment'} onOpenChange={(o) => !o && setModal(null)} form={appointmentForm} setForm={setAppointmentForm} loading={loading} onSubmit={handleCreateAppointment} />
      </>
    )
  }

  if (variant === 'compact') {
    return (
      <>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Yeni Randevu',    icon: Calendar,   modal: 'appointment' as ModalType },
            { label: 'Hasta Ekle',      icon: Users,      modal: 'customer'    as ModalType },
            { label: 'Hizmet Ekle',     icon: Briefcase,  modal: 'service'     as ModalType },
            { label: 'Müsaitlik Ayarla', icon: Clock,     href: '/dashboard/musaitlik' },
            { label: 'Bildirim Gönder', icon: Send,       modal: 'notification' as ModalType },
          ].map((item) => (
            item.href ? (
              <Link key={item.label} href={item.href}>
                <button className="w-full flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-secondary/40 hover:bg-secondary hover:border-border p-3.5 text-xs font-medium text-foreground transition-all duration-150 hover:-translate-y-0.5">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  {item.label}
                </button>
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={() => setModal(item.modal!)}
                disabled={(item.modal === 'appointment' && !canEditAppointments) || (item.modal === 'customer' && !canManageCustomers)}
                className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-secondary/40 hover:bg-secondary hover:border-border p-3.5 text-xs font-medium text-foreground transition-all duration-150 hover:-translate-y-0.5"
              >
                <item.icon className="h-5 w-5 text-muted-foreground" />
                {item.label}
              </button>
            )
          ))}
        </div>

        <AppointmentModal open={modal === 'appointment'} onOpenChange={(o) => !o && setModal(null)} form={appointmentForm} setForm={setAppointmentForm} loading={loading} onSubmit={handleCreateAppointment} />
        <CustomerModal open={modal === 'customer'} onOpenChange={(o) => !o && setModal(null)} form={customerForm} setForm={setCustomerForm} loading={loading} onSubmit={handleAddCustomer} />
        <ServiceModal open={modal === 'service'} onOpenChange={(o) => !o && setModal(null)} form={serviceForm} setForm={setServiceForm} loading={loading} onSubmit={handleAddService} />
        <NotificationModal open={modal === 'notification'} onOpenChange={(o) => !o && setModal(null)} form={notifForm} setForm={setNotifForm} loading={loading} onSubmit={handleSendNotification} />
      </>
    )
  }

  // default: dashboard variant - horizontal row (matches screenshot: 3 buttons)
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setModal('appointment')}
          disabled={!canEditAppointments}
          className="gap-2 bg-[#12C8AD] hover:bg-[#10B49C] text-white font-semibold shadow-sm rounded-xl"
        >
          <CalendarPlus className="h-4 w-4" />
          Randevu Oluştur
        </Button>
        <Button
          variant="outline"
          onClick={() => setModal('customer')}
          disabled={!canManageCustomers}
          className="gap-2 rounded-xl border-border/60 font-medium"
        >
          <UserPlus className="h-4 w-4" />
          Hasta Ekle
        </Button>
        <Button variant="outline" asChild className="gap-2 rounded-xl border-border/60 font-medium">
          <Link href="/dashboard/musaitlik">
            <Share2 className="h-4 w-4" />
            Takvimi Paylaş
          </Link>
        </Button>
      </div>

      <AppointmentModal open={modal === 'appointment'} onOpenChange={(o) => !o && setModal(null)} form={appointmentForm} setForm={setAppointmentForm} loading={loading} onSubmit={handleCreateAppointment} />
      <CustomerModal open={modal === 'customer'} onOpenChange={(o) => !o && setModal(null)} form={customerForm} setForm={setCustomerForm} loading={loading} onSubmit={handleAddCustomer} />
      <ServiceModal open={modal === 'service'} onOpenChange={(o) => !o && setModal(null)} form={serviceForm} setForm={setServiceForm} loading={loading} onSubmit={handleAddService} />
      <NotificationModal open={modal === 'notification'} onOpenChange={(o) => !o && setModal(null)} form={notifForm} setForm={setNotifForm} loading={loading} onSubmit={handleSendNotification} />
    </>
  )
}

/* ─── Modal sub-components ─── */

interface AppointmentForm { customer_name: string; service: string; date: string; time: string; notes: string }
interface CustomerForm { full_name: string; phone: string; email: string; notes: string }
interface ServiceForm { name: string; duration_minutes: string; price: string; description: string }
interface NotifForm { recipient: string; channel: string; message: string }

function AppointmentModal({ open, onOpenChange, form, setForm, loading, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void
  form: AppointmentForm; setForm: (f: AppointmentForm) => void
  loading: boolean; onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md duration-200 data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-[#12C8AD]" />
            Randevu Oluştur
          </DialogTitle>
          <DialogDescription>Yeni bir randevu oluşturun.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ap-customer">Hasta Adı</Label>
            <Input id="ap-customer" placeholder="Ad Soyad" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ap-service">İşlem / Muayene</Label>
            <Input id="ap-service" placeholder="Örn: Genel Muayene" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ap-date">Tarih</Label>
              <Input id="ap-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-time">Saat</Label>
              <Input id="ap-time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ap-notes">Not</Label>
            <Textarea id="ap-notes" placeholder="Opsiyonel not..." rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Vazgeç</Button>
            <Button type="submit" disabled={loading} className="bg-[#12C8AD] hover:bg-[#10B49C] text-white">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Oluşturuluyor...</> : 'Kaydet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CustomerModal({ open, onOpenChange, form, setForm, loading, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void
  form: CustomerForm; setForm: (f: CustomerForm) => void
  loading: boolean; onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md duration-200 data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#16A9E8]" />
            Hasta Ekle
          </DialogTitle>
          <DialogDescription>Yeni bir hasta kaydı oluşturun.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cu-name">Ad Soyad</Label>
            <Input id="cu-name" placeholder="Örn: Ayşe Yılmaz" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cu-phone">Telefon</Label>
            <Input id="cu-phone" type="tel" placeholder="05XX XXX XX XX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cu-email">E-posta</Label>
            <Input id="cu-email" type="email" placeholder="ornek@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cu-notes">Not</Label>
            <Textarea id="cu-notes" placeholder="Hasta hakkında klinik notlar, alerji bilgileri vs..." rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Vazgeç</Button>
            <Button type="submit" disabled={loading} className="bg-[#12C8AD] hover:bg-[#10B49C] text-white">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Ekleniyor...</> : 'Kaydet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ServiceModal({ open, onOpenChange, form, setForm, loading, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void
  form: ServiceForm; setForm: (f: ServiceForm) => void
  loading: boolean; onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md duration-200 data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-purple-500" />
            Hizmet Ekle
          </DialogTitle>
          <DialogDescription>Yeni bir muayene, tahlil veya tedavi türü tanımlayın.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sv-name">İşlem Adı</Label>
            <Input id="sv-name" placeholder="Örn: Genel Muayene, Kan Tahlili" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sv-duration">Süre (dakika)</Label>
              <Input id="sv-duration" type="number" min="5" step="5" placeholder="30" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sv-price">Fiyat (₺)</Label>
              <Input id="sv-price" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sv-desc">Açıklama</Label>
            <Textarea id="sv-desc" placeholder="Hizmet açıklaması..." rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Vazgeç</Button>
            <Button type="submit" disabled={loading} className="bg-[#12C8AD] hover:bg-[#10B49C] text-white">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Ekleniyor...</> : 'Kaydet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function NotificationModal({ open, onOpenChange, form, setForm, loading, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void
  form: NotifForm; setForm: (f: NotifForm) => void
  loading: boolean; onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md duration-200 data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            Bildirim Gönder
          </DialogTitle>
          <DialogDescription>Müşterilerinize bildirim gönderin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nt-recipient">Alıcı</Label>
            <Input id="nt-recipient" placeholder="Müşteri adı veya telefon" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nt-channel">Kanal</Label>
            <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
              <SelectTrigger id="nt-channel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">E-posta</SelectItem>
                <SelectItem value="push">Uygulama Bildirimi</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nt-message">Mesaj</Label>
            <Textarea id="nt-message" placeholder="Mesajınızı yazın..." rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Vazgeç</Button>
            <Button type="submit" disabled={loading} className="bg-[#12C8AD] hover:bg-[#10B49C] text-white">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Gönderiliyor...</> : (
                <><Send className="h-4 w-4 mr-2" />Gönder</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
