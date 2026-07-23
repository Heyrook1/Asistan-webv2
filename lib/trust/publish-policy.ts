export type PublicTrustStats = {
  activeClinics: number
  verifiedDoctors: number
  completedAppointments: number
  reviewCount: number
  averageRating: number | null
}

/** Same bar as platform no-show rates — no public counts while traction is thin. */
export const PUBLIC_TRUST_STATS_MIN_COMPLETED = 40

export function shouldPublishPublicTrustStats(stats: PublicTrustStats): boolean {
  return stats.completedAppointments >= PUBLIC_TRUST_STATS_MIN_COMPLETED
}
