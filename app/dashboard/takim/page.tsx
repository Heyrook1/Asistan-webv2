import { TeamManagement } from '@/components/dashboard/team-management'
import { getDashboardContext } from '@/lib/dashboard-context'
import { enforceRouteAccess } from '@/lib/access'
import type { TeamMember } from '@/lib/types'

export default async function TakimPage() {
  const { supabase, provider, teamMember } = await getDashboardContext()
  enforceRouteAccess('/dashboard/takim', teamMember)

  const [{ data: members }, { data: activityLogs }] = await Promise.all([
    supabase.from('team_members').select('*').eq('provider_id', provider.id).order('created_at', { ascending: false }),
    supabase.from('activity_logs').select('action,details,created_at').eq('provider_id', provider.id).order('created_at', { ascending: false }).limit(20),
  ])

  const logs = (activityLogs || []).map((l: any) => `${new Date(l.created_at).toLocaleString('tr-TR')} - ${String(l.details?.message || l.action)}`)

  return <TeamManagement providerId={provider.id} initialMembers={(members || []) as TeamMember[]} initialLogs={logs} />
}
