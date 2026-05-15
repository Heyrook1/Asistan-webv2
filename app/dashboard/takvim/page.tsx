import { AdvancedCalendar } from '@/components/dashboard/advanced-calendar'
import { getDashboardContext } from '@/lib/dashboard-context'
import { enforceRouteAccess, hasCapability } from '@/lib/access'
import type { Appointment } from '@/lib/types'

export default async function TakvimPage() {
  const { supabase, provider, teamMember } = await getDashboardContext()
  enforceRouteAccess('/dashboard/takvim', teamMember)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, service:services(*)')
    .eq('provider_id', provider.id)
    .gte('appointment_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .lte('appointment_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

  return <AdvancedCalendar providerId={provider.id} initialAppointments={(appointments || []) as Appointment[]} canEdit={hasCapability(teamMember, 'edit_appointments')} />
}
