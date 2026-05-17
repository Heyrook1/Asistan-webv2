import { createClient } from '@/lib/supabase/server'

export type PatientScope = 'basic' | 'sensitive'

export async function getPatientAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, status: 401, message: 'Unauthorized' }

  const { data: provider } = await supabase.from('providers').select('id,user_id').eq('user_id', user.id).single()
  if (!provider) return { ok: false as const, status: 403, message: 'Provider not found' }

  const { data: teamMember } = await supabase.from('team_members').select('role,permissions').eq('provider_id', provider.id).eq('email', user.email || '').maybeSingle()
  const isOwner = provider.user_id === user.id
  const role = (teamMember?.role || (isOwner ? 'Isletme Sahibi' : 'Personel')) as string
  const permissions = (teamMember?.permissions || []) as string[]
  const canEdit = isOwner || role === 'Isletme Sahibi' || role === 'Doktor' || permissions.includes('manage_customers')
  const canViewSensitive = isOwner || role === 'Isletme Sahibi' || role === 'Doktor' || permissions.includes('view_sensitive_records')

  return {
    ok: true as const,
    userId: user.id,
    providerId: provider.id,
    role,
    permissions,
    canEdit,
    canViewSensitive,
  }
}
