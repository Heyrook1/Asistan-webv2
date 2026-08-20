import { getPatientOutboundChannelConfig } from '@/lib/notifications/channels'
import {
  isGoogleCalendarSyncConfigured,
  isGoogleCalendarSyncEnabled,
} from '@/lib/calendar/config'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { env } from '@/lib/env'

/**
 * Deploy / ops runbook for integrations — Super Admin (and internal support) only.
 * Do not reuse this copy on clinic Ayarlar → Entegrasyonlar.
 */
export function SuperAdminIntegrationsOpsPanel() {
  const channels = getPatientOutboundChannelConfig()
  const calendarConfigured = isGoogleCalendarSyncConfigured()
  const calendarEnabled = isGoogleCalendarSyncEnabled()
  const selfServe = isFeatureEnabled('selfServeBilling')

  const rows: Array<{ key: string; label: string; ok: boolean; detail: string }> = [
    {
      key: 'sms',
      label: 'SMS_PROVIDER_WEBHOOK_URL',
      ok: channels.sms,
      detail: channels.sms ? 'set' : 'missing',
    },
    {
      key: 'wa',
      label: 'WHATSAPP_PROVIDER_WEBHOOK_URL',
      ok: channels.whatsapp,
      detail: channels.whatsapp ? 'set' : 'missing',
    },
    {
      key: 'email',
      label: 'EMAIL_PROVIDER_WEBHOOK_URL',
      ok: channels.email,
      detail: channels.email ? 'set' : 'missing',
    },
    {
      key: 'token',
      label: 'NOTIFICATION_PROVIDER_TOKEN',
      ok: Boolean(env.NOTIFICATION_PROVIDER_TOKEN),
      detail: env.NOTIFICATION_PROVIDER_TOKEN ? 'set' : 'missing',
    },
    {
      key: 'gcal',
      label: 'Google Calendar OAuth (CLIENT_ID/SECRET + encryption key)',
      ok: calendarConfigured,
      detail: calendarConfigured ? 'configured' : 'missing',
    },
    {
      key: 'gcal-flag',
      label: 'ASISTAN_FLAG_CALENDAR_SYNC / calendar feature',
      ok: calendarEnabled,
      detail: calendarEnabled ? 'enabled' : 'disabled',
    },
    {
      key: 'billing',
      label: 'selfServeBilling flag',
      ok: selfServe,
      detail: selfServe ? 'on' : 'off',
    },
  ]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-brand-ink">Entegrasyon ops (deploy runbook)</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Klinik kullanıcı arayüzünde gösterilmez. Webhook bind, HTTP ACK vs operatör DLR ve checklist:{' '}
        <code className="text-xs">docs/patient-outbound-channels.md</code> · Google:{' '}
        <code className="text-xs">docs/</code> calendar notes. Inbound WA:{' '}
        <code className="text-xs">POST /api/webhooks/whatsapp?slug=…</code>
      </p>
      <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
          >
            <code className="text-xs text-slate-800">{row.label}</code>
            <span
              className={
                row.ok
                  ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800'
                  : 'rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900'
              }
            >
              {row.detail}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
