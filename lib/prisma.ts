import { Prisma, PrismaClient } from '@prisma/client'
import { env } from '@/lib/env'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const resolvedDbUrl =
  env.databaseUrl.startsWith('prisma://') && env.directUrl ? env.directUrl : env.databaseUrl

const SOFT_DELETE_MODELS = new Set<Prisma.ModelName>([
  // NOTE: `Business.deletedAt` may be absent on older databases that have not yet
  // applied the soft-delete migration. We keep Business out of middleware-based
  // soft-delete filtering to avoid runtime P2022 errors in session bootstrap.
  'VendorAccount',
  'TeamMember',
  'Patient',
  'PatientNote',
  'Medication',
  'Allergy',
  'Treatment',
  'TreatmentPlanItem',
  'LabResult',
  'PatientFile',
  'Service',
  'Location',
  'Appointment',
  'TimelineEvent',
  'Notification',
  'NotificationAction',
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

type QueryWhere = Record<string, unknown>

function withNotDeleted(where: unknown): QueryWhere {
  if (!where || typeof where !== 'object' || Array.isArray(where)) {
    return { deletedAt: null }
  }

  const typedWhere = where as QueryWhere
  if (Object.prototype.hasOwnProperty.call(typedWhere, 'deletedAt')) {
    return typedWhere
  }

  return { ...typedWhere, deletedAt: null }
}

const prismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: resolvedDbUrl } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

prismaClient.$use(async (params, next) => {
  if (!isSoftDeleteModel(params.model)) {
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
    params.args = {
      ...params.args,
      where: withNotDeleted(params.args?.where),
    }
  }

  return next(params)
})

export const prisma = prismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
