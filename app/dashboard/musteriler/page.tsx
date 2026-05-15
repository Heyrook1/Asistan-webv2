import { CustomerManagement } from '@/components/dashboard/customer-management'
import { getDashboardContext } from '@/lib/dashboard-context'
import { enforceRouteAccess } from '@/lib/access'

export default async function MusterilerPage() {
  const { supabase, teamMember } = await getDashboardContext()
  enforceRouteAccess('/dashboard/musteriler', teamMember)

  const { data } = await supabase
    .from('customers')
    .select('id, notes, user:users(full_name,phone,email)')
    .order('created_at', { ascending: false })
    .limit(50)

  const initialCustomers = (data || []).map((row: any) => ({
    id: row.id,
    name: row.user?.full_name || 'Musteri',
    phone: row.user?.phone || '-',
    email: row.user?.email || '-',
    notes: row.notes || '',
    tags: ['Musteri'],
  }))

  return <CustomerManagement initialCustomers={initialCustomers} />
}
