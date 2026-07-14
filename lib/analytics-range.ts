export const ANALYTICS_MONTH_OPTIONS = [3, 6, 12] as const
export type AnalyticsMonthRange = (typeof ANALYTICS_MONTH_OPTIONS)[number]

export function parseAnalyticsMonthRange(value: string | null | undefined): AnalyticsMonthRange {
  const n = Number(value)
  if (n === 3 || n === 6 || n === 12) return n
  return 6
}
