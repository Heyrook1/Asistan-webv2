import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Mail, Smartphone } from 'lucide-react'
import type { BusinessChannelDeliveryStats } from '@/lib/notifications/channel-delivery-store'
import {
  INTEGRATION_STATUS_LABEL,
  resolveChannelLinkStatus,
  type IntegrationLinkStatus,
} from '@/lib/integrations/clinic-status'

export type PatientOutboundChannelFlags = {
  sms: boolean
  whatsapp: boolean
  email: boolean
  anyConfigured: boolean
}

function statusBadgeClass(status: IntegrationLinkStatus): string {
  if (status === 'connected') return 'border-0 bg-emerald-100 text-emerald-800'
  if (status === 'error') return 'border-0 bg-red-100 text-red-800'
  return 'border-0 bg-amber-100 text-amber-900'
}

function ChannelCard({
  icon: Icon,
  label,
  configured,
  sent,
  errors,
  connectHref,
  connectLabel,
}: {
  icon: typeof Smartphone
  label: string
  configured: boolean
  sent: number
  errors: number
  connectHref: string
  connectLabel: string
}) {
  const status = resolveChannelLinkStatus({ configured, errors, sent })
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="text-sm font-medium text-brand-ink">{label}</span>
          <Badge variant="secondary" className={statusBadgeClass(status)}>
            {INTEGRATION_STATUS_LABEL[status]}
          </Badge>
        </div>
        {configured ? (
          <p className="text-xs text-muted-foreground">
            Son 24 saat: {sent} gönderildi · {errors} hata
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Klinik ayarlarından açılamaz — Asistan destek ekibi bağlar.
          </p>
        )}
      </div>
      {status !== 'connected' ? (
        <Button asChild size="sm" variant={status === 'error' ? 'default' : 'outline'}>
          <Link href={connectHref}>{connectLabel}</Link>
        </Button>
      ) : null}
    </div>
  )
}

/**
 * Product-facing SMS / WhatsApp / email status for clinic staff.
 * Env bind / webhook runbook lives in Super Admin ops panel only.
 */
export function PatientOutboundChannelsPanel({
  channels,
  delivery,
}: {
  channels: PatientOutboundChannelFlags
  delivery?: BusinessChannelDeliveryStats | null
}) {
  const stats = delivery ?? null
  const rateLabel =
    stats?.rate == null ? null : `%${(stats.rate * 100).toFixed(0)} (son ${stats.windowHours} saat)`

  return (
    <Card className="mt-4">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-ink">Hasta bildirim kanalları</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Randevu onay, iptal ve hatırlatmaları SMS, WhatsApp veya e-posta ile iletilir. Kanal
              bağlı değilse randevu yine kaydedilir; gönderim durumu ekranda görünür.
            </p>
          </div>
          {stats?.rate != null ? (
            <Badge
              variant="secondary"
              className={
                stats.meetsOpsGate
                  ? 'border-0 bg-emerald-100 text-emerald-900'
                  : 'border-0 bg-amber-100 text-amber-950'
              }
            >
              Gönderim oranı {rateLabel}
            </Badge>
          ) : (
            <Badge variant="secondary" className="border-0 bg-slate-100 text-slate-700">
              Gönderim oranı: henüz veri yok
            </Badge>
          )}
        </div>

        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          <p>
            Son başarılı gönderim:{' '}
            {stats?.lastSentAt
              ? new Date(stats.lastSentAt).toLocaleString('tr-TR')
              : '—'}
          </p>
          <p>
            Son hata:{' '}
            {stats?.lastErrorAt
              ? new Date(stats.lastErrorAt).toLocaleString('tr-TR')
              : '—'}
          </p>
        </div>

        <div className="space-y-2" role="list" aria-label="Hasta bildirim kanal durumu">
          <ChannelCard
            icon={Smartphone}
            label="SMS"
            configured={channels.sms}
            sent={stats?.byChannel.sms.sent ?? 0}
            errors={stats?.byChannel.sms.errors ?? 0}
            connectHref="/contact"
            connectLabel="SMS sağlayıcısını bağla"
          />
          <ChannelCard
            icon={MessageSquare}
            label="WhatsApp"
            configured={channels.whatsapp}
            sent={stats?.byChannel.whatsapp.sent ?? 0}
            errors={stats?.byChannel.whatsapp.errors ?? 0}
            connectHref="/contact"
            connectLabel="WhatsApp’ı bağla"
          />
          <ChannelCard
            icon={Mail}
            label="E-posta"
            configured={channels.email}
            sent={stats?.byChannel.email.sent ?? 0}
            errors={stats?.byChannel.email.errors ?? 0}
            connectHref="/contact"
            connectLabel="E-posta kanalını bağla"
          />
        </div>
      </CardContent>
    </Card>
  )
}
