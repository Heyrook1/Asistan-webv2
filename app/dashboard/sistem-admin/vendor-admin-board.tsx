'use client'

import { useMemo, useState, useTransition } from 'react'
import { Activity, AlertTriangle, Building2, CalendarCheck2, MessageSquareText, Users } from 'lucide-react'
import { toast } from 'sonner'
import { updateVendorMembership } from '@/lib/actions/system-admin'
import {
  VENDOR_MEMBERSHIP_LABELS,
  getVendorPlanDefinition,
  listVendorPlans,
  normalizeVendorPlanCode,
  type VendorMembershipStatusValue,
  type VendorPlanCode,
} from '@/lib/vendor-membership'

type MetricCard = {
  label: string
  value: string
  hint: string
}

type TrafficPoint = {
  key: string
  label: string
  appointments: number
  patients: number
  messages: number
}

type VendorRow = {
  businessId: string
  name: string
  slug: string
  isVendorActive: boolean
  ownerName: string
  ownerEmail: string
  status: VendorMembershipStatusValue
  plan: VendorPlanCode
  balance: number
  currency: string
  notes: string
  members: number
  patients: number
  appointments: number
  createdAt: string
}

type Props = {
  schemaReady: boolean
  metrics: MetricCard[]
  traffic: {
    appointmentsToday: number
    newPatientsToday: number
    messagesToday: number
    notificationsToday: number
    activeStaffToday: number
    pendingAppointments: number
    noShowRate30d: number
    points: TrafficPoint[]
    alerts: string[]
  }
  vendors: VendorRow[]
}

type Draft = {
  isVendorActive: boolean
  status: VendorMembershipStatusValue
  plan: VendorPlanCode
  balance: string
  currency: string
  notes: string
}

export function VendorAdminBoard({ schemaReady, metrics, traffic, vendors }: Props) {
  const planOptions = useMemo(() => listVendorPlans({ includeDemo: true }), [])
  const [isPending, startTransition] = useTransition()
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      vendors.map((vendor) => [
        vendor.businessId,
        {
          isVendorActive: vendor.isVendorActive,
          status: vendor.status,
          plan: normalizeVendorPlanCode(vendor.plan),
          balance: vendor.balance.toString(),
          currency: vendor.currency,
          notes: vendor.notes,
        },
      ])
    )
  )

  const maxLoad = useMemo(
    () => Math.max(1, ...traffic.points.map((point) => Math.max(point.appointments, point.patients, point.messages))),
    [traffic.points]
  )

  function patchDraft(businessId: string, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [businessId]: {
        ...current[businessId],
        ...patch,
      },
    }))
  }

  function saveVendor(businessId: string) {
    const draft = drafts[businessId]
    if (!draft) return

    startTransition(async () => {
      const result = await updateVendorMembership({
        businessId,
        isVendorActive: draft.isVendorActive,
        status: draft.status,
        plan: draft.plan,
        balance: Number(draft.balance),
        currency: draft.currency.trim().toUpperCase(),
        notes: draft.notes.trim(),
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success('Vendor üyeliği güncellendi')
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Vendor Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bu panel sistem vendor yönetimi içindir. Super Admin için ayrı bir kontrol merkezi kullanılır.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">{metric.label}</p>
            <p className="mt-2 text-2xl font-bold text-brand-ink">{metric.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-teal" />
            <h2 className="text-base font-bold text-brand-ink">Aktivite Trafiği (Son 14 Gün)</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Randevu, hasta kaydı ve mesaj yoğunluğu günlük bazda izlenir.</p>
          <div className="mt-5 grid grid-cols-14 items-end gap-2">
            {traffic.points.map((point) => {
              const appointmentHeight = Math.max(6, Math.round((point.appointments / maxLoad) * 110))
              const patientHeight = Math.max(6, Math.round((point.patients / maxLoad) * 110))
              const messageHeight = Math.max(6, Math.round((point.messages / maxLoad) * 110))
              return (
                <div key={point.key} className="space-y-2">
                  <div className="flex h-32 items-end gap-1">
                    <span className="w-2 rounded-t bg-brand-teal" style={{ height: `${appointmentHeight}px` }} title={`Randevu: ${point.appointments}`} />
                    <span className="w-2 rounded-t bg-brand-cyan" style={{ height: `${patientHeight}px` }} title={`Hasta: ${point.patients}`} />
                    <span className="w-2 rounded-t bg-blue-900" style={{ height: `${messageHeight}px` }} title={`Mesaj: ${point.messages}`} />
                  </div>
                  <p className="text-center text-[10px] text-muted-foreground">{point.label}</p>
                </div>
              )
            })}
          </div>
        </article>

        <article className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-brand-ink">Canlı Operasyon Durumu</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatItem icon={CalendarCheck2} label="Bugünkü randevu trafiği" value={traffic.appointmentsToday.toString()} />
            <StatItem icon={Users} label="Bugün yeni hasta" value={traffic.newPatientsToday.toString()} />
            <StatItem icon={MessageSquareText} label="Bugünkü mesaj" value={traffic.messagesToday.toString()} />
            <StatItem icon={Building2} label="Aktif görünen personel" value={traffic.activeStaffToday.toString()} />
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-brand-ink">Bekleyen randevu: {traffic.pendingAppointments}</p>
            <p className="mt-1 text-muted-foreground">Son 30 gün no-show oranı: %{traffic.noShowRate30d.toFixed(1)}</p>
            <p className="mt-1 text-muted-foreground">Bugün üretilen bildirim: {traffic.notificationsToday}</p>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-700" />
          <h2 className="text-sm font-bold text-amber-900">Operasyon Uyarıları</h2>
        </div>
        <div className="mt-3 space-y-2">
          {traffic.alerts.length === 0 ? (
            <p className="text-sm text-amber-900/80">Kritik uyarı yok. Trafik dengede görünüyor.</p>
          ) : (
            traffic.alerts.map((alert) => (
              <p key={alert} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900">
                {alert}
              </p>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-brand-ink">Vendor Üyelik ve Bakiye Yönetimi</h2>
        <p className="mt-1 text-xs text-muted-foreground">Her vendor için üyelik durumu, plan ve bakiye değerlerini güncelleyebilirsiniz.</p>
        {!schemaReady && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            VendorAccount tablosu henüz veritabanına uygulanmamış görünüyor. Kayıt butonları bu adım tamamlanana kadar pasif kalır.
          </div>
        )}
        <div className="mt-4 space-y-4">
          {vendors.map((vendor) => {
            const draft = drafts[vendor.businessId]
            if (!draft) return null

            return (
              <article key={vendor.businessId} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-brand-ink">{vendor.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      @{vendor.slug} • {vendor.ownerName} ({vendor.ownerEmail})
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Members: {vendor.members} • Patients: {vendor.patients} • Appointments: {vendor.appointments} • Created: {vendor.createdAt}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${draft.isVendorActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {draft.isVendorActive ? 'Vendor Active' : 'Vendor Inactive'}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-6">
                  <label className="space-y-1 lg:col-span-1">
                    <span className="text-xs font-semibold text-slate-600">Platform erişimi</span>
                    <select
                      value={draft.isVendorActive ? 'active' : 'inactive'}
                      onChange={(event) => patchDraft(vendor.businessId, { isVendorActive: event.target.value === 'active' })}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>

                  <label className="space-y-1 lg:col-span-1">
                    <span className="text-xs font-semibold text-slate-600">Üyelik durumu</span>
                    <select
                      value={draft.status}
                      onChange={(event) => patchDraft(vendor.businessId, { status: event.target.value as VendorMembershipStatusValue })}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    >
                      {Object.entries(VENDOR_MEMBERSHIP_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1 lg:col-span-1">
                    <span className="text-xs font-semibold text-slate-600">Plan</span>
                    <select
                      value={draft.plan}
                      onChange={(event) =>
                        patchDraft(vendor.businessId, {
                          plan: normalizeVendorPlanCode(event.target.value),
                        })
                      }
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    >
                      {planOptions.map((plan) => (
                        <option key={plan.code} value={plan.code}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1 lg:col-span-1">
                    <span className="text-xs font-semibold text-slate-600">Bakiye</span>
                    <input
                      type="number"
                      step="0.01"
                      value={draft.balance}
                      onChange={(event) => patchDraft(vendor.businessId, { balance: event.target.value })}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    />
                  </label>

                  <label className="space-y-1 lg:col-span-1">
                    <span className="text-xs font-semibold text-slate-600">Para birimi</span>
                    <input
                      value={draft.currency}
                      onChange={(event) => patchDraft(vendor.businessId, { currency: event.target.value.toUpperCase() })}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase"
                    />
                  </label>

                  <div className="flex items-end lg:col-span-1">
                    <button
                      type="button"
                      onClick={() => saveVendor(vendor.businessId)}
                      disabled={isPending || !schemaReady}
                      className="h-10 w-full rounded-lg bg-brand-teal px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>

                <label className="mt-3 block space-y-1">
                  <span className="text-xs font-semibold text-slate-600">Not</span>
                  <input
                    value={draft.notes}
                    onChange={(event) => patchDraft(vendor.businessId, { notes: event.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  />
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                  Secili plan: {getVendorPlanDefinition(draft.plan).name}
                </p>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <Icon className="h-4 w-4 text-brand-teal" />
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-brand-ink">{value}</p>
    </div>
  )
}
