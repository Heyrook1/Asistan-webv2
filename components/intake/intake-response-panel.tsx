'use client'

import { useTransition } from 'react'
import { Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createOrRefreshIntakeLink } from '@/lib/actions/intake-forms'
import { formatDateTime } from '@/lib/format'
import { labelIntakeInviteStatus } from '@/lib/ui-labels'
import type { IntakeFieldDef } from '@/lib/intake/schema'

export type PatientIntakeRow = {
  id: string
  submittedAt: string
  formName: string
  answers: Record<string, string | boolean | null>
  fields: IntakeFieldDef[]
  appointment: { id: string; date: string; startTime: string; serviceName: string } | null
}

export type PatientIntakeInviteRow = {
  id: string
  appointmentId: string
  status: string
  formName: string
  expiresAt: string
  appointment: { date: string; startTime: string; serviceName: string }
}

function formatAnswer(value: string | boolean | null) {
  if (value == null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır'
  return value
}

export function IntakeResponsePanel({
  responses,
  pendingInvites,
  canManageAppointments,
}: {
  responses: PatientIntakeRow[]
  pendingInvites: PatientIntakeInviteRow[]
  canManageAppointments: boolean
}) {
  const [pending, startTransition] = useTransition()

  function copyLink(appointmentId: string) {
    startTransition(async () => {
      const result = await createOrRefreshIntakeLink(appointmentId)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      try {
        await navigator.clipboard.writeText(result.data.intakeUrl)
        toast.success('Ön kayıt linki kopyalandı')
      } catch {
        toast.message(result.data.intakeUrl)
      }
    })
  }

  if (responses.length === 0 && pendingInvites.length === 0) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          Bu hasta için henüz ön kayıt formu yok. Genel randevu linki veya randevudan link üreterek
          gönderebilirsiniz.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {pendingInvites.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-brand-ink">Bekleyen formlar</p>
          {pendingInvites.map((invite) => (
            <Card key={invite.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-brand-ink">{invite.formName}</p>
                    <Badge variant="outline">{labelIntakeInviteStatus(invite.status)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {invite.appointment.serviceName} · {invite.appointment.date} {invite.appointment.startTime} ·
                    son tarih {formatDateTime(invite.expiresAt)}
                  </p>
                </div>
                {canManageAppointments ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => copyLink(invite.appointmentId)}
                  >
                    <Copy className="mr-1.5 size-3.5" />
                    Link kopyala
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {responses.map((row) => (
        <Card key={row.id}>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-brand-ink">{row.formName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(row.submittedAt)}
                  {row.appointment
                    ? ` · ${row.appointment.serviceName} · ${row.appointment.date} ${row.appointment.startTime}`
                    : ''}
                </p>
              </div>
              {row.appointment ? (
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Hasta kartına bağlı</Badge>
              ) : null}
            </div>
            <dl className="grid gap-2 sm:grid-cols-2">
              {row.fields.map((field) => (
                <div key={field.id} className="rounded-xl border bg-slate-50/70 px-3 py-2">
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {field.label}
                  </dt>
                  <dd className="mt-1 text-sm text-brand-ink">{formatAnswer(row.answers[field.id] ?? null)}</dd>
                </div>
              ))}
            </dl>
            {row.appointment && canManageAppointments ? (
              <Button type="button" variant="ghost" size="sm" asChild>
                <a href={`/dashboard/ajanda`}>
                  <ExternalLink className="mr-1 size-3.5" />
                  Ajanda
                </a>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
