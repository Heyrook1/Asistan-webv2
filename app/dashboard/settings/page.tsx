import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/dashboard/settings-form'
import type { User, Provider } from '@/lib/types'

export const metadata = {
  title: 'Ayarlar',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  // Fetch provider profile
  const { data: providerData } = await supabase
    .from('providers')
    .select('*')
    .eq('user_id', authUser.id)
    .single()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-muted-foreground">
          Profil ve işletme bilgilerinizi yönetin
        </p>
      </div>

      {/* Settings Form */}
      <SettingsForm 
        user={userData as User | null}
        provider={providerData as Provider | null}
        userId={authUser.id}
      />
    </div>
  )
}
