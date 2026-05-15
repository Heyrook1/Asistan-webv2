import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CustomersList } from '@/components/dashboard/customers-list'

export const metadata = {
  title: 'Müşteriler',
}

export default async function CustomersPage() {
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

  // Fetch unique customers who have appointments with this provider
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      customer_id,
      customer:customers(*, user:users(*))
    `)
    .eq('provider_id', provider.id)

  // Get unique customers
  const customersMap = new Map()
  appointments?.forEach((apt) => {
    if (apt.customer && !customersMap.has(apt.customer_id)) {
      customersMap.set(apt.customer_id, apt.customer)
    }
  })
  const customers = Array.from(customersMap.values())

  // Get appointment counts per customer
  const customerStats: Record<string, { total: number; completed: number }> = {}
  appointments?.forEach((apt) => {
    if (!customerStats[apt.customer_id]) {
      customerStats[apt.customer_id] = { total: 0, completed: 0 }
    }
    customerStats[apt.customer_id].total++
  })

  // Get completed appointments count
  const { data: completedApts } = await supabase
    .from('appointments')
    .select('customer_id')
    .eq('provider_id', provider.id)
    .eq('status', 'completed')

  completedApts?.forEach((apt) => {
    if (customerStats[apt.customer_id]) {
      customerStats[apt.customer_id].completed++
    }
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Müşteriler</h1>
        <p className="text-muted-foreground">
          Randevu alan müşterilerinizi görüntüleyin
        </p>
      </div>

      {/* Customers List */}
      <CustomersList 
        customers={customers}
        stats={customerStats}
      />
    </div>
  )
}
