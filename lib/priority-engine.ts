export type PrioritySeverity = 'high' | 'medium' | 'low'

export type PriorityItem = {
  id: string
  title: string
  reason: string
  href: string
  severity: PrioritySeverity
}

export type PrioritySignals = {
  pendingApprovals: number
  todayConfirmed: number
  todayPending: number
  recentNoShows: number
  activePatients: number
  hasConfirmedHistory: boolean
}

/**
 * Rule-based clinic ops priorities. Only emits cards when a signal crosses a threshold.
 * No AI branding — counts and dates only.
 */
export function buildPriorityItems(signals: PrioritySignals): PriorityItem[] {
  const items: PriorityItem[] = []

  if (signals.pendingApprovals > 0) {
    items.push({
      id: 'pending-approvals',
      title:
        signals.pendingApprovals === 1
          ? '1 randevu onay bekliyor'
          : `${signals.pendingApprovals} randevu onay bekliyor`,
      reason:
        signals.pendingApprovals >= 5
          ? 'Onay birikimi yüksek — kuyruğu şimdi temizleyin.'
          : 'Bekleyen talepleri onaylayın veya reddedin.',
      href: '/dashboard/ajanda?mode=liste&status=SCHEDULED',
      severity: signals.pendingApprovals >= 5 ? 'high' : 'medium',
    })
  }

  if (signals.todayPending > 0) {
    items.push({
      id: 'today-pending',
      title:
        signals.todayPending === 1
          ? 'Bugün 1 onay bekleyen randevu var'
          : `Bugün ${signals.todayPending} onay bekleyen randevu var`,
      reason: 'Aynı gün talepleri gecikmeden sonuçlandırın.',
      href: '/dashboard/ajanda?mode=liste&status=SCHEDULED',
      severity: 'high',
    })
  }

  if (signals.recentNoShows > 0) {
    items.push({
      id: 'recent-no-shows',
      title:
        signals.recentNoShows === 1
          ? 'Son 7 günde 1 gelmedi kaydı'
          : `Son 7 günde ${signals.recentNoShows} gelmedi kaydı`,
      reason: 'Tekrarlayan gelmeme için listeyi gözden geçirin.',
      href: '/dashboard/ajanda?mode=liste&status=NO_SHOW',
      severity: signals.recentNoShows >= 3 ? 'high' : 'medium',
    })
  }

  if (signals.todayConfirmed === 0 && signals.hasConfirmedHistory) {
    items.push({
      id: 'empty-today',
      title: 'Bugün onaylı randevu yok',
      reason: 'Ajanda boş — slotları doldurmak veya müsaitliği kontrol etmek için takvime bakın.',
      href: '/dashboard/ajanda?mode=takvim',
      severity: 'low',
    })
  }

  if (signals.activePatients === 0) {
    items.push({
      id: 'no-patients',
      title: 'Henüz hasta kaydı yok',
      reason: 'Randevu akışı için önce hasta ekleyin.',
      href: '/dashboard/hastalar',
      severity: 'medium',
    })
  }

  // Prefer actionable backlog over duplicate same-day pending if both exist
  const seen = new Set<string>()
  const deduped: PriorityItem[] = []
  for (const item of items) {
    if (item.id === 'today-pending' && signals.pendingApprovals === signals.todayPending) {
      // Same pool as overall pending — keep the more specific same-day card only when overall > today
      // If equal, keep pending-approvals and skip today-pending duplicate messaging
      continue
    }
    if (seen.has(item.id)) continue
    seen.add(item.id)
    deduped.push(item)
  }

  const order: Record<PrioritySeverity, number> = { high: 0, medium: 1, low: 2 }
  return deduped.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 5)
}
