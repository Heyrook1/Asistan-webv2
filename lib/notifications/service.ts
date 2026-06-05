import 'server-only'

import type { TeamRole, NotificationActionType } from '@prisma/client'
import { NotificationType, NotificationPriority, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { NotificationActionDraft, NotificationSubtype } from './types'
import { dispatchPush } from './push'

export type CreateNotificationInput = {
  businessId: string
  /** Single recipient. */
  recipientUserId?: string | null
  /** Multiple explicit recipients. Combined with `recipientUserId` and the
   *  role-based fanout, deduplicated. */
  recipientUserIds?: Array<string | null | undefined>
  /** Fan out to every active member with one of these roles. */
  roles?: TeamRole[]
  /** Always exclude this user (e.g. the actor) from the recipient set. */
  excludeUserId?: string | null
  actorUserId?: string | null
  type: NotificationType
  subtype?: NotificationSubtype | string
  title: string
  message: string
  link?: string | null
  entityType?: string | null
  entityId?: string | null
  priority?: NotificationPriority
  actionRequired?: boolean
  metadata?: Record<string, unknown> | null
  actions?: NotificationActionDraft[]
}

/**
 * Centralized notification creator. Every important system event must call this.
 *
 * Returns the list of created notification rows so callers can wire them into
 * timeline events or push delivery.
 */
export async function createNotification(input: CreateNotificationInput): Promise<{ ids: string[] }> {
  const recipients = await resolveRecipients(input)
  if (recipients.length === 0) {
    return { ids: [] }
  }

  const baseData = {
    businessId: input.businessId,
    actorUserId: input.actorUserId ?? null,
    type: input.type,
    subtype: input.subtype ?? null,
    title: input.title,
    message: input.message,
    link: input.link ?? null,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    priority: input.priority ?? NotificationPriority.NORMAL,
    actionRequired: input.actionRequired ?? false,
    metadata: input.metadata == null
      ? Prisma.JsonNull
      : (input.metadata as Prisma.InputJsonValue),
  } satisfies Omit<Prisma.NotificationUncheckedCreateInput, 'id' | 'userId'>

  const created = await prisma.$transaction(async (tx) => {
    const ids: string[] = []
    for (const userId of recipients) {
      const row = await tx.notification.create({
        data: { ...baseData, userId },
        select: { id: true },
      })
      ids.push(row.id)

      if (input.actions && input.actions.length > 0) {
        await tx.notificationAction.createMany({
          data: input.actions.map((a) => ({
            notificationId: row.id,
            label: a.label,
            actionType: a.actionType,
            payload:
              a.payload == null ? Prisma.JsonNull : (a.payload as Prisma.InputJsonValue),
          })),
        })
      }
    }
    return ids
  })

  // Best-effort Web Push. Failures are swallowed so notification creation
  // stays atomic from the caller's perspective.
  dispatchPush({
    userIds: recipients,
    payload: {
      id: created[0] ?? recipients[0],
      title: input.title,
      body: input.message,
      url: input.link ?? '/dashboard/bildirimler',
      tag: input.entityId ? `${input.entityType ?? 'asistan'}-${input.entityId}` : undefined,
    },
  }).catch(() => {})

  return { ids: created }
}

async function resolveRecipients(input: CreateNotificationInput): Promise<string[]> {
  const excluded = new Set<string>()
  if (input.excludeUserId) excluded.add(input.excludeUserId)

  const ids = new Set<string>()
  if (input.recipientUserId) ids.add(input.recipientUserId)
  for (const id of input.recipientUserIds ?? []) {
    if (id) ids.add(id)
  }

  const wantsRoleFanout = input.roles && input.roles.length > 0
  if (wantsRoleFanout) {
    const members = await prisma.teamMember.findMany({
      where: {
        businessId: input.businessId,
        isActive: true,
        userId: { not: null },
        role: { in: input.roles! },
      },
      select: { userId: true },
    })
    for (const m of members) if (m.userId) ids.add(m.userId)
  }

  for (const x of excluded) ids.delete(x)
  return Array.from(ids)
}

/**
 * Returns every active member with at least one of the given roles.
 * Useful when a caller wants to mix-and-match (e.g. notify owners *plus*
 * an explicit doctor).
 */
export async function getRoleRecipients(
  businessId: string,
  roles: TeamRole[],
  excludeUserId?: string | null
): Promise<string[]> {
  const rows = await prisma.teamMember.findMany({
    where: {
      businessId,
      isActive: true,
      userId: { not: null },
      role: { in: roles },
      ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
    },
    select: { userId: true },
  })
  return rows.map((r) => r.userId!).filter((id): id is string => Boolean(id))
}

/**
 * Resolves the User.id for a TeamMember.id if (and only if) the member belongs
 * to the same business. Returns null when the link isn't established yet (e.g.
 * the invite is still pending).
 */
export async function getUserIdForTeamMember(
  businessId: string,
  teamMemberId: string
): Promise<string | null> {
  const row = await prisma.teamMember.findFirst({
    where: { id: teamMemberId, businessId, isActive: true },
    select: { userId: true },
  })
  return row?.userId ?? null
}

export { NotificationType, NotificationPriority }
export type { NotificationActionType }
