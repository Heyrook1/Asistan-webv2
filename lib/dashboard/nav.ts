/**
 * Canonical clinic dashboard navigation IA.
 * Desktop sidebar + mobile Menü sheet + command palette should consume this.
 */

import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Bell,
  Briefcase,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Plug,
  Scale,
  ScrollText,
  Settings,
  Shield,
  Sparkles,
  UserCog,
  Users,
} from 'lucide-react'

import {
  can,
  canAny,
  canViewAppointmentSchedule,
  type Permission,
  type SessionContext,
} from '@/lib/rbac'
import { canManageClinicSettings } from '@/lib/settings/tabs'

export type NavGroupId = 'operasyon' | 'hasta' | 'finans' | 'iletisim' | 'yonetim'

export const NAV_GROUP_ORDER: NavGroupId[] = [
  'operasyon',
  'hasta',
  'finans',
  'iletisim',
  'yonetim',
]

export const NAV_GROUP_LABELS: Record<NavGroupId, string> = {
  operasyon: 'Operasyon',
  hasta: 'Hasta yönetimi',
  finans: 'Finans',
  iletisim: 'İletişim',
  yonetim: 'Yönetim',
}

export type DashboardNavBadge = 'notifications' | 'messages' | 'pendingAppointments'

export type DashboardNavItem = {
  /** Stable id for React keys (href may include query). */
  id: string
  name: string
  href: string
  group: NavGroupId
  icon: LucideIcon
  permission?: Permission
  anyOfPermissions?: Permission[]
  adminOnly?: boolean
  superAdminOnly?: boolean
  badge?: DashboardNavBadge
  /** Shown in mobile bottom tab bar (max ~3 + Menü). */
  mobilePrimary?: boolean
  /** Requires team messaging feature flag. */
  requiresTeamMessaging?: boolean
  /** Requires clinic analytics feature flag. */
  requiresClinicAnalytics?: boolean
  /** Requires clinic settings admin (owner / privileged). */
  requiresClinicSettingsAdmin?: boolean
  keywords?: string
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    id: 'overview',
    name: 'Genel Bakış',
    href: '/dashboard',
    group: 'operasyon',
    icon: LayoutDashboard,
    mobilePrimary: true,
    keywords: 'anasayfa overview dashboard',
  },
  {
    id: 'agenda',
    name: 'Ajanda',
    href: '/dashboard/ajanda',
    group: 'operasyon',
    icon: CalendarDays,
    anyOfPermissions: ['appointment.manage', 'appointment.view', 'appointment.own.view'],
    badge: 'pendingAppointments',
    mobilePrimary: true,
    keywords: 'appointment randevu ajanda takvim liste benim',
  },
  {
    id: 'notifications',
    name: 'Bildirimler',
    href: '/dashboard/bildirimler',
    group: 'iletisim',
    icon: Bell,
    badge: 'notifications',
    keywords: 'notification uyari hatirlatma',
  },
  {
    id: 'messages',
    name: 'Mesajlar',
    href: '/dashboard/mesajlar',
    group: 'iletisim',
    icon: MessageCircle,
    badge: 'messages',
    requiresTeamMessaging: true,
    keywords: 'chat mesaj konusma',
  },
  {
    id: 'patients',
    name: 'Hastalar',
    href: '/dashboard/hastalar',
    group: 'hasta',
    icon: Users,
    permission: 'patient.view',
    mobilePrimary: true,
    keywords: 'patient hasta musteri kart',
  },
  {
    id: 'identity-matches',
    name: 'Kimlik eşleşmeleri',
    href: '/dashboard/kimlik-eslesmeleri',
    group: 'hasta',
    icon: Sparkles,
    permission: 'patient.edit',
    keywords: 'kimlik eslesme merge person',
  },
  {
    id: 'intake',
    name: 'Anketler',
    href: '/dashboard/anketler',
    group: 'hasta',
    icon: ClipboardList,
    permission: 'service.manage',
    keywords: 'anket intake form',
  },
  {
    id: 'services',
    name: 'Hizmetler',
    href: '/dashboard/hizmetler',
    group: 'yonetim',
    icon: Briefcase,
    permission: 'service.manage',
    keywords: 'service hizmet fiyat sure',
  },
  {
    id: 'team',
    name: 'Ekip',
    href: '/dashboard/takim',
    group: 'yonetim',
    icon: UserCog,
    anyOfPermissions: ['team.view', 'team.manage'],
    keywords: 'team calisan personel doktor takim',
  },
  {
    id: 'locations',
    name: 'Şubeler',
    href: '/dashboard/ayarlar?tab=isletme#lokasyonlar',
    group: 'yonetim',
    icon: MapPin,
    requiresClinicSettingsAdmin: true,
    keywords: 'sube lokasyon location branch',
  },
  {
    id: 'invoices',
    name: 'Faturalar',
    href: '/dashboard/faturalar',
    group: 'finans',
    icon: FileText,
    anyOfPermissions: ['appointment.manage', 'analytics.revenue.view'],
    keywords: 'fatura invoice e-fatura',
  },
  {
    id: 'analytics',
    name: 'Analitik',
    href: '/dashboard/analitik',
    group: 'finans',
    icon: BarChart3,
    permission: 'analytics.view',
    requiresClinicAnalytics: true,
    keywords: 'analytics rapor ciro',
  },
  {
    id: 'integrations',
    name: 'Entegrasyonlar',
    href: '/dashboard/ayarlar?tab=entegrasyonlar',
    group: 'yonetim',
    icon: Plug,
    keywords: 'entegrasyon integration whatsapp calendar',
  },
  {
    id: 'subscription',
    name: 'Abonelik',
    href: '/dashboard/ayarlar?tab=abonelik',
    group: 'yonetim',
    icon: CreditCard,
    requiresClinicSettingsAdmin: true,
    keywords: 'abonelik paket billing yenileme trial',
  },
  {
    id: 'settings',
    name: 'Ayarlar',
    href: '/dashboard/ayarlar?tab=hesap',
    group: 'yonetim',
    icon: Settings,
    keywords: 'settings profil hesap',
  },
  {
    id: 'help',
    name: 'Yardım',
    href: '/dashboard/yardim',
    group: 'yonetim',
    icon: HelpCircle,
    keywords: 'yardim destek help faq dokumantasyon rehber iletisim',
  },
  {
    id: 'audit',
    name: 'Denetim',
    href: '/dashboard/denetim',
    group: 'yonetim',
    icon: ScrollText,
    permission: 'audit.view',
    keywords: 'denetim audit log guvenlik',
  },
  {
    id: 'governance',
    name: 'Yönetişim',
    href: '/dashboard/yonetisim',
    group: 'yonetim',
    icon: Scale,
    superAdminOnly: true,
    keywords: 'denetim audit kvkk uyumluluk silme riza',
  },
  {
    id: 'super-admin',
    name: 'Super Admin',
    href: '/dashboard/super-admin',
    group: 'yonetim',
    icon: Shield,
    superAdminOnly: true,
    keywords: 'super admin',
  },
]

export type NavFilterOptions = {
  session: SessionContext
  showPlatformAdmin?: boolean
  showSuperAdmin?: boolean
  teamMessagingEnabled?: boolean
  clinicAnalyticsEnabled?: boolean
}

export function isDashboardNavActive(
  pathname: string,
  href: string,
  search = '',
): boolean {
  const qIndex = href.indexOf('?')
  const hashIndex = href.indexOf('#')
  const pathEnd = qIndex >= 0 ? qIndex : hashIndex >= 0 ? hashIndex : href.length
  const path = href.slice(0, pathEnd) || '/'
  const queryPart =
    qIndex >= 0 ? href.slice(qIndex + 1, hashIndex >= 0 ? hashIndex : undefined) : ''

  if (path === '/dashboard/ajanda') {
    return (
      pathname === '/dashboard/ajanda' ||
      pathname.startsWith('/dashboard/ajanda/') ||
      pathname === '/dashboard/randevular' ||
      pathname.startsWith('/dashboard/randevular/') ||
      pathname === '/dashboard/takvim' ||
      pathname.startsWith('/dashboard/takvim/')
    )
  }

  if (path === '/dashboard/ayarlar') {
    if (pathname !== '/dashboard/ayarlar' && !pathname.startsWith('/dashboard/ayarlar/')) {
      return false
    }
    const wantTab = new URLSearchParams(queryPart).get('tab')
    if (!wantTab) return true
    const currentTab = new URLSearchParams(search).get('tab')
    return currentTab === wantTab
  }

  return pathname === path || (path !== '/dashboard' && pathname.startsWith(`${path}/`))
}

export function filterDashboardNavItems(
  items: DashboardNavItem[],
  options: NavFilterOptions,
): DashboardNavItem[] {
  const {
    session,
    showPlatformAdmin = false,
    showSuperAdmin = false,
    teamMessagingEnabled = false,
    clinicAnalyticsEnabled = false,
  } = options

  return items.filter((item) => {
    if (item.requiresTeamMessaging && !teamMessagingEnabled) return false
    if (item.requiresClinicAnalytics && !clinicAnalyticsEnabled) return false
    if (item.requiresClinicSettingsAdmin && !canManageClinicSettings(session)) return false
    if (item.adminOnly && !showPlatformAdmin) return false
    if (item.superAdminOnly && !showSuperAdmin) return false
    if (item.anyOfPermissions?.length) {
      if (item.id === 'agenda') return canViewAppointmentSchedule(session)
      return canAny(session, item.anyOfPermissions)
    }
    return !item.permission || can(session, item.permission)
  })
}

export type NavGroupSection = {
  group: NavGroupId
  label: string
  items: DashboardNavItem[]
}

export function groupDashboardNavItems(items: DashboardNavItem[]): NavGroupSection[] {
  return NAV_GROUP_ORDER.map((group) => ({
    group,
    label: NAV_GROUP_LABELS[group],
    items: items.filter((item) => item.group === group),
  })).filter((section) => section.items.length > 0)
}

export function mobilePrimaryNavItems(items: DashboardNavItem[]): DashboardNavItem[] {
  return items.filter((item) => item.mobilePrimary)
}
