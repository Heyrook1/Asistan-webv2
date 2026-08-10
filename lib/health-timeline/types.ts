import type { HealthTimelineKind } from '@/lib/health-timeline/kinds'

export type HealthTimelineItem = {
  id: string
  kind: HealthTimelineKind
  /** ISO UTC timestamp used for sorting and day grouping */
  occurredAt: string
  /**
   * Wall-clock HH:mm in clinic timezone when known (appointment start).
   * Prefer this for display to avoid a second Date→locale conversion.
   */
  clockTime?: string | null
  title: string
  subtitle?: string | null
  status?: string | null
  clinicName?: string | null
  sourceEntityId?: string | null
  href?: string | null
}

export type HealthTimelineDayGroup = {
  /** YYYY-MM-DD */
  dayKey: string
  label: string
  monthLabel: string
  items: HealthTimelineItem[]
}
