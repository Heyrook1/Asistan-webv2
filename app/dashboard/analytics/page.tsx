import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/dashboard/stats-card'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Wallet,
  Star,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import type { Provider } from '@/lib/types'

export const metadata = {
  title: 'Analitik',
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get provider
  const { data: provider } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: Provider | null }

  if (!provider) {
    redirect('/dashboard')
  }

  // Get date ranges
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]

  // Fetch analytics data
  const [
    { count: totalAppointments },
    { count: completedAppointments },
    { count: cancelledAppointments },
    { count: thisMonthAppointments },
    { count: lastMonthAppointments },
    { data: revenueData },
    { data: thisMonthRevenue },
    { data: lastMonthRevenue },
    { count: uniqueCustomers },
  ] = await Promise.all([
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('provider_id', provider.id),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('provider_id', provider.id).eq('status', 'completed'),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('provider_id', provider.id).in('status', ['cancelled_by_customer', 'cancelled_by_provider', 'rejected']),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('provider_id', provider.id).gte('appointment_date', thisMonthStart),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('provider_id', provider.id).gte('appointment_date', lastMonthStart).lte('appointment_date', lastMonthEnd),
    supabase.from('appointments').select('price').eq('provider_id', provider.id).in('status', ['confirmed', 'completed']),
    supabase.from('appointments').select('price').eq('provider_id', provider.id).in('status', ['confirmed', 'completed']).gte('appointment_date', thisMonthStart),
    supabase.from('appointments').select('price').eq('provider_id', provider.id).in('status', ['confirmed', 'completed']).gte('appointment_date', lastMonthStart).lte('appointment_date', lastMonthEnd),
    supabase.from('appointments').select('customer_id', { count: 'exact', head: true }).eq('provider_id', provider.id),
  ])

  // Calculate totals
  const totalRevenue = revenueData?.reduce((sum, apt) => sum + (apt.price || 0), 0) || 0
  const thisMonthRevenueTotal = thisMonthRevenue?.reduce((sum, apt) => sum + (apt.price || 0), 0) || 0
  const lastMonthRevenueTotal = lastMonthRevenue?.reduce((sum, apt) => sum + (apt.price || 0), 0) || 0

  // Calculate trends
  const appointmentTrend = lastMonthAppointments 
    ? Math.round(((thisMonthAppointments || 0) - lastMonthAppointments) / lastMonthAppointments * 100)
    : 0
  const revenueTrend = lastMonthRevenueTotal 
    ? Math.round((thisMonthRevenueTotal - lastMonthRevenueTotal) / lastMonthRevenueTotal * 100)
    : 0

  // Calculate completion rate
  const completionRate = totalAppointments 
    ? Math.round((completedAppointments || 0) / totalAppointments * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analitik</h1>
        <p className="text-muted-foreground">
          İşletmenizin performans metrikleri
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Toplam Gelir"
          value={`₺${totalRevenue.toLocaleString('tr-TR')}`}
          icon={Wallet}
          trend={revenueTrend !== 0 ? { value: revenueTrend, label: 'geçen aya göre' } : undefined}
        />
        <StatsCard
          title="Toplam Randevu"
          value={totalAppointments || 0}
          icon={Calendar}
          trend={appointmentTrend !== 0 ? { value: appointmentTrend, label: 'geçen aya göre' } : undefined}
        />
        <StatsCard
          title="Toplam Müşteri"
          value={uniqueCustomers || 0}
          icon={Users}
        />
        <StatsCard
          title="Ortalama Puan"
          value={provider.average_rating?.toFixed(1) || '0.0'}
          icon={Star}
          description={`${provider.total_reviews || 0} değerlendirme`}
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Randevu Durumları</CardTitle>
            <CardDescription>Tüm zamanlar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Tamamlanan</span>
              </div>
              <span className="font-semibold">{completedAppointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">İptal/Ret</span>
              </div>
              <span className="font-semibold">{cancelledAppointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Diğer</span>
              </div>
              <span className="font-semibold">
                {(totalAppointments || 0) - (completedAppointments || 0) - (cancelledAppointments || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tamamlanma Oranı</CardTitle>
            <CardDescription>Başarılı randevular</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{completionRate}%</div>
              <div className="flex-1">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {completedAppointments || 0} / {totalAppointments || 0} randevu
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bu Ay</CardTitle>
            <CardDescription>Aylık performans</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Randevu</span>
              <span className="font-semibold">{thisMonthAppointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gelir</span>
              <span className="font-semibold">₺{thisMonthRevenueTotal.toLocaleString('tr-TR')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ort. Randevu Değeri</span>
              <span className="font-semibold">
                ₺{thisMonthAppointments ? Math.round(thisMonthRevenueTotal / thisMonthAppointments).toLocaleString('tr-TR') : 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
