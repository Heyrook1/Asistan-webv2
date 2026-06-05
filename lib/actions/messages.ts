'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { MESSAGE_MEDIA_BUCKET } from '@/lib/storage-constants'
import { ok, err, type ActionResult } from './result'

const DIRECT_CONVERSATION_RATE_LIMIT = { action: 'messages:get-or-create-direct', limit: 12, windowMs: 60_000 }
const SEND_MESSAGE_RATE_LIMIT = { action: 'messages:send', limit: 45, windowMs: 60_000 }

function rateLimitedResult(retryAfterMs: number): ActionResult<never> {
  const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000))
  return err(`Cok fazla istek gonderdiniz. Lutfen ${retryAfterSeconds} saniye sonra tekrar deneyin.`)
}

async function assertParticipant(conversationId: string, userId: string) {
  return prisma.conversationParticipant.findFirst({
    where: { conversationId, userId, isActive: true },
    select: { id: true, conversationId: true, lastReadAt: true },
  })
}

async function assertSameBusinessUser(businessId: string, otherUserId: string) {
  const member = await prisma.teamMember.findFirst({
    where: { businessId, userId: otherUserId, isActive: true },
    select: { userId: true },
  })
  if (member) return true
  const business = await prisma.business.findFirst({
    where: { id: businessId, ownerUserId: otherUserId },
    select: { id: true },
  })
  return Boolean(business)
}

const directSchema = z.object({ partnerUserId: z.string().uuid() })

function directConversationKey(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join(':')
}

export async function getOrCreateDirectConversation(
  input: unknown
): Promise<ActionResult<{ conversationId: string }>> {
  const parsed = directSchema.safeParse(input)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requireSession()
  const directRateLimit = await checkRateLimit({
    ...DIRECT_CONVERSATION_RATE_LIMIT,
    userId: session.userId,
    businessId: session.businessId,
  })
  if (!directRateLimit.allowed) return rateLimitedResult(directRateLimit.retryAfterMs)
  if (parsed.data.partnerUserId === session.userId) return err('Kendinizle sohbet başlatamazsınız')
  if (!(await assertSameBusinessUser(session.businessId, parsed.data.partnerUserId))) {
    return err('Bu kullanıcı ekipte bulunamadı')
  }

  const directKey = directConversationKey(session.userId, parsed.data.partnerUserId)

  const existing = await prisma.conversation.findFirst({
    where: {
      businessId: session.businessId,
      isGroup: false,
      directKey,
    },
    select: { id: true },
  })
  if (existing) return ok({ conversationId: existing.id })

  const legacy = await prisma.$queryRaw<Array<{ id: string }>>`
    select c.id
    from "Conversation" c
    where c."businessId" = ${session.businessId}
      and c."isGroup" = false
      and c."directKey" is null
      and exists (
        select 1
        from "ConversationParticipant" cp
        where cp."conversationId" = c.id
          and cp."isActive" = true
          and cp."userId" = ${session.userId}
      )
      and exists (
        select 1
        from "ConversationParticipant" cp
        where cp."conversationId" = c.id
          and cp."isActive" = true
          and cp."userId" = ${parsed.data.partnerUserId}
      )
      and (
        select count(*)
        from "ConversationParticipant" cp
        where cp."conversationId" = c.id
          and cp."isActive" = true
      ) = 2
    order by c."createdAt" asc
    limit 1
  `
  if (legacy[0]) {
    try {
      await prisma.conversation.update({
        where: { id: legacy[0].id },
        data: { directKey },
      })
      return ok({ conversationId: legacy[0].id })
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) {
        throw error
      }
    }
    const raced = await prisma.conversation.findFirst({
      where: {
        businessId: session.businessId,
        isGroup: false,
        directKey,
      },
      select: { id: true },
    })
    if (raced) return ok({ conversationId: raced.id })
  }

  try {
    const created = await prisma.conversation.create({
      data: {
        businessId: session.businessId,
        isGroup: false,
        directKey,
        participants: {
          create: [{ userId: session.userId }, { userId: parsed.data.partnerUserId }],
        },
      },
      select: { id: true },
    })

    revalidatePath('/dashboard/mesajlar')
    return ok({ conversationId: created.id })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const raced = await prisma.conversation.findFirst({
        where: {
          businessId: session.businessId,
          isGroup: false,
          directKey,
        },
        select: { id: true },
      })
      if (raced) return ok({ conversationId: raced.id })
    }
    throw error
  }
}

const groupSchema = z.object({
  title: z.string().trim().min(2).max(120),
  participantUserIds: z.array(z.string().uuid()).min(1).max(30),
})

export async function createGroupConversation(
  input: unknown
): Promise<ActionResult<{ conversationId: string }>> {
  const parsed = groupSchema.safeParse(input)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requireSession()
  const participantUserIds = Array.from(new Set([session.userId, ...parsed.data.participantUserIds]))

  for (const userId of participantUserIds) {
    const allowed = userId === session.userId || (await assertSameBusinessUser(session.businessId, userId))
    if (!allowed) return err('Grup katılımcılarından biri ekipte bulunamadı')
  }

  const created = await prisma.conversation.create({
    data: {
      businessId: session.businessId,
      title: parsed.data.title,
      isGroup: true,
      participants: { create: participantUserIds.map((userId) => ({ userId })) },
    },
    select: { id: true },
  })

  revalidatePath('/dashboard/mesajlar')
  return ok({ conversationId: created.id })
}

const groupMembersSchema = z.object({
  conversationId: z.string().uuid(),
  participantUserIds: z.array(z.string().uuid()).min(1).max(30),
})

export async function addGroupParticipants(input: unknown): Promise<ActionResult> {
  const parsed = groupMembersSchema.safeParse(input)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requireSession()

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: parsed.data.conversationId,
      businessId: session.businessId,
      isGroup: true,
      participants: { some: { userId: session.userId, isActive: true } },
    },
    select: { id: true },
  })
  if (!conversation) return err('Grup sohbeti bulunamadı')

  const participantUserIds = Array.from(new Set(parsed.data.participantUserIds))
  for (const userId of participantUserIds) {
    if (!(await assertSameBusinessUser(session.businessId, userId))) {
      return err('Katılımcılardan biri ekipte bulunamadı')
    }
  }

  await prisma.$transaction(
    participantUserIds.map((userId) =>
      prisma.conversationParticipant.upsert({
        where: { conversationId_userId: { conversationId: conversation.id, userId } },
        create: { conversationId: conversation.id, userId },
        update: { isActive: true, deletedAt: null },
      })
    )
  )

  revalidatePath('/dashboard/mesajlar')
  revalidatePath(`/dashboard/mesajlar?conversation=${conversation.id}`)
  return ok(undefined)
}

const removeGroupMemberSchema = z.object({
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
})

export async function removeGroupParticipant(input: unknown): Promise<ActionResult> {
  const parsed = removeGroupMemberSchema.safeParse(input)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requireSession()

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: parsed.data.conversationId,
      businessId: session.businessId,
      isGroup: true,
      participants: { some: { userId: session.userId, isActive: true } },
    },
    include: { participants: { where: { isActive: true }, select: { userId: true } } },
  })
  if (!conversation) return err('Grup sohbeti bulunamadı')
  if (conversation.participants.length <= 1) return err('Gruptaki son kullanıcı çıkarılamaz')

  const result = await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: conversation.id,
      userId: parsed.data.userId,
      isActive: true,
    },
    data: { isActive: false },
  })
  if (result.count === 0) return err('Katılımcı bulunamadı')

  revalidatePath('/dashboard/mesajlar')
  revalidatePath(`/dashboard/mesajlar?conversation=${conversation.id}`)
  return ok(undefined)
}

const attachmentInput = z.object({
  fileName: z.string().trim().min(1).max(300),
  fileType: z.string().trim().min(1).max(120),
  fileSize: z.number().int().min(1).max(15 * 1024 * 1024),
  storageKey: z.string().min(1).max(1000),
  fileUrl: z.string().regex(/^storage:\/\/message-media\/.+$/, 'Geçersiz dosya referansı'),
})

const sendSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().trim().max(5000).optional().default(''),
  attachments: z.array(attachmentInput).max(5).optional().default([]),
})

export async function sendMessage(
  input: unknown
): Promise<ActionResult<{ id: string; createdAt: string }>> {
  const parsed = sendSchema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requireSession()
  const sendRateLimit = await checkRateLimit({
    ...SEND_MESSAGE_RATE_LIMIT,
    userId: session.userId,
    businessId: session.businessId,
  })
  if (!sendRateLimit.allowed) return rateLimitedResult(sendRateLimit.retryAfterMs)
  const participant = await assertParticipant(parsed.data.conversationId, session.userId)
  if (!participant) return err('Bu sohbete erişim yetkiniz yok')
  if (!parsed.data.body && parsed.data.attachments.length === 0) return err('Mesaj boş olamaz')

  const conversation = await prisma.conversation.findFirst({
    where: { id: parsed.data.conversationId, businessId: session.businessId },
    select: { id: true },
  })
  if (!conversation) return err('Sohbet bulunamadı')

  for (const attachment of parsed.data.attachments) {
    if (!attachment.storageKey.startsWith(`${session.businessId}/${parsed.data.conversationId}/`)) {
      return err('Dosya yolu bu işletmeye veya sohbete ait değil')
    }
    if (attachment.fileUrl !== `storage://${MESSAGE_MEDIA_BUCKET}/${attachment.storageKey}`) {
      return err('Dosya referansı geçersiz')
    }
  }

  const created = await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        conversationId: parsed.data.conversationId,
        senderUserId: session.userId,
        body: parsed.data.body,
        attachments: {
          create: parsed.data.attachments.map((a) => ({
            fileName: a.fileName,
            fileType: a.fileType,
            fileSize: a.fileSize,
            storageKey: a.storageKey,
            fileUrl: a.fileUrl,
          })),
        },
      },
      select: { id: true, createdAt: true },
    })
    await tx.conversation.update({
      where: { id: parsed.data.conversationId },
      data: { lastMessageAt: msg.createdAt, updatedAt: msg.createdAt },
    })
    await tx.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: msg.createdAt },
    })
    return msg
  })

  revalidatePath('/dashboard/mesajlar')
  revalidatePath(`/dashboard/mesajlar?conversation=${parsed.data.conversationId}`)
  return ok({ id: created.id, createdAt: created.createdAt.toISOString() })
}

const reactionSchema = z.object({
  messageId: z.string().uuid(),
  emoji: z.string().trim().min(1).max(16),
})

export async function toggleMessageReaction(input: unknown): Promise<ActionResult> {
  const parsed = reactionSchema.safeParse(input)
  if (!parsed.success) return err('Geçersiz tepki', parsed.error.issues)
  const session = await requireSession()

  const message = await prisma.message.findFirst({
    where: {
      id: parsed.data.messageId,
      conversation: {
        businessId: session.businessId,
        participants: { some: { userId: session.userId, isActive: true } },
      },
      deletedAt: null,
    },
    select: { id: true, conversationId: true },
  })
  if (!message) return err('Mesaj bulunamadı')

  const existing = await prisma.messageReaction.findUnique({
    where: {
      messageId_userId_emoji: {
        messageId: parsed.data.messageId,
        userId: session.userId,
        emoji: parsed.data.emoji,
      },
    },
    select: { id: true },
  })

  if (existing) {
    await prisma.messageReaction.delete({ where: { id: existing.id } })
  } else {
    const archived = await prisma.messageReaction.findFirst({
      where: {
        messageId: parsed.data.messageId,
        userId: session.userId,
        emoji: parsed.data.emoji,
        deletedAt: { not: null },
      },
      select: { id: true },
    })

    if (archived) {
      await prisma.messageReaction.update({
        where: { id: archived.id },
        data: { deletedAt: null },
      })
    } else {
      await prisma.messageReaction.create({
        data: { messageId: parsed.data.messageId, userId: session.userId, emoji: parsed.data.emoji },
      })
    }
  }

  revalidatePath('/dashboard/mesajlar')
  revalidatePath(`/dashboard/mesajlar?conversation=${message.conversationId}`)
  return ok(undefined)
}

const markReadSchema = z.object({ conversationId: z.string().uuid() })

export async function markConversationRead(input: unknown): Promise<ActionResult> {
  const parsed = markReadSchema.safeParse(input)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requireSession()
  const participant = await assertParticipant(parsed.data.conversationId, session.userId)
  if (!participant) return err('Sohbet bulunamadı')

  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  })
  revalidatePath('/dashboard/mesajlar')
  return ok(undefined)
}
