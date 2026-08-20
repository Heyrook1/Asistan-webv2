import 'server-only'

import { prisma } from '@/lib/prisma'

/** Resolve form for an appointment: service-assigned form, else clinic default. */
export async function resolveIntakeFormForAppointment(input: {
  businessId: string
  serviceId: string
}) {
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, businessId: input.businessId, isActive: true },
    select: {
      intakeFormId: true,
      intakeForm: {
        select: {
          id: true,
          name: true,
          description: true,
          fields: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  })

  if (service?.intakeForm && service.intakeForm.isActive && !service.intakeForm.deletedAt) {
    return service.intakeForm
  }

  return prisma.intakeForm.findFirst({
    where: {
      businessId: input.businessId,
      isActive: true,
      isDefault: true,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      fields: true,
      isActive: true,
      deletedAt: true,
    },
  })
}
