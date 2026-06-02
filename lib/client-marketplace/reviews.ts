import 'server-only'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const createReviewSchema = z.object({
  appointmentId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  serviceQuality: z.number().int().min(1).max(5).optional(),
  waitingTime: z.number().int().min(1).max(5).optional(),
  communication: z.number().int().min(1).max(5).optional(),
  comment: z.string().trim().max(1500).optional(),
})

type CreateReviewInput = z.infer<typeof createReviewSchema>

export async function createReviewForClient(input: {
  payload: CreateReviewInput
  clientUserId: string
}) {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: input.payload.appointmentId,
      clientUserId: input.clientUserId,
      status: 'COMPLETED',
    },
    select: {
      id: true,
      businessId: true,
      patientId: true,
      staffId: true,
      serviceId: true,
    },
  })

  if (!appointment) {
    return {
      ok: false as const,
      error: 'Yorum icin tamamlanmis randevu bulunamadi.',
    }
  }

  const existing = await prisma.review.findFirst({
    where: { appointmentId: appointment.id },
    select: { id: true },
  })
  if (existing) {
    return {
      ok: false as const,
      error: 'Bu randevu icin zaten yorum birakildi.',
    }
  }

  const review = await prisma.review.create({
    data: {
      appointmentId: appointment.id,
      businessId: appointment.businessId,
      clientUserId: input.clientUserId,
      patientId: appointment.patientId,
      staffId: appointment.staffId,
      serviceId: appointment.serviceId,
      rating: input.payload.rating,
      serviceQuality: input.payload.serviceQuality ?? null,
      waitingTime: input.payload.waitingTime ?? null,
      communication: input.payload.communication ?? null,
      comment: input.payload.comment ?? null,
    },
    select: { id: true },
  })

  return { ok: true as const, data: { reviewId: review.id } }
}

export async function getDoctorReviewSummary(doctorId: string) {
  const [stats, recent] = await Promise.all([
    prisma.review.aggregate({
      where: { staffId: doctorId, deletedAt: null },
      _avg: {
        rating: true,
        serviceQuality: true,
        waitingTime: true,
        communication: true,
      },
      _count: { _all: true },
    }),
    prisma.review.findMany({
      where: { staffId: doctorId, deletedAt: null },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        clientUser: { select: { fullName: true } },
      },
    }),
  ])

  return {
    averageRating: stats._avg.rating ? Number(stats._avg.rating) : null,
    reviewCount: stats._count._all,
    averages: {
      serviceQuality: stats._avg.serviceQuality ? Number(stats._avg.serviceQuality) : null,
      waitingTime: stats._avg.waitingTime ? Number(stats._avg.waitingTime) : null,
      communication: stats._avg.communication ? Number(stats._avg.communication) : null,
    },
    recent: recent.map((row) => ({
      id: row.id,
      rating: row.rating,
      serviceQuality: row.serviceQuality,
      waitingTime: row.waitingTime,
      communication: row.communication,
      comment: row.comment,
      createdAt: row.createdAt.toISOString(),
      clientName: row.clientUser.fullName,
    })),
  }
}

