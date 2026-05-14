import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AvailabilityEditor } from '@/components/dashboard/availability-editor'
import type { CalendarAvailability } from '@/lib/types'

export const metadata = {
  title: 'Müsaitlik',
}

export default async function AvailabilityPage() {
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

  // Fetch availability
  const { data: availability } = await supabase
    .from('calendar_availability')
    .select('*')
    .eq('provider_id', provider.id)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Müsaitlik Ayarları</h1>
        <p className="text-muted-foreground">
          Haftalık çalışma saatlerinizi belirleyin
        </p>
      </div>

      {/* Availability Editor */}
      <AvailabilityEditor 
        availability={(availability || []) as CalendarAvailability[]}
        providerId={provider.id}
      />
    </div>
  )
}
