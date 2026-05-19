'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { ok, err, type ActionResult } from './result'

// ── Helpers ────────────────────────────────────────────────────────────────

async function assertParticipant(conversationId: string, userId: string) {
  return prisma.conversationParticipant.findFirst({
    where: { conversationId, userId, isActive: true },
    select: { id: true, conversationId: true, lastReadAt: true },
  })
}

async function assertSameBusinessUser(businessId: string, otherUserId: string) {
  // The "partner" must be an active member of the same business — either via
  // TeamMember linkage or by being the owner.
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

// ── Actions ────────────────────────────────────────────────────────────────

const directSchema = z.object({ partnerUserId: z.string().uuid() })

/**
 * Returns the existing 1:1 conversation between the caller and the partner,
 * or creates a new one. Both participants must belong to the caller's
 * business.
 */
export async function getOrCreateDirectConversation(
  input: unknown
): Promise<ActionResult<{ conversationId: string }>> {
  const parsed = directSchema.safeParse(input)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requireSession()
  if (parsed.data.partnerUserId === session.userId) {
    return err('Kendinizle sohbet başlatamazsınız')
  }
  const okPartner = await assertSameBusinessUser(session.businessId, parsed.data.partnerUserId)
  if (!okPartner) return err('Bu kullanıcı ekipte bulunamadı')

  // Find an existing DM where both users participate.
  const existing = await prisma.conversation.findFirst({
    where: {
      businessId: session.businessId,
      isGroup: false,
      participants: {
        every: { userId: { in: [session.userId, parsed.data.partnerUserId] } },
      },
      AND: [
        { participants: { some: { userId: session.userId } } },
        { participants: { some: { userId: parsed.data.partnerUserId } } },
      ],
    },
    select: { id: true },
  })
  if (existing) return ok({ conversationId: existing.id })

  const created = await prisma.conversation.create({
    data: {
      businessId: session.businessId,
      isGroup: false,
      participants: {
        create: [
          { userId: session.userId },
          { userId: parsed.data.partnerUserId },
        ],
      },
    },
    select: { id: true },
  })

  revalidatePath('/dashboard/mesajlar')
  return ok({ conversationId: created.id })
}

const sendSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().trim().min(1, 'Mesaj boş olamaz').max(5000),
})

export async function sendMessage(
  input: unknown
): Promise<ActionResult<{ id: string; createdAt: string }>> {
  const parsed = sendSchema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requireSession()

  const participant = await assertParticipant(parsed.data.conversationId, session.userId)
  if (!participant) return err('Bu sohbete erişim yetkiniz yok')

  const created = await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        conversationId: parsed.data.conversationId,
        senderUserId: session.userId,
        body: parsed.data.body,
      },
      select: { id: true, createdAt: true },
    })
    await tx.conversation.update({
      where: { id: parsed.data.conversationId },
      data: { lastMessageAt: msg.createdAt, updatedAt: msg.createdAt },
    })
    // Sender's own messages are immediately marked read.
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
