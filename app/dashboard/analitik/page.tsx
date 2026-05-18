import { Card, CardContent } from '@/components/ui/card'
import { requirePermission } from '@/lib/session'
import { getAnalyticsSnapshot, getDashboardStats } from '@/lib/queries'
import { trMoney } from '@/lib/format'
import { TrendingUp, Wallet, Users, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

const MONTH_NAMES = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

export default async function AnalitikPage() {
  const session = await requirePermission('analytics.view')
  const [stats, snapshot] = await Promise.all([
    getDashboardStats(session.businessId),
    getAnalyticsSnapshot(session.businessId),
  ])

  const maxRevenue = Math.max(...snapshot.map((s) => s.revenue), 1)
  const totalRevenue = snapshot.reduce((acc, s) => acc + s.revenue, 0)
  const totalCompleted = snapshot.reduce((acc, s) => acc + s.completed, 0)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0C1D36]">Analitik</h1>
        <p className="text-sm text-muted-foreground">Son 6 ay performans özeti</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Calendar} label="Bugünkü Randevu" value={stats.todayAppointments.toString()} />
        <StatCard icon={Users} label="Aktif Hasta" value={stats.activePatients.toString()} />
        <StatCard icon={Wallet} label="Aylık Ciro" value={trMoney.format(stats.monthlyRevenue)} />
        <StatCard icon={TrendingUp} label="6 Aylık Ciro" value={trMoney.format(totalRevenue)} />
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-[#0C1D36] mb-4">Aylık Ciro</p>
          {totalRevenue === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz ciro verisi yok. Tamamlanan randevular oluştuktan sonra burada görünür.</p>
          ) : (
            <div className="flex items-end gap-3 h-48">
              {snapshot.map((s) => {
                const [, month] = s.month.split('-')
                const height = (s.revenue / maxRevenue) * 100
                return (
                  <div key={s.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-[#12C8AD] to-[#16A9E8]"
                        style={{ height: `${Math.max(4, height)}%` }}
                        title={trMoney.format(s.revenue)}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{MONTH_NAMES[Number(month) - 1]}</p>
                    <p className="text-[10px] font-medium text-[#0C1D36]">{trMoney.format(s.revenue)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-[#0C1D36] mb-4">Aylık Randevu Adetleri</p>
            <div className="space-y-3">
              {snapshot.map((s) => {
                const [, month] = s.month.split('-')
                return (
                  <div key={s.month} className="flex items-center gap-3">
                    <span className="w-10 text-xs text-muted-foreground">{MONTH_NAMES[Number(month) - 1]}</span>
                    <div className="flex-1 h-2 rounded-full bg-[#F0F3F7] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#12C8AD]"
                        style={{ width: `${s.total === 0 ? 0 : Math.min(100, (s.total / Math.max(...snapshot.map((x) => x.total), 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-medium">{s.total}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-[#0C1D36] mb-4">İptal vs Tamamlama</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border bg-[#F7F9FB] p-4">
                <p className="text-2xl font-bold text-emerald-600">{totalCompleted}</p>
                <p className="text-[11px] text-muted-foreground">Tamamlanan</p>
              </div>
              <div className="rounded-xl border bg-[#F7F9FB] p-4">
                <p className="text-2xl font-bold text-rose-600">{snapshot.reduce((acc, s) => acc + s.cancelled, 0)}</p>
                <p className="text-[11px] text-muted-foreground">İptal/No-Show</p>
              </div>
              <div className="rounded-xl border bg-[#F7F9FB] p-4">
                <p className="text-2xl font-bold text-[#0C1D36]">{(stats.cancellationRate * 100).toFixed(1)}%</p>
                <p className="text-[11px] text-muted-foreground">İptal Oranı</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <Icon className="mb-2 h-5 w-5 text-[#12C8AD]" />
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-[#0C1D36]">{value}</p>
      </CardContent>
    </Card>
  )
}
