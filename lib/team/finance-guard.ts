import 'server-only'

import type { TeamRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { memberHasFinanceAccess } from '@/lib/rbac'

/**
 * Ensures at least one active finance-capable admin remains after a team change.
 * Product rule: ciro yetkisi tamamen kapanamaz — en az bir yetkili owner/yönetici kalmalı.
 */
export async function assertRemainingFinanceAdmin(input: {
  businessId: string
  memberId: string
  nextRole: TeamRole
  nextPermissions: readonly string[]
  nextIsActive: boolean
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const nextStillHasFinance =
    input.nextIsActive &&
    memberHasFinanceAccess({
      role: input.nextRole,
      permissions: input.nextPermissions,
    })

  if (nextStillHasFinance) return { ok: true }

  const business = await prisma.business.findUnique({
    where: { id: input.businessId },
    select: { ownerUserId: true },
  })

  const [target, others] = await Promise.all([
    prisma.teamMember.findFirst({
      where: { id: input.memberId, businessId: input.businessId },
      select: { userId: true },
    }),
    prisma.teamMember.findMany({
      where: {
        businessId: input.businessId,
        isActive: true,
        id: { not: input.memberId },
      },
      select: {
        role: true,
        permissions: true,
        userId: true,
      },
    }),
  ])

  const otherHasFinance = others.some((member) => {
    if (business?.ownerUserId && member.userId === business.ownerUserId) return true
    return memberHasFinanceAccess({
      role: member.role,
      permissions: member.permissions as string[],
    })
  })

  if (otherHasFinance) return { ok: true }

  // Business owner retains finance via isOwner even without a TeamMember row /
  // even if their TeamMember permissions JSON was stripped — unless this change
  // deactivates the owner's membership AND they somehow lose ownership (they don't
  // via this UI). If the owner account is still set, treat as remaining finance admin
  // when the member being changed is not that owner.
  const targetIsOwner = Boolean(
    business?.ownerUserId && target?.userId && target.userId === business.ownerUserId,
  )
  if (business?.ownerUserId && !targetIsOwner) return { ok: true }

  // Owner still has session finance while ownerUserId points at them — demoting
  // their TeamMember role cannot strip isOwner. Only block deactivating the sole
  // finance path when there is no ownerUserId fallback.
  if (targetIsOwner && input.nextIsActive) {
    // Owner stays isOwner → finance retained at session layer.
    return { ok: true }
  }

  return {
    ok: false,
    error:
      'En az bir işletme sahibi veya yönetici ciro (finans) yetkisine sahip olmalıdır. Son yetkili kişiden bu izin kaldırılamaz veya pasifleştirilemez.',
  }
}
