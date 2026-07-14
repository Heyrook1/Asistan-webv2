import { Suspense } from 'react'
import { requirePagePermission, can } from '@/lib/session'
import {
  getAnalyticsBreakdowns,
  getAnalyticsSnapshot,
  getAppointmentFunnel,
  getDashboardStats,
  getFinanceLedgerForExport,
  getStaffUtilization,
  parseAnalyticsMonthRange,
} from '@/lib/queries'
import { AnalyticsBoard } from '@/components/dashboard/analytics-board'
import { isFeatureEnabled } from '@/lib/feature-flags'

export const dynamic = 'force-dynamic'

export default async function AnalitikPage({
  searchParams,
}: {
  searchParams: Promise<{ months?: string }>
}) {
  const session = await requirePagePermission('analytics.view')
  const params = await searchParams
  const months = parseAnalyticsMonthRange(params.months)
  const canViewRevenue = can(session, 'analytics.revenue.view')
  const advanced = isFeatureEnabled('advancedAnalytics')

  const [stats, snapshot, breakdowns, financeLedger, funnel, utilization] = await Promise.all([
    getDashboardStats(session.businessId),
    getAnalyticsSnapshot(session.businessId, months),
    getAnalyticsBreakdowns(session.businessId, months),
    canViewRevenue && isFeatureEnabled('financeExport')
      ? getFinanceLedgerForExport(session.businessId, months)
      : Promise.resolve([]),
    advanced ? getAppointmentFunnel(session.businessId, months) : Promise.resolve(null),
    advanced ? getStaffUtilization(session.businessId, months) : Promise.resolve([]),
  ])

  return (
    <Suspense fallback={<div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">Analitik yükleniyor…</div>}>
      <AnalyticsBoard
        months={months}
        stats={{
          todayAppointments: stats.todayAppointments,
          activePatients: stats.activePatients,
          monthlyRevenue: stats.monthlyRevenue,
        }}
        snapshot={snapshot}
        byStaff={breakdowns.byStaff}
        byService={breakdowns.byService}
        financeLedger={financeLedger}
        funnel={funnel}
        utilization={utilization}
        canViewRevenue={canViewRevenue}
        cancellationRate={stats.cancellationRate}
      />
    </Suspense>
  )
}
