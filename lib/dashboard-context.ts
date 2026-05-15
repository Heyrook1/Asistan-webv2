import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { TeamMember } from '@/lib/types'

export async function getDashboardContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: provider } = await supabase
    .from('providers')
    .select('id,user_id')
    .eq('user_id', user.id)
    .single()

  if (!provider) redirect('/dashboard')

  const { data: teamMemberData } = await supabase
    .from('team_members')
    .select('*')
    .eq('provider_id', provider.id)
    .eq('email', user.email)
    .maybeSingle()

  const teamMember = (teamMemberData ?? {
    id: 'owner-default',
    provider_id: provider.id,
    user_id: user.id,
    full_name: user.user_metadata?.full_name ?? 'Isletme Sahibi',
    email: user.email ?? '',
    role: 'Isletme Sahibi',
    status: 'active',
    permissions: ['view_appointments', 'edit_appointments', 'manage_customers', 'access_analytics', 'manage_team'],
    is_active: true,
    last_active_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }) as TeamMember

  return { supabase, user, provider, teamMember }
}
