import 'server-only'

import { prisma } from '@/lib/prisma'
import { clinicAssignableStaffWhere } from '@/lib/security/platform-roles'

/** Active clinic staff for appointment / ops comboboxes — never includes SUPER_ADMIN. */
export async function listClinicAssignableStaff(businessId: string) {
  return prisma.teamMember.findMany({
    where: clinicAssignableStaffWhere(businessId),
    orderBy: { fullName: 'asc' },
    select: { id: true, fullName: true, color: true },
  })
}
