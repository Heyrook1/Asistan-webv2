import {
  can,
  isPrivilegedClinicAdmin,
  type SessionContext,
} from '@/lib/rbac'

export const SETTINGS_TABS = [
  'hesap',
  'isletme',
  'randevu',
  'fatura',
  'marka',
  'entegrasyonlar',
  'abonelik',
] as const

export type SettingsTab = (typeof SETTINGS_TABS)[number]

/** Tabs that require clinic business / billing admin (not every staff member). */
export const BUSINESS_ADMIN_SETTINGS_TABS: SettingsTab[] = [
  'isletme',
  'randevu',
  'fatura',
  'marka',
  'abonelik',
]

export function isSettingsTab(value: string | null | undefined): value is SettingsTab {
  return Boolean(value && (SETTINGS_TABS as readonly string[]).includes(value))
}

/** Owner, işletme sahibi, super-admin, or explicit settings.business.edit. */
export function canManageClinicSettings(session: Pick<SessionContext, 'isOwner' | 'role' | 'permissions'>): boolean {
  return isPrivilegedClinicAdmin(session as SessionContext) || can(session as SessionContext, 'settings.business.edit')
}

export function resolveSettingsTab(
  value: string | null | undefined,
  canManageBusiness: boolean,
): SettingsTab {
  if (!isSettingsTab(value)) return 'hesap'
  if (!canManageBusiness && BUSINESS_ADMIN_SETTINGS_TABS.includes(value)) return 'hesap'
  return value
}

export function visibleSettingsTabs(canManageBusiness: boolean): SettingsTab[] {
  if (canManageBusiness) return [...SETTINGS_TABS]
  return ['hesap', 'entegrasyonlar']
}
