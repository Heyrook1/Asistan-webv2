import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Mail, Smartphone } from 'lucide-react'
import type { BusinessChannelDeliveryStats } from '@/lib/notifications/channel-delivery-store'

export type PatientOutboundChannelFlags = {
  sms: boolean
  whatsapp: boolean
  email: boolean
  anyConfigured: boolean
}

function ChannelRow({
  icon: Icon,
  label,
  configured,
}: {
  icon: typeof Smartphone
  label: string
  configured: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-white px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-sm font-medium text-brand-ink">{label}</span>
      </div>
      <Badge
        variant="secondary"
        className={
          configured
            ? 'border-0 bg-emerald-100 text-emerald-800'
            : 'border-0 bg-amber-100 text-amber-900'
        }
      >
        {configured ? 'bağlı' : 'yapılandırılmadı'}
      </Badge>
    </div>
  )
}

/**
 * Fail-visible status for patient SMS / WhatsApp / email webhooks (env-level).
 * Clinic owners cannot set URLs here — ops binds `SMS_PROVIDER_WEBHOOK_URL` etc.
 */
export function PatientOutboundChannelsPanel({
  channels,
  delivery,
}: {
  channels: PatientOutboundChannelFlags
  delivery?: BusinessChannelDeliveryStats | null
}) {
  const rateLabel =
    delivery?.rate == null
      ? null
      : `%${(delivery.rate * 100).toFixed(0)} (son ${delivery.windowHours}s)`

  return (
    <Card className="mt-4">
      <CardContent className="space-y-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-ink">Hasta bildirim kanalları</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Onay ve iptal sonrası SMS / WhatsApp / e-posta denemesi yapılır. Kanal bağlı değilse
              randevu yine kaydedilir; durum toast’ta{' '}
              <span className="font-medium text-brand-ink">gönderildi / yapılandırılmadı / hata</span>{' '}
              olarak görünür. Oran, köprüye HTTP ACK’tir — operatör teslimatı (DLR) değildir.
            </p>
          </div>
          {delivery?.rate != null ? (
            <Badge
              variant="secondary"
              className={
                delivery.meetsOpsGate
                  ? 'border-0 bg-emerald-100 text-emerald-900'
                  : 'border-0 bg-amber-100 text-amber-950'
              }
            >
              Gönderim {rateLabel}
              {delivery.meetsOpsGate ? ' · ≥%80' : ' · hedef ≥%80'}
            </Badge>
          ) : (
            <Badge variant="secondary" className="border-0 bg-slate-100 text-slate-700">
              Gönderim oranı: veri yok
            </Badge>
          )}
        </div>
        {delivery && delivery.attempted + delivery.notConfigured > 0 ? (
          <p className="text-xs text-muted-foreground">
            {delivery.sent} gönderildi · {delivery.errors} hata · {delivery.notConfigured} yapılandırılmadı
            (yapılandırılmadı oran hesabına girmez).
          </p>
        ) : null}
        <div className="space-y-2" role="list" aria-label="Hasta bildirim kanal durumu">
          <ChannelRow icon={Smartphone} label="SMS" configured={channels.sms} />
          <ChannelRow icon={MessageSquare} label="WhatsApp" configured={channels.whatsapp} />
          <ChannelRow icon={Mail} label="E-posta" configured={channels.email} />
        </div>
        {!channels.anyConfigured && (
          <p className="text-xs leading-5 text-amber-900">
            Henüz webhook tanımlı değil. Ops:{' '}
            <code className="rounded bg-amber-50 px-1">SMS_PROVIDER_WEBHOOK_URL</code> /{' '}
            <code className="rounded bg-amber-50 px-1">WHATSAPP_PROVIDER_WEBHOOK_URL</code> +{' '}
            <code className="rounded bg-amber-50 px-1">NOTIFICATION_PROVIDER_TOKEN</code> — checklist:{' '}
            <code className="rounded bg-amber-50 px-1">docs/patient-outbound-channels.md</code> § Prod bind.
          </p>
        )}
        {channels.anyConfigured ? (
          <p className="text-xs leading-5 text-muted-foreground">
            Canlı bağ için köprü şablonları ve cron hatırlatması aynı dokümanda. Hedef ≥%80 (son 24s).
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
