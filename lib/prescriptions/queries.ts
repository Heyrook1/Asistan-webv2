import 'server-only'

import { prisma } from '@/lib/prisma'

export async function getPrescriptionForPrint(businessId: string, patientId: string, prescriptionId: string) {
  return prisma.prescription.findFirst({
    where: { id: prescriptionId, businessId, patientId },
    include: {
      lines: { orderBy: { sortOrder: 'asc' } },
    },
  })
}
