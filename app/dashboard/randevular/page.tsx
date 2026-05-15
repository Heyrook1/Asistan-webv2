import { AppointmentManagement } from '@/components/dashboard/appointment-management'
import { getDashboardContext } from '@/lib/dashboard-context'
import { enforceRouteAccess, hasCapability } from '@/lib/access'
import type { Appointment } from '@/lib/types'

export default async function RandevularPage() {
  const { supabase, provider, teamMember } = await getDashboardContext()
  enforceRouteAccess('/dashboard/randevular', teamMember)

  const [{ data: appointments }, { data: customers }, { data: services }] = await Promise.all([
    supabase
      .from('appointments')
      .select('*, customer:customers(*, user:users(*)), service:services(*)')
      .eq('provider_id', provider.id)
      .order('appointment_date', { ascending: false })
      .limit(50),
    supabase.from('customers').select('id').limit(1),
    supabase.from('services').select('id').eq('provider_id', provider.id).limit(1),
  ])

  return (
    <AppointmentManagement
      providerId={provider.id}
      initialAppointments={(appointments || []) as Appointment[]}
      canEdit={hasCapability(teamMember, 'edit_appointments')}
      defaultCustomerId={customers?.[0]?.id ?? null}
      defaultServiceId={services?.[0]?.id ?? null}
    />
  )
}
