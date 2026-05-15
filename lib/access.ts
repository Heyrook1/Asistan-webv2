import { redirect } from 'next/navigation'
import type { Capability, TeamMember } from '@/lib/types'

export const routeCapabilities: Record<string, Capability | null> = {
  '/dashboard': null,
  '/dashboard/randevular': 'view_appointments',
  '/dashboard/takvim': 'view_appointments',
  '/dashboard/musteriler': 'manage_customers',
  '/dashboard/hizmetler': 'edit_appointments',
  '/dashboard/musaitlik': 'edit_appointments',
  '/dashboard/takim': 'manage_team',
  '/dashboard/analitik': 'access_analytics',
  '/dashboard/bildirimler': 'view_appointments',
  '/dashboard/ai-asistan': 'view_appointments',
  '/dashboard/ayarlar': null,
}

export function hasCapability(member: TeamMember | null, capability: Capability) {
  if (!member) return false
  if (member.role === 'Super Admin' || member.role === 'Isletme Sahibi') return true
  return member.permissions.includes(capability)
}

export function enforceRouteAccess(route: string, member: TeamMember | null) {
  const required = routeCapabilities[route]
  if (!required) return
  if (!hasCapability(member, required)) {
    redirect('/dashboard')
  }
}
