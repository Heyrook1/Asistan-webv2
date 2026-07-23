import type { HealthTimelineKind } from '@/lib/health-timeline/kinds'

export type HealthTimelineItem = {
  id: string
  kind: HealthTimelineKind
  /** ISO timestamp used for sorting and day grouping */
  occurredAt: string
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
