export type DashboardAnnouncement = {
  id: string
  title: string
  body: string
  href?: string
  hrefLabel?: string
  /** ISO date — hide after this day (inclusive end of day UTC). */
  endsAt?: string
  severity?: 'info' | 'warning'
}

/**
 * In-product announcements for clinic dashboard.
 * Add/remove entries here (or later move to CMS/DB).
 */
export const DASHBOARD_ANNOUNCEMENTS: DashboardAnnouncement[] = [
  {
    id: '2026-07-export',
    title: 'Hasta ve finans dışa aktarma',
    body: 'Hastalar ve Analitik sayfalarından CSV / PDF dışa aktarımı kullanabilirsiniz.',
    href: '/dashboard/yardim',
    hrefLabel: 'Yardım Merkezi',
    severity: 'info',
  },
  {
    id: '2026-07-dunning',
    title: 'Abonelik yenileme',
    body: 'Paket süreniz yaklaşıyorsa Ayarlar → Abonelik üzerinden elden yenileme talebi oluşturabilirsiniz.',
    href: '/dashboard/ayarlar?tab=abonelik',
    hrefLabel: 'Abonelik',
    severity: 'info',
  },
]

export function getActiveAnnouncements(now = new Date()): DashboardAnnouncement[] {
  return DASHBOARD_ANNOUNCEMENTS.filter((item) => {
    if (!item.endsAt) return true
    const end = new Date(item.endsAt)
    if (Number.isNaN(end.getTime())) return true
    return end.getTime() >= now.getTime()
  })
}
