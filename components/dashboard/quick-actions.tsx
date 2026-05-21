'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { CalendarPlus, Share2, UserPlus, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import { PatientFormDrawer } from './patient-form-drawer'
import { AppointmentFormDrawer, type AppointmentOption } from './appointment-form-drawer'
import { ServiceFormDialog } from './service-form-dialog'

export type QuickActionsLookups = {
  patients: AppointmentOption[]
  services: (AppointmentOption & { durationMin: number })[]
  staff: AppointmentOption[]
  bookingSlug: string
}

type Modal = 'patient' | 'appointment' | 'service' | 'share' | null

export function QuickActions({
  lookups,
  canCreatePatient = true,
  canCreateAppointment = true,
  canManageService = true,
}: {
  lookups: QuickActionsLookups
  canCreatePatient?: boolean
  canCreateAppointment?: boolean
  canManageService?: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState<Modal>(null)

  const bookingLink = useMemo(() => {
    if (typeof window === 'undefined') return `/randevu/${lookups.bookingSlug}`
    return `${window.location.origin}/randevu/${lookups.bookingSlug}`
  }, [lookups.bookingSlug])

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canCreateAppointment && (
          <Button onClick={() => setOpen('appointment')} className="bg-[#0B7F6F] text-white hover:bg-[#09685C]">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Randevu Oluştur
          </Button>
        )}
        {canCreatePatient && (
          <Button variant="outline" onClick={() => setOpen('patient')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Hasta Ekle
          </Button>
        )}
        {canManageService && (
          <Button variant="outline" onClick={() => setOpen('service')}>
            <Briefcase className="mr-2 h-4 w-4" />
            Hizmet Ekle
          </Button>
        )}
        <Button variant="outline" onClick={() => setOpen('share')}>
          <Share2 className="mr-2 h-4 w-4" />
          Takvimi Paylaş
        </Button>
      </div>

      <PatientFormDrawer
        open={open === 'patient'}
        onOpenChange={(v) => setOpen(v ? 'patient' : null)}
      />
      <AppointmentFormDrawer
        open={open === 'appointment'}
        onOpenChange={(v) => setOpen(v ? 'appointment' : null)}
        patients={lookups.patients}
        services={lookups.services}
        staff={lookups.staff}
      />
      <ServiceFormDialog
        open={open === 'service'}
        onOpenChange={(v) => setOpen(v ? 'service' : null)}
        onSaved={() => router.refresh()}
      />

      <Dialog open={open === 'share'} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Takvimi Paylaş</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Input readOnly value={bookingLink} />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(bookingLink)
                toast.success('Bağlantı kopyalandı')
              }}
              className="bg-[#0B7F6F] hover:bg-[#09685C] text-white"
            >
              Bağlantıyı Kopyala
            </Button>
            <Button variant="outline" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(bookingLink)}`, '_blank')}>
              WhatsApp ile Paylaş
            </Button>
            <Button variant="outline" onClick={() => window.open(`mailto:?subject=Online Randevu&body=${encodeURIComponent(bookingLink)}`)}>
              E-posta ile Paylaş
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
