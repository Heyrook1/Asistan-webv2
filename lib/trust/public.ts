import { prisma } from '@/lib/prisma'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'
import type { PublicTrustStats } from '@/lib/trust/publish-policy'

export type { PublicTrustStats } from '@/lib/trust/publish-policy'
export {
  PUBLIC_TRUST_STATS_MIN_COMPLETED,
  shouldPublishPublicTrustStats,
} from '@/lib/trust/publish-policy'

export type DoctorVerification = {
  level: 'verified' | 'partial' | 'unverified'
  label: string
  labelEn: string
  reasons: string[]
}

export function getDoctorVerification(input: {
  specialty?: string | null
  medicalLicenseNo?: string | null
  diplomaNo?: string | null
  kktcIdentityNo?: string | null
  hasAvailability?: boolean
  hasServices?: boolean
}): DoctorVerification {
  const reasons: string[] = []
  if (input.specialty?.trim()) reasons.push('Uzmanlık alanı tanımlı')
  if (input.medicalLicenseNo?.trim()) reasons.push('Tıbbi ruhsat no kaydı')
  if (input.diplomaNo?.trim()) reasons.push('Diploma no kaydı')
  if (input.kktcIdentityNo?.trim()) reasons.push('KKTC kimlik kaydı')
  if (input.hasAvailability) reasons.push('Aktif randevu takvimi')
  if (input.hasServices) reasons.push('Aktif hizmet kalemi')

  const credentialScore =
    Number(Boolean(input.specialty?.trim())) +
    Number(Boolean(input.medicalLicenseNo?.trim())) +
    Number(Boolean(input.diplomaNo?.trim())) +
    Number(Boolean(input.kktcIdentityNo?.trim()))

  if (credentialScore >= 2 && (input.hasAvailability || input.hasServices)) {
    return {
      level: 'verified',
      label: 'Profil doğrulandı',
      labelEn: 'Profile verified',
      reasons,
    }
  }

  if (credentialScore >= 1 || input.hasAvailability || input.hasServices) {
    return {
      level: 'partial',
      label: 'Doğrulama devam ediyor',
      labelEn: 'Verification in progress',
      reasons,
    }
  }

  return {
    level: 'unverified',
    label: 'Doğrulama bekleniyor',
    labelEn: 'Awaiting verification',
    reasons,
  }
}

export async function getPublicTrustStats(): Promise<PublicTrustStats> {
  try {
    // Platform-wide marketing aggregates — intentional cross-tenant read.
    return await runWithTenantBypassAsync('trust:public-stats', async () => {
      const [activeClinics, verifiedDoctors, completedAppointments, reviewAgg] = await Promise.all([
        prisma.business.count({ where: { isActive: true, deletedAt: null } }),
        prisma.teamMember.count({
          where: {
            isActive: true,
            role: { in: ['DOKTOR', 'ISLETME_SAHIBI'] },
            OR: [
              { medicalLicenseNo: { not: null } },
              { diplomaNo: { not: null } },
              { kktcIdentityNo: { not: null } },
            ],
          },
        }),
        prisma.appointment.count({
          where: { status: 'COMPLETED', deletedAt: null },
        }),
        prisma.review.aggregate({
          where: { deletedAt: null },
          _count: { _all: true },
          _avg: { rating: true },
        }),
      ])

      return {
        activeClinics,
        verifiedDoctors,
        completedAppointments,
        reviewCount: reviewAgg._count._all,
        averageRating: reviewAgg._avg.rating ? Number(reviewAgg._avg.rating.toFixed(1)) : null,
      }
    })
  } catch {
    return {
      activeClinics: 0,
      verifiedDoctors: 0,
      completedAppointments: 0,
      reviewCount: 0,
      averageRating: null,
    }
  }
}

export async function getPublicVerifiedReviews(limit = 6) {
  try {
    return await runWithTenantBypassAsync('trust:public-reviews', async () => {
      const rows = await prisma.review.findMany({
        where: {
          deletedAt: null,
          comment: { not: null },
          rating: { gte: 4 },
          appointment: { status: 'COMPLETED' },
        },
        include: {
          business: { select: { name: true, city: true } },
          staff: { select: { fullName: true } },
          clientUser: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })

      return rows
        .filter((row) => Boolean(row.comment?.trim()))
        .map((row) => ({
          id: row.id,
          rating: row.rating,
          comment: row.comment!.trim(),
          clinicName: row.business.name,
          city: row.business.city,
          doctorName: row.staff?.fullName ?? null,
          authorName: maskName(row.clientUser.fullName),
          createdAt: row.createdAt.toISOString(),
        }))
    })
  } catch {
    return []
  }
}

function maskName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Hasta'
  if (parts.length === 1) return `${parts[0].slice(0, 1)}.`
  return `${parts[0]} ${parts[parts.length - 1].slice(0, 1)}.`
}
