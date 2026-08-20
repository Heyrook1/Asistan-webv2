'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, CalendarPlus, CheckCircle2, PlayCircle, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type QuickStartTourProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartAppointment: () => void
  onOpenPatients: () => void
  onOpenCalendar: () => void
  onDismissForever: () => void
  videoSrc?: string
}

const DEFAULT_VIDEO_SRC = '/videos/ilk-randevu-30sn.mp4'

export function QuickStartTour({
  open,
  onOpenChange,
  onStartAppointment,
  onOpenPatients,
  onOpenCalendar,
  onDismissForever,
  videoSrc,
}: QuickStartTourProps) {
  const [videoError, setVideoError] = useState(false)
  const source = videoSrc ?? DEFAULT_VIDEO_SRC

  useEffect(() => {
    if (open) setVideoError(false)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-3xl" showCloseButton={false}>
        <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr]">
          <div className="border-b bg-slate-950 p-4 lg:border-b-0 lg:border-r">
            <div className="mb-3 flex items-center gap-2 text-white">
              <PlayCircle className="h-4 w-4" />
              <p className="text-sm font-semibold">İlk randevu akışı (30 sn)</p>
            </div>
            {!videoError ? (
              <video
                controls
                playsInline
                preload="metadata"
                poster="/images/medical-team.jpg"
                className="aspect-video w-full rounded-xl border border-white/10 bg-black object-cover"
                onError={() => setVideoError(true)}
              >
                <source src={source} type="video/mp4" />
              </video>
            ) : (
              <div className="flex aspect-video flex-col justify-center gap-3 rounded-xl border border-white/10 bg-black/40 p-5 text-left text-sm text-white/90">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">
                  3 adımda ilk gün
                </p>
                <ol className="space-y-2 text-sm leading-5">
                  <li>
                    <span className="font-semibold text-white">1.</span> Hasta kartı oluşturun veya mevcut hastayı seçin.
                  </li>
                  <li>
                    <span className="font-semibold text-white">2.</span> Ajandada uygun saati açın.
                  </li>
                  <li>
                    <span className="font-semibold text-white">3.</span> Randevuyu kaydedin — panel güncellenir.
                  </li>
                </ol>
                <p className="text-xs text-white/55">
                  Video yoksa sağdaki butonlarla aynı akışı başlatın. Opsiyonel: <code className="text-white/70">public/videos/ilk-randevu-30sn.mp4</code>
                </p>
              </div>
            )}
          </div>

          <div className="p-5">
            <DialogHeader className="text-left">
              <DialogTitle className="text-base font-semibold text-brand-ink">
                İlk gün: 3 adımda ilk randevu
              </DialogTitle>
              <DialogDescription>
                Kayıt sonrası trial paneli açıldı. Aşağıdaki adımlardan biriyle hemen başlayın — kredi kartı gerekmez.
              </DialogDescription>
            </DialogHeader>

            <ol className="mt-4 space-y-3">
              <li className="rounded-xl border bg-white p-3">
                <p className="text-sm font-semibold text-brand-ink">1. Hasta kartını doğrulayın</p>
                <p className="mt-1 text-xs text-muted-foreground">İsim, telefon ve notları kontrol edin.</p>
                <Button size="sm" variant="outline" className="mt-3 w-full" onClick={onOpenPatients}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Hastalara Git
                </Button>
              </li>
              <li className="rounded-xl border bg-white p-3">
                <p className="text-sm font-semibold text-brand-ink">2. Müsait saat seçin</p>
                <p className="mt-1 text-xs text-muted-foreground">Takvimde uygun slotu açıp saat planlayın.</p>
                <Button size="sm" variant="outline" className="mt-3 w-full" onClick={onOpenCalendar}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Ajandaya Git
                </Button>
              </li>
              <li className="rounded-xl border bg-white p-3">
                <p className="text-sm font-semibold text-brand-ink">3. İlk randevuyu oluşturun</p>
                <p className="mt-1 text-xs text-muted-foreground">Hasta, hizmet ve saat seçip randevuyu kaydedin.</p>
                <Button size="sm" className="mt-3 w-full bg-brand-teal text-white hover:bg-brand-teal-hover" onClick={onStartAppointment}>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Randevu Oluştur
                </Button>
              </li>
            </ol>

            <DialogFooter className="mt-4 gap-2 sm:justify-between">
              <Button type="button" variant="ghost" className="text-muted-foreground" onClick={onDismissForever}>
                Bu turu bir daha gösterme
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Şimdilik tamam
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

