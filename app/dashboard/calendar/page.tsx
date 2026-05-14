import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarView } from '@/components/dashboard/calendar-view'
import type { Appointment } from '@/lib/types'

export const metadata = {
  title: 'Takvim',
}

interface PageProps {
  searchParams: Promise<{
    month?: string
    year?: string
  }>
}

export default async function CalendarPage({ searchParams }: PageProps) {
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

  // Get current month/year from params or use current date
  const now = new Date()
  const month = params.month ? parseInt(params.month) : now.getMonth()
  const year = params.year ? parseInt(params.year) : now.getFullYear()

  // Calculate date range for the month
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)

  // Fetch appointments for the month
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      customer:customers(*, user:users(*)),
      service:services(*)
    `)
    .eq('provider_id', provider.id)
    .gte('appointment_date', startDate.toISOString().split('T')[0])
    .lte('appointment_date', endDate.toISOString().split('T')[0])
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Takvim</h1>
        <p className="text-muted-foreground">
          Randevularınızı takvim görünümünde inceleyin
        </p>
      </div>

      {/* Calendar View */}
      <CalendarView 
        appointments={(appointments || []) as Appointment[]}
        currentMonth={month}
        currentYear={year}
      />
    </div>
  )
}
