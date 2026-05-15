import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ServicesList } from '@/components/dashboard/services-list'
import { AddServiceDialog } from '@/components/dashboard/add-service-dialog'
import type { Service } from '@/lib/types'

export const metadata = {
  title: 'Hizmetler',
}

export default async function ServicesPage() {
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

  // Fetch services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', provider.id)
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hizmetler</h1>
          <p className="text-muted-foreground">
            Sunduğunuz hizmetleri yönetin
          </p>
        </div>
        <AddServiceDialog providerId={provider.id} />
      </div>

      {/* Services List */}
      <ServicesList 
        services={(services || []) as Service[]} 
        providerId={provider.id}
      />
    </div>
  )
}
