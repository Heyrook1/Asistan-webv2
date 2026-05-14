import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsCard } from '@/components/dashboard/stats-card'
import { RecentAppointments } from '@/components/dashboard/recent-appointments'
import { UpcomingAppointments } from '@/components/dashboard/upcoming-appointments'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  Star,
  Wallet
} from 'lucide-react'
import type { Appointment, Provider } from '@/lib/types'

export const metadata = {
  title: 'Genel Bakış',
}

export default async function DashboardPage() {
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

  // If no provider profile, show setup prompt
  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="rounded-full bg-primary/10 p-6 mb-6">
          <Calendar className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Hoş Geldiniz!</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          İşletme profilinizi oluşturarak randevu almaya başlayın.
        </p>
        <a
          href="/dashboard/settings/business"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Profil Oluştur
        </a>
      </div>
    )
  }

  // Get today's date
  const today = new Date().toISOString().split('T')[0]

  // Fetch stats
  const [
    { count: totalAppointments },
    { count: todayAppointments },
    { count: pendingAppointments },
    { data: recentAppointments },
    { data: upcomingAppointments },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', provider.id),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', provider.id)
      .eq('appointment_date', today),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', provider.id)
      .in('status', ['requested', 'pending_provider_approval']),
    supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(*, user:users(*)),
        service:services(*)
      `)
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(*, user:users(*)),
        service:services(*)
      `)
      .eq('provider_id', provider.id)
      .eq('status', 'confirmed')
      .gte('appointment_date', today)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(5),
  ])

  // Calculate revenue (confirmed + completed appointments)
  const { data: revenueData } = await supabase
    .from('appointments')
    .select('price')
    .eq('provider_id', provider.id)
    .in('status', ['confirmed', 'completed'])

  const totalRevenue = revenueData?.reduce((sum, apt) => sum + (apt.price || 0), 0) || 0

  // Get unique customers count
  const { count: uniqueCustomers } = await supabase
    .from('appointments')
    .select('customer_id', { count: 'exact', head: true })
    .eq('provider_id', provider.id)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Genel Bakış</h1>
        <p className="text-muted-foreground">
          {provider.business_name} için güncel istatistikler
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Bugünkü Randevular"
          value={todayAppointments || 0}
          icon={Calendar}
          description="Bugün için planlanan"
        />
        <StatsCard
          title="Bekleyen Onay"
          value={pendingAppointments || 0}
          icon={Clock}
          description="Onay bekleyen talepler"
        />
        <StatsCard
          title="Toplam Randevu"
          value={totalAppointments || 0}
          icon={Calendar}
          description="Tüm zamanlar"
        />
        <StatsCard
          title="Toplam Müşteri"
          value={uniqueCustomers || 0}
          icon={Users}
          description="Tekil müşteri sayısı"
        />
        <StatsCard
          title="Ortalama Puan"
          value={provider.average_rating?.toFixed(1) || '0.0'}
          icon={Star}
          description={`${provider.total_reviews || 0} değerlendirme`}
        />
        <StatsCard
          title="Toplam Gelir"
          value={`₺${totalRevenue.toLocaleString('tr-TR')}`}
          icon={Wallet}
          description="Onaylanan randevular"
        />
      </div>

      {/* Recent & Upcoming Appointments */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingAppointments appointments={(upcomingAppointments || []) as Appointment[]} />
        <RecentAppointments appointments={(recentAppointments || []) as Appointment[]} />
      </div>
    </div>
  )
}
