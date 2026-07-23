'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { CalendarDays, Download, FileText, TrendingUp, Wallet, Users, Calendar } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { downloadCsv, printReportAsPdf } from '@/lib/client-export'
import { formatTime, trMoney } from '@/lib/format'
import type {
  AnalyticsBreakdownRow,
  AnalyticsMonthPoint,
  AnalyticsMonthRange,
  AppointmentFunnel,
  FinanceLedgerRow,
  StaffUtilizationRow,
} from '@/lib/queries'
import { cn } from '@/lib/utils'

const MONTH_NAMES = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
const RANGE_OPTIONS: AnalyticsMonthRange[] = [3, 6, 12]

const revenueChartConfig = {
  revenue: { label: 'Ciro', color: '#0071E3' },
} satisfies ChartConfig

const volumeChartConfig = {
  completed: { label: 'Tamamlanan', color: '#10B981' },
  cancelled: { label: 'İptal / Gelinmedi', color: '#F43F5E' },
  total: { label: 'Toplam', color: '#94A3B8' },
} satisfies ChartConfig

function monthLabel(monthKey: string) {
  const [, month] = monthKey.split('-')
  return MONTH_NAMES[Number(month) - 1] ?? monthKey
}

export function AnalyticsBoard({
  months,
  stats,
  snapshot,
  byStaff,
  byService,
  financeLedger,
  funnel,
  utilization,
  canViewRevenue,
}: {
  months: AnalyticsMonthRange
  stats: {
    todayAppointments: number
    activePatients: number
    monthlyRevenue: number
  }
  snapshot: AnalyticsMonthPoint[]
  byStaff: AnalyticsBreakdownRow[]
  byService: AnalyticsBreakdownRow[]
  financeLedger: FinanceLedgerRow[]
  funnel: AppointmentFunnel | null
  utilization: StaffUtilizationRow[]
  canViewRevenue: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const chartData = useMemo(
    () =>
      snapshot.map((s) => ({
        ...s,
        label: monthLabel(s.month),
      })),
    [snapshot],
  )

  const totalRevenue = snapshot.reduce((acc, s) => acc + s.revenue, 0)
  const totalCompleted = snapshot.reduce((acc, s) => acc + s.completed, 0)
  const totalCancelled = snapshot.reduce((acc, s) => acc + s.cancelled, 0)
  const totalAppointments = snapshot.reduce((acc, s) => acc + s.total, 0)
  // Period-matched rate (not all-time dashboard stats) — honest overview.
  const periodCancellationRate =
    totalCompleted + totalCancelled > 0
      ? totalCancelled / (totalCompleted + totalCancelled)
      : 0

  function setMonths(next: AnalyticsMonthRange) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('months', String(next))
    router.push(`/dashboard/analitik?${params.toString()}`)
  }

  function summaryRows(): string[][] {
    return [
      ['Ay', 'Toplam randevu', 'Tamamlanan', 'İptal/Gelinmedi', ...(canViewRevenue ? ['Ciro'] : [])],
      ...snapshot.map((s) => [
        s.month,
        String(s.total),
        String(s.completed),
        String(s.cancelled),
        ...(canViewRevenue ? [String(s.revenue)] : []),
      ]),
    ]
  }

  function staffRows(): string[][] {
    return [
      ['Personel', 'Tamamlanan', ...(canViewRevenue ? ['Ciro'] : [])],
      ...byStaff.map((r) => [r.name, String(r.count), ...(canViewRevenue ? [String(r.revenue)] : [])]),
    ]
  }

  function serviceRows(): string[][] {
    return [
      ['Hizmet', 'Tamamlanan', ...(canViewRevenue ? ['Ciro'] : [])],
      ...byService.map((r) => [r.name, String(r.count), ...(canViewRevenue ? [String(r.revenue)] : [])]),
    ]
  }

  function ledgerRows(): string[][] {
    return [
      ['Tarih', 'Saat', 'Hasta', 'Hizmet', 'Personel', 'Tutar'],
      ...financeLedger.map((r) => [
        r.date,
        formatTime(r.startTime),
        r.patientName,
        r.serviceName,
        r.staffName ?? '',
        String(r.price),
      ]),
    ]
  }

  function exportSummaryCsv() {
    downloadCsv(`asistan-analitik-${months}ay.csv`, [
      ...summaryRows(),
      [],
      ...staffRows(),
      [],
      ...serviceRows(),
    ])
    toast.success('Özet CSV indirildi')
  }

  function exportFinanceCsv() {
    if (!canViewRevenue) {
      toast.error('Ciro dışa aktarma yetkiniz yok')
      return
    }
    if (financeLedger.length === 0) {
      toast.error('Dışa aktarılacak tamamlanmış randevu yok')
      return
    }
    downloadCsv(`asistan-finans-${months}ay.csv`, ledgerRows())
    toast.success('Finans CSV indirildi')
  }

  function exportPdf() {
    const sections = [
      { heading: 'Aylık özet', rows: summaryRows() },
      { heading: 'Personel kırılımı', rows: staffRows() },
      { heading: 'Hizmet kırılımı', rows: serviceRows() },
    ]
    if (canViewRevenue && financeLedger.length > 0) {
      sections.push({ heading: 'Finans defteri (tamamlanan)', rows: ledgerRows() })
    }
    const ok = printReportAsPdf({
      title: 'Asistan Operasyon Raporu',
      subtitle: `Son ${months} ay · ${new Date().toLocaleString('tr-TR')} · ölçülen randevu/ciro`,
      sections,
    })
    if (!ok) toast.error('Açılır pencere engellendi — tarayıcıda pop-up’a izin verin')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Operasyon raporu</h1>
          <p className="text-sm text-muted-foreground">
            Son {months} ay — randevu ve ciro sayıları (ölçülen veri; tahmin yüzdesi yok)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-slate-200 bg-white p-1">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMonths(option)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  months === option
                    ? 'bg-brand-blue text-white'
                    : 'text-slate-600 hover:bg-slate-50',
                )}
              >
                {option} ay
              </button>
            ))}
          </div>
          <Button type="button" variant="outline" className="h-9 gap-2" onClick={exportSummaryCsv}>
            <Download className="h-4 w-4" />
            Özet CSV
          </Button>
          {canViewRevenue && (
            <Button type="button" variant="outline" className="h-9 gap-2" onClick={exportFinanceCsv}>
              <Download className="h-4 w-4" />
              Finans CSV
            </Button>
          )}
          <Button type="button" variant="outline" className="h-9 gap-2" onClick={exportPdf}>
            <FileText className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Calendar} label="Bugünkü Randevu" value={stats.todayAppointments.toString()} />
        <StatCard icon={Users} label="Aktif Hasta" value={stats.activePatients.toString()} />
        <StatCard
          icon={Wallet}
          label="Bu ay ciro"
          value={canViewRevenue ? trMoney.format(stats.monthlyRevenue) : 'Yetkisiz'}
        />
        <StatCard
          icon={TrendingUp}
          label={`${months} aylık ciro`}
          value={canViewRevenue ? trMoney.format(totalRevenue) : 'Yetkisiz'}
        />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-brand-ink">Aylık ciro</p>
            {canViewRevenue && (
              <p className="text-xs text-muted-foreground">Toplam {trMoney.format(totalRevenue)}</p>
            )}
          </div>
          {!canViewRevenue ? (
            <AnalyticsEmpty
              title="Ciro yetkisi yok"
              description="Ciro verilerini görüntüleme yetkiniz yok. İşletme sahibi veya yetkili bir rolden erişin."
              actionHref="/dashboard/takim"
              actionLabel="Takım yetkileri"
            />
          ) : totalRevenue === 0 ? (
            <AnalyticsEmpty
              title="Henüz ciro verisi yok"
              description="Tamamlanan randevular oluştuktan sonra aylık ciro burada görünür."
              actionHref="/dashboard/ajanda"
              actionLabel="Ajanda"
              secondaryHref="/dashboard/ayarlar?tab=isletme"
              secondaryLabel="Randevu linkini paylaş"
            />
          ) : (
            <ChartContainer config={revenueChartConfig} className="aspect-[16/7] w-full">
              <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => trMoney.format(Number(value))}
                    />
                  }
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-brand-ink">Randevu hacmi</p>
              <p className="text-xs text-muted-foreground">{totalAppointments} randevu</p>
            </div>
            {totalAppointments === 0 ? (
              <AnalyticsEmpty
                title="Seçilen dönemde randevu yok"
                description="Dönemi genişletin veya randevu linkini paylaşarak talep toplayın; hacim grafiği ölçülen randevularla dolar."
                actionHref="/dashboard/ajanda"
                actionLabel="Ajanda"
                secondaryHref="/dashboard/ayarlar?tab=isletme"
                secondaryLabel="Randevu linkini paylaş"
              />
            ) : (
              <ChartContainer config={volumeChartConfig} className="aspect-[16/9] w-full">
                <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="completed" stackId="a" fill="var(--color-completed)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="cancelled" stackId="a" fill="var(--color-cancelled)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="mb-4 text-sm font-semibold text-brand-ink">İptal vs tamamlama</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border bg-dashboard-surface p-4">
                <p className="text-2xl font-bold text-emerald-600">{totalCompleted}</p>
                <p className="text-[11px] text-muted-foreground">Tamamlanan</p>
              </div>
              <div className="rounded-xl border bg-dashboard-surface p-4">
                <p className="text-2xl font-bold text-rose-600">{totalCancelled}</p>
                <p className="text-[11px] text-muted-foreground">İptal / Gelinmedi</p>
              </div>
              <div className="rounded-xl border bg-dashboard-surface p-4">
                <p className="text-2xl font-bold text-brand-ink">
                  {(periodCancellationRate * 100).toFixed(1)}%
                </p>
                <p className="text-[11px] text-muted-foreground">İptal oranı (seçilen dönem)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <BreakdownCard
          title="Personel kırılımı"
          emptyTitle="Tamamlanan randevulu personel yok"
          emptyDescription="Personel kırılımı, tamamlanan randevular oluştukça burada listelenir."
          emptyActionHref="/dashboard/takim"
          emptyActionLabel="Takımı yönet"
          rows={byStaff}
          canViewRevenue={canViewRevenue}
        />
        <BreakdownCard
          title="Hizmet kırılımı"
          emptyTitle="Tamamlanan randevulu hizmet yok"
          emptyDescription="Hizmet kırılımı için tamamlanan randevu gerekir. Önce hizmetleri yayınlayın."
          emptyActionHref="/dashboard/hizmetler"
          emptyActionLabel="Hizmetleri yönet"
          rows={byService}
          canViewRevenue={canViewRevenue}
        />
      </div>

      {funnel ? (
        <Card>
          <CardContent className="p-5">
            <p className="mb-4 text-sm font-semibold text-brand-ink">Randevu hunisi (gelinmedi dahil)</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <FunnelStat label="Bekleyen" value={funnel.scheduled} />
              <FunnelStat label="Onaylı" value={funnel.confirmed} />
              <FunnelStat label="Tamamlanan" value={funnel.completed} />
              <FunnelStat label="İptal" value={funnel.cancelled} />
              <FunnelStat label="Gelmedi" value={funnel.noShow} />
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>
                Tamamlama oranı:{' '}
                <strong className="text-brand-ink">{(funnel.completionRate * 100).toFixed(1)}%</strong>
              </span>
              <span>
                Gelinmedi oranı:{' '}
                <strong className="text-brand-ink">{(funnel.noShowRate * 100).toFixed(1)}%</strong>
              </span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {utilization.length > 0 ? (
        <Card>
          <CardContent className="p-5">
            <p className="mb-4 text-sm font-semibold text-brand-ink">Personel kullanımı</p>
            <ul className="space-y-2">
              {utilization.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-dashboard-surface px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-ink">{row.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {row.completed} tamamlanan · {row.noShow} gelmedi · {row.cancelled} iptal ·{' '}
                      {row.totalBooked} toplam
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-brand-ink">
                    %{(row.utilization * 100).toFixed(0)}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function AnalyticsEmpty({
  title,
  description,
  actionHref,
  actionLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string
  description: string
  actionHref: string
  actionLabel: string
  secondaryHref?: string
  secondaryLabel?: string
}) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center"
    >
      <CalendarDays className="mx-auto size-8 text-slate-400" aria-hidden />
      <p className="mt-3 text-sm font-semibold text-brand-ink">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button asChild className="h-11 min-h-11 bg-brand-blue text-white hover:bg-brand-blue/90">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
        {secondaryHref && secondaryLabel ? (
          <Button asChild variant="outline" className="h-11 min-h-11">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function FunnelStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-dashboard-surface p-3 text-center">
      <p className="text-xl font-bold text-brand-ink">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function BreakdownCard({
  title,
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
  rows,
  canViewRevenue,
}: {
  title: string
  emptyTitle: string
  emptyDescription: string
  emptyActionHref: string
  emptyActionLabel: string
  rows: AnalyticsBreakdownRow[]
  canViewRevenue: boolean
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="mb-4 text-sm font-semibold text-brand-ink">{title}</p>
        {rows.length === 0 ? (
          <AnalyticsEmpty
            title={emptyTitle}
            description={emptyDescription}
            actionHref={emptyActionHref}
            actionLabel={emptyActionLabel}
            secondaryHref="/dashboard/ajanda"
            secondaryLabel="Ajanda"
          />
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-xl border bg-dashboard-surface px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brand-ink">{row.name}</p>
                  <p className="text-[11px] text-muted-foreground">{row.count} tamamlanan</p>
                </div>
                {canViewRevenue && (
                  <p className="shrink-0 text-sm font-semibold text-brand-ink">
                    {trMoney.format(row.revenue)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar
  label: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
          <p className="text-lg font-bold text-brand-ink">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
