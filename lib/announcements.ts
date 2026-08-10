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
 * Prefer short-lived notices; layout shows at most one undismissed item.
 */
export const DASHBOARD_ANNOUNCEMENTS: DashboardAnnouncement[] = [
  {
    id: '2026-08-abonelik',
    title: 'Abonelik yenileme',
    body: 'Paket süreniz yaklaşıyorsa Ayarlar → Abonelik üzerinden elden yenileme talebi oluşturabilirsiniz.',
    href: '/dashboard/ayarlar?tab=abonelik',
    hrefLabel: 'Abonelik',
    severity: 'info',
    endsAt: '2026-12-31',
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

/** UI shows one strip at a time (newest / first active wins). */
export function pickAnnouncementSlot(
  items: DashboardAnnouncement[],
  dismissedIds: ReadonlySet<string> | readonly string[] = [],
): DashboardAnnouncement | null {
  const dismissed = dismissedIds instanceof Set ? dismissedIds : new Set(dismissedIds)
  return items.find((item) => !dismissed.has(item.id)) ?? null
}
