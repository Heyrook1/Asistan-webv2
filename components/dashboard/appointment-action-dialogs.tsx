'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { AccessibleField } from '@/components/ui/accessible-field'
import { formatTime } from '@/lib/format'

export type AppointmentActionSummary = {
  id: string
  patientName: string
  serviceName: string
  staffName?: string | null
  date: string
  startTime: string
  endTime?: string | null
}

const CANCEL_REASON_MIN = 3

export function formatAppointmentSlotLabel(appointment: Pick<AppointmentActionSummary, 'date' | 'startTime' | 'endTime'>) {
  const date = parseAppointmentDate(appointment.date)
  const shortDate = date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const start = formatTime(appointment.startTime)
  const end = appointment.endTime ? `–${formatTime(appointment.endTime)}` : ''
  return `${shortDate} · ${start}${end}`
}

function parseAppointmentDate(iso: string) {
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`)
  return Number.isNaN(d.getTime()) ? new Date() : d
}

function AppointmentSummaryCard({ appointment }: { appointment: AppointmentActionSummary }) {
  const date = parseAppointmentDate(appointment.date)
  const longDate = date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="rounded-xl border border-border/70 bg-slate-50/80 px-3.5 py-3 text-sm">
      <p className="font-semibold text-brand-ink">{appointment.patientName}</p>
      <p className="mt-1 text-muted-foreground">
        {appointment.serviceName}
        {appointment.staffName ? ` · ${appointment.staffName}` : ''}
      </p>
      <p className="mt-1 font-medium text-brand-ink">
        {longDate} · {formatTime(appointment.startTime)}
        {appointment.endTime ? `–${formatTime(appointment.endTime)}` : ''}
      </p>
    </div>
  )
}

export function AppointmentConfirmDialog({
  appointment,
  pending,
  onClose,
  onConfirm,
}: {
  appointment: AppointmentActionSummary | null
  pending: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!appointment) return null

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Randevuyu onayla</DialogTitle>
          <DialogDescription>
            Onay sonrası hasta kanallarına (SMS / e-posta yapılandırıldıysa) bildirim denenir.
          </DialogDescription>
        </DialogHeader>

        <AppointmentSummaryCard appointment={appointment} />

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Vazgeç
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="bg-brand-teal text-white hover:bg-brand-teal-hover"
            data-testid="appointment-confirm-submit"
          >
            {pending ? 'Onaylanıyor...' : 'Evet, onayla'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AppointmentCancelDialog({
  appointment,
  pending,
  onClose,
  onConfirm,
}: {
  appointment: AppointmentActionSummary | null
  pending: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (appointment) {
      setReason('')
      setTouched(false)
    }
  }, [appointment?.id])

  if (!appointment) return null

  const trimmed = reason.trim()
  const reasonValid = trimmed.length >= CANCEL_REASON_MIN
  const showError = touched && !reasonValid

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Randevuyu iptal et</DialogTitle>
          <DialogDescription>
            Bu işlem randevuyu İptal durumuna alır. İptal gerekçesi zorunludur.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <AppointmentSummaryCard appointment={appointment} />

          <AccessibleField
            label="İptal gerekçesi"
            required
            error={showError ? `En az ${CANCEL_REASON_MIN} karakter yazın` : undefined}
            labelClassName="mb-1.5 block text-xs text-muted-foreground"
            errorClassName="text-xs text-destructive"
          >
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 500))}
              onBlur={() => setTouched(true)}
              rows={3}
              maxLength={500}
              placeholder="Örn. Hasta erteledi, doktor müsait değil…"
              disabled={pending}
              aria-required
            />
          </AccessibleField>

          <p className="text-[12px] leading-5 text-muted-foreground">
            İptal sonrası hasta kanallarına (SMS / e-posta yapılandırıldıysa) bildirim denenir; sonuç
            toast’ta görünür. Denetim kaydı tutulur. Kısa süre için “Geri al” sunulur.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Vazgeç
          </Button>
          <Button
            type="button"
            disabled={pending || !reasonValid}
            onClick={() => {
              setTouched(true)
              if (!reasonValid) return
              onConfirm(trimmed)
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="appointment-cancel-submit"
          >
            {pending ? 'İptal ediliyor...' : 'Evet, iptal et'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
