import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppointmentsList } from '@/components/dashboard/appointments-list'
import { AppointmentsFilters } from '@/components/dashboard/appointments-filters'
import type { Appointment, AppointmentStatus } from '@/lib/types'

export const metadata = {
  title: 'Randevular',
}

interface PageProps {
  searchParams: Promise<{
    status?: string
    date?: string
    search?: string
  }>
}

export default async function AppointmentsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get provider
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!provider) {
    redirect('/dashboard')
  }

  // Build query
  let query = supabase
    .from('appointments')
    .select(`
      *,
      customer:customers(*, user:users(*)),
      service:services(*)
    `)
    .eq('provider_id', provider.id)
    .order('appointment_date', { ascending: false })
    .order('start_time', { ascending: false })

  // Apply filters
  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status as AppointmentStatus)
  }

  if (params.date) {
    query = query.eq('appointment_date', params.date)
  }

  const { data: appointments } = await query

  // Get appointment counts by status
  const { data: statusCounts } = await supabase
    .from('appointments')
    .select('status')
    .eq('provider_id', provider.id)

  const counts = {
    all: statusCounts?.length || 0,
    requested: statusCounts?.filter(a => a.status === 'requested').length || 0,
    pending_provider_approval: statusCounts?.filter(a => a.status === 'pending_provider_approval').length || 0,
    confirmed: statusCounts?.filter(a => a.status === 'confirmed').length || 0,
    completed: statusCounts?.filter(a => a.status === 'completed').length || 0,
    cancelled: statusCounts?.filter(a => 
      a.status === 'cancelled_by_customer' || 
      a.status === 'cancelled_by_provider' ||
      a.status === 'rejected'
    ).length || 0,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Randevular</h1>
        <p className="text-muted-foreground">
          Tüm randevularınızı görüntüleyin ve yönetin
        </p>
      </div>

      {/* Filters */}
      <AppointmentsFilters 
        currentStatus={params.status || 'all'} 
        currentDate={params.date}
        counts={counts}
      />

      {/* Appointments List */}
      <AppointmentsList 
        appointments={(appointments || []) as Appointment[]} 
        providerId={provider.id}
      />
    </div>
  )
}
