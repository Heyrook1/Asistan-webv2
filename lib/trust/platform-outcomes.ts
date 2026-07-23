import 'server-only'

import { prisma } from '@/lib/prisma'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'

export type PlatformOutcomeSnapshot = {
  /** True when sample is large enough to show rates publicly */
  ready: boolean
  sampleSize: number
  completed: number
  noShow: number
  cancelled: number
  /** noShow / (completed + noShow) * 100, null if not ready */
  noShowRatePct: number | null
  reviewCount: number
  averageRating: number | null
  activeClinics: number
}

const MIN_SAMPLE = 40

export async function getPlatformOutcomeSnapshot(): Promise<PlatformOutcomeSnapshot> {
  try {
    return await runWithTenantBypassAsync('trust:platform-outcomes', async () => {
      const [completed, noShow, cancelled, reviewAgg, activeClinics] = await Promise.all([
        prisma.appointment.count({ where: { status: 'COMPLETED', deletedAt: null } }),
        prisma.appointment.count({ where: { status: 'NO_SHOW', deletedAt: null } }),
        prisma.appointment.count({ where: { status: 'CANCELLED', deletedAt: null } }),
        prisma.review.aggregate({
          where: { deletedAt: null },
          _count: { _all: true },
          _avg: { rating: true },
        }),
        prisma.business.count({ where: { isActive: true, deletedAt: null } }),
      ])

      const sampleSize = completed + noShow
      const ready = sampleSize >= MIN_SAMPLE
      const noShowRatePct =
        ready && sampleSize > 0 ? Number(((noShow / sampleSize) * 100).toFixed(1)) : null

      return {
        ready,
        sampleSize,
        completed,
        noShow,
        cancelled,
        noShowRatePct,
        reviewCount: reviewAgg._count._all,
        averageRating: reviewAgg._avg.rating ? Number(reviewAgg._avg.rating.toFixed(1)) : null,
        activeClinics,
      }
    })
  } catch {
    return {
      ready: false,
      sampleSize: 0,
      completed: 0,
      noShow: 0,
      cancelled: 0,
      noShowRatePct: null,
      reviewCount: 0,
      averageRating: null,
      activeClinics: 0,
    }
  }
}
