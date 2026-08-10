'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CalendarCheck, XCircle } from 'lucide-react'
import { APPOINTMENT_STATUS_DOT, APPOINTMENT_STATUS_LABELS, formatTime } from '@/lib/format'
import { setAppointmentStatus } from '@/lib/actions/appointments'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  AppointmentCancelDialog,
  AppointmentConfirmDialog,
  formatAppointmentSlotLabel,
} from '@/components/dashboard/appointment-action-dialogs'
import type { CalendarEvent } from './calendar-types'

export function CalendarEventChip({
  event,
  canManage,
  compact = false,
}: {
  event: CalendarEvent
  canManage: boolean
  compact?: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const canConfirm = canManage && event.status === 'SCHEDULED'
  const canCancel =
    canManage && (event.status === 'SCHEDULED' || event.status === 'CONFIRMED')
  const slotLabel = formatAppointmentSlotLabel(event)
  const listHref = `/dashboard/ajanda?mode=liste&id=${event.id}`

  function runStatus(next: 'CONFIRMED' | 'CANCELLED', cancelReason?: string) {
    startTransition(async () => {
      try {
        const result = await setAppointmentStatus({
          id: event.id,
          status: next,
          cancelReason,
        })
        if (!result.ok) {
          toast.error(result.error)
          return
        }
        if (result.data.alreadyInStatus) {
          toast.message(`Randevu zaten: ${APPOINTMENT_STATUS_LABELS[next]}`)
        } else if (next === 'CONFIRMED') {
          toast.success(`Onaylandı — ${slotLabel}`, {
            description: result.data.channelDelivery?.label,
          })
        } else {
          toast.success(`İptal edildi — ${slotLabel}`, {
            description: result.data.channelDelivery?.label ?? 'Hasta bildirim kanalları kontrol edildi.',
          })
        }
        router.refresh()
      } catch {
        toast.error('Randevu durumu güncellenemedi. Lütfen tekrar deneyin.')
      }
    })
  }

  return (
    <div
      data-testid={`calendar-event-${event.id}`}
      data-status={event.status}
      className={cn(
        'rounded-md border bg-white text-left',
        compact ? 'px-2 py-1 text-[11px]' : 'rounded-xl px-3 py-2.5 text-[13px]',
      )}
      style={{
        borderLeftColor: APPOINTMENT_STATUS_DOT[event.status] ?? event.serviceColor,
        borderLeftWidth: 3,
        background: compact ? `${event.serviceColor}26` : undefined,
      }}
    >
      <Link
        href={listHref}
        className="block min-w-0 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        <span className={cn('block truncate font-semibold text-brand-ink', compact && 'font-medium')}>
          {event.patientName}
        </span>
        <span className="mt-0.5 block truncate text-muted-foreground">
          {compact
            ? `${formatTime(event.startTime)} - ${formatTime(event.endTime)} • ${APPOINTMENT_STATUS_LABELS[event.status]}`
            : `${event.serviceName}${event.staffName ? ` • ${event.staffName}` : ''}`}
        </span>
        {!compact ? (
          <span className="mt-1 inline-flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="font-semibold text-brand-ink">
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                background: `${APPOINTMENT_STATUS_DOT[event.status] ?? event.serviceColor}22`,
                color: APPOINTMENT_STATUS_DOT[event.status] ?? 'var(--brand-ink)',
              }}
            >
              {APPOINTMENT_STATUS_LABELS[event.status]}
            </span>
          </span>
        ) : null}
      </Link>
      {(canConfirm || canCancel) && !compact ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {canConfirm ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 gap-1 px-2 text-[11px]"
              disabled={pending}
              data-testid={`calendar-confirm-${event.id}`}
              aria-label={`${event.patientName} randevusunu onayla`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setConfirmOpen(true)
              }}
            >
              <CalendarCheck className="h-3.5 w-3.5 text-sky-600" />
              Onayla
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1 px-2 text-[11px] text-rose-700"
              disabled={pending}
              data-testid={`calendar-cancel-${event.id}`}
              aria-label={`${event.patientName} randevusunu iptal et`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setCancelOpen(true)
              }}
            >
              <XCircle className="h-3.5 w-3.5" />
              İptal
            </Button>
          ) : null}
        </div>
      ) : canConfirm && compact ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-2 h-7 w-full gap-1 px-2 text-[11px]"
          disabled={pending}
          data-testid={`calendar-confirm-${event.id}`}
          aria-label={`${event.patientName} randevusunu onayla`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setConfirmOpen(true)
          }}
        >
          <CalendarCheck className="h-3.5 w-3.5 text-sky-600" />
          Onayla
        </Button>
      ) : null}

      <AppointmentConfirmDialog
        appointment={confirmOpen ? event : null}
        pending={pending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          runStatus('CONFIRMED')
        }}
      />
      <AppointmentCancelDialog
        appointment={cancelOpen ? event : null}
        pending={pending}
        onClose={() => setCancelOpen(false)}
        onConfirm={(reason) => {
          setCancelOpen(false)
          runStatus('CANCELLED', reason)
        }}
      />
    </div>
  )
}
