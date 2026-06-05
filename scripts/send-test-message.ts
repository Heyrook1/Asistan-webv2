// Smoke test: starts a DM between the owner and the first teammate, sends one
// message, and prints the resulting unread count.
//
// Run with: pnpm tsx scripts/send-test-message.ts

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const business = await prisma.business.findFirst({
    select: { id: true, name: true, ownerUserId: true },
  })
  if (!business) {
    console.error('No business found.')
    process.exit(1)
  }

  const partner = await prisma.teamMember.findFirst({
    where: {
      businessId: business.id,
      isActive: true,
      userId: { not: null },
      NOT: { userId: business.ownerUserId },
    },
    select: { userId: true, fullName: true },
  })
  if (!partner?.userId) {
    console.log('No teammate (other than owner) to chat with — skipping.')
    console.log('Önce ekibinize bir kullanıcı ekleyip aktif hale getirin.')
    await prisma.$disconnect()
    return
  }

  console.log(`Owner: ${business.ownerUserId}`)
  console.log(`Partner: ${partner.fullName} <${partner.userId}>`)

  let conversation = await prisma.conversation.findFirst({
    where: {
      businessId: business.id,
      isGroup: false,
      AND: [
        { participants: { some: { userId: business.ownerUserId } } },
        { participants: { some: { userId: partner.userId } } },
      ],
    },
    select: { id: true },
  })
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        businessId: business.id,
        isGroup: false,
        participants: {
          create: [
            { userId: business.ownerUserId },
            { userId: partner.userId },
          ],
        },
      },
      select: { id: true },
    })
    console.log(`✓ created conversation ${conversation.id}`)
  } else {
    console.log(`✓ reused conversation ${conversation.id}`)
  }

  const msg = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderUserId: partner.userId,
      body: `Selam! Bu bir test mesajıdır — ${new Date().toLocaleTimeString('tr-TR')}`,
    },
    select: { id: true, body: true, createdAt: true },
  })
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: msg.createdAt, updatedAt: msg.createdAt },
  })
  console.log(`✓ sent message ${msg.id}: ${msg.body}`)

  // What the owner's unread badge would now show.
  const ownerParticipant = await prisma.conversationParticipant.findFirst({
    where: { conversationId: conversation.id, userId: business.ownerUserId },
    select: { lastReadAt: true },
  })
  const unread = await prisma.message.count({
    where: {
      conversationId: conversation.id,
      senderUserId: { not: business.ownerUserId },
      createdAt: ownerParticipant?.lastReadAt
        ? { gt: ownerParticipant.lastReadAt }
        : undefined,
      deletedAt: null,
    },
  })
  console.log(`\nOwner unread in this conversation: ${unread}`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
