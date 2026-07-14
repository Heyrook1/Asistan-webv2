import { describe, it, expect } from 'vitest'

import { buildPriorityItems, type PrioritySignals } from '@/lib/priority-engine'

const empty: PrioritySignals = {
  pendingApprovals: 0,
  todayConfirmed: 0,
  todayPending: 0,
  recentNoShows: 0,
  activePatients: 1,
  hasConfirmedHistory: false,
}

describe('lib/priority-engine', () => {
  it('emits nothing when all signals are quiet', () => {
    expect(buildPriorityItems(empty)).toEqual([])
  })

  it('flags high severity when pending approvals are piled up', () => {
    const items = buildPriorityItems({ ...empty, pendingApprovals: 5 })
    expect(items).toHaveLength(1)
    expect(items[0]?.id).toBe('pending-approvals')
    expect(items[0]?.severity).toBe('high')
    expect(items[0]?.href).toContain('status=SCHEDULED')
  })

  it('adds same-day pending as high priority', () => {
    const items = buildPriorityItems({ ...empty, todayPending: 2 })
    expect(items.some((i) => i.id === 'today-pending' && i.severity === 'high')).toBe(true)
  })

  it('suggests empty-day only when clinic has history', () => {
    const withoutHistory = buildPriorityItems({
      ...empty,
      todayConfirmed: 0,
      hasConfirmedHistory: false,
    })
    expect(withoutHistory.some((i) => i.id === 'empty-today')).toBe(false)

    const withHistory = buildPriorityItems({
      ...empty,
      todayConfirmed: 0,
      hasConfirmedHistory: true,
    })
    expect(withHistory.some((i) => i.id === 'empty-today' && i.severity === 'low')).toBe(true)
  })

  it('never brands output as AI in titles/reasons', () => {
    const items = buildPriorityItems({
      pendingApprovals: 1,
      todayConfirmed: 0,
      todayPending: 1,
      recentNoShows: 3,
      activePatients: 0,
      hasConfirmedHistory: true,
    })
    const blob = items.map((i) => `${i.title} ${i.reason}`).join(' ')
    expect(blob).not.toMatch(/\bAI\b/i)
    expect(blob.toLowerCase()).not.toContain('yapay zeka')
  })
})
