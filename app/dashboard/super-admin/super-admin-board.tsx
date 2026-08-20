'use client'

import { useMemo, useState, useTransition } from 'react'
import { Activity, AlertTriangle, Building2, CalendarCheck2, MessageSquareText, Shield, Users } from 'lucide-react'
import { toast } from 'sonner'
import { updateVendorMembership } from '@/lib/actions/system-admin'
import { setPlatformUserActive } from '@/lib/actions/super-admin'
import { MembershipPaymentsAdmin } from '@/components/dashboard/membership-payments-admin'
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
  notifications: number
}

type VendorRow = {
  businessId: string
  name: string
  slug: string
  isVendorActive: boolean
  isDemo: boolean
  ownerName: string
  ownerEmail: string
  status: VendorMembershipStatusValue
  plan: VendorPlanCode
  balance: number
  currency: string
  accessStartAt: string | null
  accessEndAt: string | null
  packageDurationDays: number | null
  notes: string
  members: number
  patients: number
  appointmentsTotal: number
  appointments30d: number
  createdAt: string
}

type UserRow = {
  id: string
  fullName: string
  email: string
  isActive: boolean
  role: string
  businessName: string
  membershipIsActive: boolean
  membershipsCount: number
  notificationsCount: number
  createdAt: string
}

type ActivityRow = {
  id: string
  title: string
  message: string
  type: string
  businessName: string
  actor: string
  createdAt: string
}

type Props = {
  schemaReady: boolean
  currentUserId: string
  metrics: MetricCard[]
  traffic: {
    appointmentsToday: number
    patientsToday: number
    messagesToday: number
    notificationsToday: number
    appointmentsLast7d: number
    patientsLast7d: number
    messagesLast7d: number
    pendingAppointments: number
    noShowRate30d: number
    averageDailyAppointments: number
    peakDayAppointments: number
    overdueReminders: number
    points: TrafficPoint[]
    alerts: string[]
  }
  vendors: VendorRow[]
  users: UserRow[]
  recentActivity: ActivityRow[]
  pendingMembershipPayments?: Array<{
    id: string
    businessId: string
    businessName: string
    planCode: string
    planName: string
    billingPeriod: string
    amount: number
    currency: string
    provider: string
    createdAt: string
  }>
}

type VendorDraft = {
  isVendorActive: boolean
  isDemo: boolean
  status: VendorMembershipStatusValue
  plan: VendorPlanCode
  balance: string
  currency: string
  accessStartAt: string
  packageDurationDays: string
  notes: string
}

export function SuperAdminBoard({
  schemaReady,
  currentUserId,
  metrics,
  traffic,
  vendors,
  users,
  recentActivity,
  pendingMembershipPayments = [],
}: Props) {
  const planOptions = useMemo(() => listVendorPlans({ includeDemo: true }), [])
  const [isPending, startTransition] = useTransition()
  const [userActionPending, setUserActionPending] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, VendorDraft>>(() =>
    Object.fromEntries(
      vendors.map((vendor) => [
        vendor.businessId,
        {
          isVendorActive: vendor.isVendorActive,
          isDemo: vendor.isDemo,
          status: vendor.status,
          plan: normalizeVendorPlanCode(vendor.plan),
          balance: vendor.balance.toString(),
          currency: vendor.currency,
          accessStartAt: vendor.accessStartAt ? vendor.accessStartAt.slice(0, 10) : '',
          packageDurationDays: vendor.packageDurationDays?.toString() ?? '',
          notes: vendor.notes,
        },
      ])
    )
  )

  const maxTraffic = useMemo(
    () =>
      Math.max(
        1,
        ...traffic.points.map((point) =>
          Math.max(point.appointments, point.patients, point.messages, point.notifications)
        )
      ),
    [traffic.points]
  )

  function patchVendorDraft(businessId: string, patch: Partial<VendorDraft>) {
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
        isDemo: draft.isDemo,
        status: draft.status,
        plan: draft.plan,
        balance: Number(draft.balance),
        currency: draft.currency.trim().toUpperCase(),
        accessStartAt: draft.accessStartAt ? new Date(`${draft.accessStartAt}T00:00:00.000Z`).toISOString() : undefined,
        packageDurationDays: draft.packageDurationDays ? Number(draft.packageDurationDays) : undefined,
        notes: draft.notes.trim(),
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Vendor kaydı güncellendi')
    })
  }

  function toggleUser(userId: string, isActive: boolean) {
    setUserActionPending(userId)
    startTransition(async () => {
      const result = await setPlatformUserActive({ userId, isActive: !isActive })
      if (!result.ok) {
        toast.error(result.error)
      } else {
        toast.success(isActive ? 'Kullanıcı pasife alındı' : 'Kullanıcı tekrar aktive edildi')
      }
      setUserActionPending(null)
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-brand-ink">Super Admin Merkezi</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bu alan yalnızca `SUPER_ADMIN` rolü için açıktır. Platform genelinde vendor, kullanıcı ve sistem
              operasyonlarını tek merkezden yönetirsiniz.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
            <Shield className="h-4 w-4" />
            SUPER_ADMIN
          </span>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">{metric.label}</p>
            <p className="mt-2 text-2xl font-bold text-brand-ink">{metric.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-brand-ink">Self-serve paket ödemeleri</h2>
        <p className="text-sm text-muted-foreground">
          Klinikler Ayarlar → Abonelik üzerinden talep oluşturur. Elden/havale tahsilatını burada onaylayın.
        </p>
        <MembershipPaymentsAdmin payments={pendingMembershipPayments} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-teal" />
            <h2 className="text-base font-bold text-brand-ink">Sistem Trafiği (Son 30 Gün)</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Randevu, hasta kaydı, mesaj ve bildirim hacmini günlük düzeyde izleyin.
          </p>

          <div className="mt-4 overflow-x-auto">
            <div className="inline-grid min-w-[900px] grid-cols-[repeat(30,minmax(0,1fr))] items-end gap-2">
              {traffic.points.map((point) => {
                const appointmentsHeight = Math.max(6, Math.round((point.appointments / maxTraffic) * 110))
                const patientsHeight = Math.max(6, Math.round((point.patients / maxTraffic) * 110))
                const messagesHeight = Math.max(6, Math.round((point.messages / maxTraffic) * 110))
                const notificationsHeight = Math.max(6, Math.round((point.notifications / maxTraffic) * 110))

                return (
                  <div key={point.key} className="space-y-2">
                    <div className="flex h-32 items-end gap-1">
                      <span className="w-2 rounded-t bg-brand-teal" style={{ height: `${appointmentsHeight}px` }} />
                      <span className="w-2 rounded-t bg-brand-cyan" style={{ height: `${patientsHeight}px` }} />
                      <span className="w-2 rounded-t bg-blue-900" style={{ height: `${messagesHeight}px` }} />
                      <span className="w-2 rounded-t bg-violet-700" style={{ height: `${notificationsHeight}px` }} />
                    </div>
                    <p className="text-center text-[10px] text-muted-foreground">{point.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </article>

        <article className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-brand-ink">Operasyon Özeti</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatItem icon={CalendarCheck2} label="Bugünkü randevu" value={traffic.appointmentsToday.toString()} />
            <StatItem icon={Users} label="Bugün yeni hasta" value={traffic.patientsToday.toString()} />
            <StatItem icon={MessageSquareText} label="Bugünkü mesaj" value={traffic.messagesToday.toString()} />
            <StatItem icon={Building2} label="Bugünkü bildirim" value={traffic.notificationsToday.toString()} />
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-brand-ink">7 gün randevu: {traffic.appointmentsLast7d}</p>
            <p className="mt-1 text-muted-foreground">7 gün yeni hasta: {traffic.patientsLast7d}</p>
            <p className="mt-1 text-muted-foreground">7 gün mesaj: {traffic.messagesLast7d}</p>
            <p className="mt-1 text-muted-foreground">Ortalama günlük randevu: {traffic.averageDailyAppointments}</p>
            <p className="mt-1 text-muted-foreground">Pik gün randevu: {traffic.peakDayAppointments}</p>
            <p className="mt-1 text-muted-foreground">Bekleyen randevu: {traffic.pendingAppointments}</p>
            <p className="mt-1 text-muted-foreground">No-show (30g): %{traffic.noShowRate30d.toFixed(1)}</p>
            <p className="mt-1 text-muted-foreground">Süresi geçen hatırlatma: {traffic.overdueReminders}</p>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-700" />
          <h2 className="text-sm font-bold text-amber-900">Sistem Uyarıları</h2>
        </div>
        <div className="mt-3 space-y-2">
          {traffic.alerts.map((alert) => (
            <p key={alert} className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900">
              {alert}
            </p>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-brand-ink">Global Vendor Yönetimi</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Vendor üyelik statüsü, plan, bakiye ve platform erişimi tek tek yönetilir.
            </p>
          </div>
        </div>
        {!schemaReady && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            VendorAccount tablosu hazır değil. Kaydetme adımları bu yüzden pasif kalır.
          </div>
        )}
        <div className="mt-4 space-y-4">
          {vendors.slice(0, 60).map((vendor) => {
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
                      30g randevu: {vendor.appointments30d} • Toplam randevu: {vendor.appointmentsTotal} • Hasta:{' '}
                      {vendor.patients} • Team: {vendor.members} • Kayıt: {vendor.createdAt}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {vendor.isDemo ? 'Demo hesap' : 'Standart hesap'} • Paket: {getVendorPlanDefinition(vendor.plan).name}{' '}
                      • {describeAccessWindow(vendor.accessStartAt, vendor.accessEndAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      draft.isVendorActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {draft.isVendorActive ? 'Vendor Active' : 'Vendor Inactive'}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-8">
                  <label className="space-y-1 lg:col-span-1">
                    <span className="text-xs font-semibold text-slate-600">Platform erişimi</span>
                    <select
                      value={draft.isVendorActive ? 'active' : 'inactive'}
                      onChange={(event) =>
                        patchVendorDraft(vendor.businessId, { isVendorActive: event.target.value === 'active' })
                      }
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
                      onChange={(event) =>
                        patchVendorDraft(vendor.businessId, {
                          status: event.target.value as VendorMembershipStatusValue,
                        })
                      }
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
                    <span className="text-xs font-semibold text-slate-600">Demo hesabı</span>
                    <select
                      value={draft.isDemo ? 'demo' : 'paid'}
                      onChange={(event) =>
                        patchVendorDraft(vendor.businessId, {
                          isDemo: event.target.value === 'demo',
                        })
                      }
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    >
                      <option value="demo">Demo</option>
                      <option value="paid">Paid</option>
                    </select>
                  </label>

                  <label className="space-y-1 lg:col-span-1">
                    <span className="text-xs font-semibold text-slate-600">Plan</span>
                    <select
                      value={draft.plan}
                      onChange={(event) =>
                        patchVendorDraft(vendor.businessId, {
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
                      onChange={(event) => patchVendorDraft(vendor.businessId, { balance: event.target.value })}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    />
                  </label>

                  <label className="space-y-1 lg:col-span-1">
                    <span className="text-xs font-semibold text-slate-600">Para birimi</span>
                    <input
                      value={draft.currency}
                      onChange={(event) =>
                        patchVendorDraft(vendor.businessId, { currency: event.target.value.toUpperCase() })
                      }
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase"
                    />
                  </label>

                  <label className="space-y-1 lg:col-span-1">
                    <span className="text-xs font-semibold text-slate-600">Paket başlangıç</span>
                    <input
                      type="date"
                      value={draft.accessStartAt}
                      onChange={(event) =>
                        patchVendorDraft(vendor.businessId, {
                          accessStartAt: event.target.value,
                        })
                      }
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    />
                  </label>

                  <label className="space-y-1 lg:col-span-1">
                    <span className="text-xs font-semibold text-slate-600">Paket süresi (gün)</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={draft.packageDurationDays}
                      onChange={(event) =>
                        patchVendorDraft(vendor.businessId, {
                          packageDurationDays: event.target.value,
                        })
                      }
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
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
                    onChange={(event) => patchVendorDraft(vendor.businessId, { notes: event.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  />
                </label>
              </article>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-brand-ink">Kullanıcı Erişim Kontrolü</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Hesapları global olarak aktif/pasif yapabilirsiniz. Pasife alınan kullanıcıların ekip üyelikleri devre dışı
          bırakılır.
        </p>
        <div className="mt-4 space-y-3">
          {users.map((user) => (
            <article key={user.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-brand-ink">
                    {user.fullName} ({user.email})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rol: {user.role} • İşletme: {user.businessName} • Üyelik sayısı: {user.membershipsCount} • Bildirim:
                    {' '}{user.notificationsCount} • Kayıt: {user.createdAt}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    disabled={isPending || userActionPending === user.id || user.id === currentUserId}
                    onClick={() => toggleUser(user.id, user.isActive)}
                    className="h-9 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-brand-ink disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {user.isActive ? 'Pasife Al' : 'Aktif Et'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-brand-ink">Son Sistem Aktivitesi</h2>
        <p className="mt-1 text-xs text-muted-foreground">Bildirim kaynaklı son olay akışı.</p>
        <div className="mt-4 space-y-3">
          {recentActivity.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-bold text-brand-ink">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.businessName} • {item.type} • {item.actor} • {item.createdAt}
              </p>
              <p className="mt-2 text-sm text-slate-700">{item.message}</p>
            </article>
          ))}
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

function describeAccessWindow(startIso: string | null, endIso: string | null) {
  if (!startIso && !endIso) return 'Süre tanımı yok'
  const start = startIso ? new Date(startIso) : null
  const end = endIso ? new Date(endIso) : null
  const startText = start ? start.toLocaleDateString('tr-TR') : '-'
  const endText = end ? end.toLocaleDateString('tr-TR') : 'Süresiz'

  if (!end) return `${startText} → Süresiz`

  const remainingMs = end.getTime() - Date.now()
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000))

  if (remainingDays < 0) return `${startText} → ${endText} (Süre doldu)`
  if (remainingDays === 0) return `${startText} → ${endText} (Bugün bitiyor)`
  return `${startText} → ${endText} (${remainingDays} gün kaldı)`
}
