/**
 * Uygulama Prisma istemcisi — soft-delete middleware + tenant-guard.
 *
 * `prisma://` Accelerate URL’sinde `directUrl` kullanılır. Soft-delete
 * modellerinde `deletedAt` süzülür; `Business` bilinçli olarak dışarıda
 * (eski DB’de kolon yoksa session bootstrap P2022 olmasın).
 * Kiracı filtresi: `applyTenantGuard` (RLS’ye ek uygulama kapısı).
 *
 * Nested `include` / `_count` / relation `some|none` also get `deletedAt: null`
 * via soft-delete-nested helpers (Prisma middleware only sees the top query).
 */

import { Prisma, PrismaClient } from '@prisma/client'
import { env } from '@/lib/env'
import { applyTenantGuard } from '@/lib/security/tenant-guard'
import {
  applySoftDeleteToQueryArgs,
  applySoftDeleteToWhereRelationFilters,
  withNotDeleted,
} from '@/lib/security/soft-delete-nested'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const resolvedDbUrl =
  env.databaseUrl.startsWith('prisma://') && env.directUrl ? env.directUrl : env.databaseUrl

const SOFT_DELETE_MODELS = new Set<Prisma.ModelName>([
  // NOTE: `Business.deletedAt` may be absent on older databases that have not yet
  // applied the soft-delete migration. We keep Business out of middleware-based
  // soft-delete filtering to avoid runtime P2022 errors in session bootstrap.
  'VendorAccount',
  'TeamMember',
  'ClientUser',
  'Patient',
  'PatientNote',
  'Medication',
  'Allergy',
  'Treatment',
  'TreatmentPlanItem',
  'LabResult',
  'PatientFile',
  'Service',
  'ServiceStaff',
  'TeamMemberAvailability',
  'TeamMemberUnavailableBlock',
  'Location',
  'Appointment',
  'Review',
  'TimelineEvent',
  'Notification',
  'NotificationAction',
  'ClientNotification',
  'PersonMedication',
  'PersonAllergy',
  'PersonDocument',
  'PushSubscription',
  'Reminder',
  'Conversation',
  'ConversationParticipant',
  'Message',
  'MessageAttachment',
  'MessageReaction',
])

function isSoftDeleteModel(model?: string): model is Prisma.ModelName {
  return !!model && SOFT_DELETE_MODELS.has(model as Prisma.ModelName)
}

const prismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: resolvedDbUrl } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

prismaClient.$use(async (params, next) => {
  applyTenantGuard({
    model: params.model,
    action: params.action,
    args: params.args,
  })

  if (!isSoftDeleteModel(params.model)) {
    // Non-soft-delete parents (e.g. Business) still nest soft-delete children —
    // filter nested include/_count/relation filters without touching top-level where
    // (Business may lack deletedAt on older DBs).
    if (
      params.action === 'findFirst' ||
      params.action === 'findFirstOrThrow' ||
      params.action === 'findMany' ||
      params.action === 'findUnique' ||
      params.action === 'findUniqueOrThrow' ||
      params.action === 'count' ||
      params.action === 'aggregate' ||
      params.action === 'groupBy'
    ) {
      const args = (params.args ?? {}) as Record<string, unknown>
      if (args.include || args.select) {
        const patched = applySoftDeleteToQueryArgs({ ...args }, params.model) ?? {}
        if (args.where === undefined) {
          delete patched.where
        } else {
          patched.where = applySoftDeleteToWhereRelationFilters(args.where, params.model)
        }
        params.args = patched
      } else if (args.where) {
        params.args = {
          ...args,
          where: applySoftDeleteToWhereRelationFilters(args.where, params.model),
        }
      }
    }
    return next(params)
  }

  if (params.action === 'delete') {
    params.action = 'update'
    params.args = {
      ...params.args,
      data: {
        ...(params.args?.data ?? {}),
        deletedAt: new Date(),
      },
    }
  }

  if (params.action === 'deleteMany') {
    params.action = 'updateMany'
    params.args = {
      ...params.args,
      where: withNotDeleted(params.args?.where),
      data: {
        ...(params.args?.data ?? {}),
        deletedAt: new Date(),
      },
    }
  }

  if (params.action === 'findUnique') {
    params.action = 'findFirst'
  }

  if (params.action === 'findUniqueOrThrow') {
    params.action = 'findFirstOrThrow'
  }

  if (
    params.action === 'findFirst' ||
    params.action === 'findFirstOrThrow' ||
    params.action === 'findMany' ||
    params.action === 'count' ||
    params.action === 'aggregate' ||
    params.action === 'groupBy' ||
    params.action === 'updateMany'
  ) {
    const args = applySoftDeleteToQueryArgs((params.args ?? {}) as Record<string, unknown>, params.model) ?? {}
    if (args.where) {
      args.where = applySoftDeleteToWhereRelationFilters(args.where, params.model)
    }
    params.args = args
  }

  return next(params)
})

export { withNotDeleted }
export const prisma = prismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
