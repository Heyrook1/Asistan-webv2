'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, CreditCard, Mail } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  cancelPendingMembershipPayment,
  requestMembershipUpgrade,
  type MembershipPaymentView,
} from '@/lib/actions/membership-payment'
import {
  VENDOR_MEMBERSHIP_LABELS,
  buildMembershipRenewMailto,
  daysUntilAccessEnd,
  getMembershipUrgency,
  getVendorPlanPrice,
  listVendorPlans,
  type MembershipBillingPeriodValue,
  type MembershipUrgency,
  type VendorMembershipStatusValue,
} from '@/lib/vendor-membership'
import { cn } from '@/lib/utils'

export type MembershipSnapshot = {
  businessId: string
  businessName: string
  planCode: string
  planName: string
  status: string
  isDemo: boolean
  accessStartAt: string | null
  accessEndAt: string | null
  userLimit: number | null
}

function statusLabel(status: string) {
  const key = status.toUpperCase() as VendorMembershipStatusValue
  return VENDOR_MEMBERSHIP_LABELS[key] ?? status
}

function urgencyStyles(urgency: MembershipUrgency) {
  switch (urgency) {
    case 'expired':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'critical':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'soon':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
  }
}

export function MembershipPanel({
  membership,
  pendingPayment = null,
  selfServeEnabled = true,
  isOwner = false,
}: {
  membership: MembershipSnapshot | null
  pendingPayment?: MembershipPaymentView | null
  selfServeEnabled?: boolean
  isOwner?: boolean
}) {
  const router = useRouter()
  const [period, setPeriod] = useState<MembershipBillingPeriodValue>('MONTHLY')
  const [pending, startTransition] = useTransition()

  if (!membership) {
    return (
      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-semibold text-brand-ink">Abonelik kaydı bulunamadı</p>
          <p className="text-sm text-muted-foreground">
            Paket bilgisi henüz oluşturulmamış olabilir. Elden kurulum için ekibimizle iletişime geçin.
          </p>
          <Button asChild className="bg-brand-blue text-white hover:bg-brand-blue-hover">
            <a href="mailto:merhaba@asistan.online?subject=Paket%20kurulum%20talebi">E-posta gönder</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const urgency = getMembershipUrgency({
    accessEndAt: membership.accessEndAt,
    status: membership.status,
  })
  const daysLeft = daysUntilAccessEnd(membership.accessEndAt)
  const renewHref = buildMembershipRenewMailto({
    businessName: membership.businessName,
    businessId: membership.businessId,
    planName: membership.isDemo ? `Demo · ${membership.planName}` : membership.planName,
    accessEndAt: membership.accessEndAt,
  })
  const plans = listVendorPlans({ includeDemo: false })

  const endText = membership.accessEndAt
    ? new Date(membership.accessEndAt).toLocaleDateString('tr-TR')
    : 'Süresiz'
  const startText = membership.accessStartAt
    ? new Date(membership.accessStartAt).toLocaleDateString('tr-TR')
    : '—'

  let urgencyMessage = 'Paketiniz aktif görünüyor.'
  if (urgency === 'expired') {
    urgencyMessage = 'Erişim süresi dolmuş veya paket askıda. Yenileme için yükseltme talebi oluşturun.'
  } else if (urgency === 'critical' && daysLeft !== null) {
    urgencyMessage = `Erişiminizin bitmesine ${daysLeft} gün kaldı. Yenilemeyi şimdiden planlayın.`
  } else if (urgency === 'soon' && daysLeft !== null) {
    urgencyMessage = `Erişiminizin bitmesine ${daysLeft} gün kaldı.`
  }

  function requestPlan(planCode: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE') {
    if (!isOwner) {
      toast.error('Yalnızca işletme sahibi paket yükseltebilir')
      return
    }
    startTransition(async () => {
      const result = await requestMembershipUpgrade({ planCode, billingPeriod: period })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Ödeme talebi oluşturuldu — onay bekleniyor')
      router.refresh()
    })
  }

  function cancelPending() {
    if (!pendingPayment) return
    startTransition(async () => {
      const result = await cancelPendingMembershipPayment(pendingPayment.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Bekleyen ödeme iptal edildi')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue">Paket durumu</p>
              <h2 className="mt-1 text-xl font-bold text-brand-ink">
                {membership.isDemo ? `Demo · ${membership.planName}` : membership.planName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{membership.businessName}</p>
            </div>
            <Badge
              className={cn(
                membership.status === 'ACTIVE' && 'bg-emerald-600 text-white',
                membership.status === 'TRIAL' && 'bg-brand-blue text-white',
                (membership.status === 'SUSPENDED' || membership.status === 'CANCELLED') &&
                  'bg-rose-600 text-white',
              )}
            >
              {statusLabel(membership.status)}
            </Badge>
          </div>

          <div className={cn('flex gap-3 rounded-xl border p-3.5 text-sm', urgencyStyles(urgency))}>
            {urgency === 'ok' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <p className="font-medium leading-relaxed">{urgencyMessage}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Başlangıç" value={startText} />
            <Metric label="Bitiş" value={endText} />
            <Metric
              label="Kalan gün"
              value={daysLeft === null ? '—' : daysLeft <= 0 ? 'Doldu' : String(daysLeft)}
            />
            <Metric
              label="Kullanıcı limiti"
              value={membership.userLimit === null ? 'Sınırsız' : String(membership.userLimit)}
            />
          </div>

          {pendingPayment ? (
            <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-amber-950">Ödeme bekleniyor</p>
                  <p className="mt-1 text-xs text-amber-900/80">
                    {pendingPayment.planName} ·{' '}
                    {pendingPayment.billingPeriod === 'YEARLY' ? 'Yıllık' : 'Aylık'} ·{' '}
                    {pendingPayment.amount} {pendingPayment.currency} · {pendingPayment.provider}
                  </p>
                </div>
                <Badge className="bg-amber-600 text-white">PENDING</Badge>
              </div>
              {pendingPayment.instructions ? (
                <pre className="whitespace-pre-wrap rounded-lg bg-white/80 p-3 text-xs text-slate-700">
                  {pendingPayment.instructions}
                </pre>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {isOwner ? (
                  <Button type="button" variant="outline" size="sm" disabled={pending} onClick={cancelPending}>
                    Talebi iptal et
                  </Button>
                ) : null}
                <Button asChild variant="ghost" size="sm">
                  <a href={renewHref}>
                    <Mail className="mr-1.5 size-3.5" />
                    E-posta yedek kanal
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                <p>
                  Self-serve yükseltme talebi oluşturun; ödeme{' '}
                  <strong className="text-brand-ink">elden / havale</strong> veya yapılandırılmışsa Stripe ile
                  alınır. Onay sonrası paket otomatik etkinleşir.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href={renewHref}>
                <Mail className="mr-2 h-4 w-4" />
                E-posta ile talep
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">İletişim formu</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/fiyatlandirma">Fiyatlandırmayı gör</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-brand-ink">Plan yükselt / yenile</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Talep → ödeme bekleniyor → admin/Stripe onayı → erişim uzar.
              </p>
            </div>
            <div className="flex rounded-full border p-1">
              <button
                type="button"
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold',
                  period === 'MONTHLY' ? 'bg-brand-blue text-white' : 'text-slate-600'
                )}
                onClick={() => setPeriod('MONTHLY')}
              >
                Aylık
              </button>
              <button
                type="button"
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold',
                  period === 'YEARLY' ? 'bg-brand-blue text-white' : 'text-slate-600'
                )}
                onClick={() => setPeriod('YEARLY')}
              >
                Yıllık
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {plans.map((plan) => {
              const current = plan.code === membership.planCode && !membership.isDemo
              const price = getVendorPlanPrice(plan.code, period)
              const canRequest =
                selfServeEnabled &&
                isOwner &&
                !pendingPayment &&
                Boolean(price) &&
                plan.code !== 'DEMO_14_DAYS' &&
                (membership.isDemo || plan.code !== membership.planCode || urgency !== 'ok')

              return (
                <div
                  key={plan.code}
                  className={cn(
                    'rounded-xl border p-4',
                    current ? 'border-brand-blue bg-brand-blue/5' : 'border-slate-200 bg-white',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-brand-ink">{plan.name}</p>
                    {current && (
                      <Badge variant="secondary" className="bg-brand-blue/10 text-brand-blue">
                        Mevcut
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                  <p className="mt-3 text-sm font-semibold text-brand-ink">
                    {price
                      ? period === 'YEARLY'
                        ? `${price.amount.toLocaleString('tr-TR')} ${price.currency}/yıl`
                        : `${price.amount.toLocaleString('tr-TR')} ${price.currency}/ay`
                      : 'İletişime geçiniz'}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex gap-1.5 text-xs text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-blue" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {!price && plan.code !== 'DEMO_14_DAYS' ? (
                    <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                      <Link href="/contact">İletişime geç</Link>
                    </Button>
                  ) : selfServeEnabled && plan.code !== 'DEMO_14_DAYS' ? (
                    <Button
                      type="button"
                      size="sm"
                      className="mt-3 w-full bg-brand-blue text-white hover:bg-brand-blue-hover"
                      disabled={!canRequest || pending}
                      onClick={() =>
                        requestPlan(plan.code as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE')
                      }
                    >
                      {current && urgency === 'ok' && !membership.isDemo
                        ? 'Aktif plan'
                        : pending
                          ? 'Gönderiliyor…'
                          : 'Yükselt / yenile'}
                    </Button>
                  ) : null}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-brand-ink">{value}</p>
    </div>
  )
}
