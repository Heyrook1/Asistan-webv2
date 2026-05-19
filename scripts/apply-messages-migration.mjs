// Targeted, idempotent migration for the team-chat module. Adds three tables
// without touching anything else in the database.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const statements = [
  `CREATE TABLE IF NOT EXISTS "Conversation" (
     "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     "businessId"    UUID NOT NULL,
     "title"         TEXT,
     "isGroup"       BOOLEAN NOT NULL DEFAULT false,
     "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "lastMessageAt" TIMESTAMP(3)
   )`,
  `DO $$ BEGIN
     ALTER TABLE "Conversation"
       ADD CONSTRAINT "Conversation_businessId_fkey"
       FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `CREATE INDEX IF NOT EXISTS "Conversation_businessId_lastMessageAt_idx"
     ON "Conversation"("businessId","lastMessageAt")`,

  `CREATE TABLE IF NOT EXISTS "ConversationParticipant" (
     "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     "conversationId" UUID NOT NULL,
     "userId"         UUID NOT NULL,
     "joinedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "lastReadAt"     TIMESTAMP(3),
     "isActive"       BOOLEAN NOT NULL DEFAULT true
   )`,
  `DO $$ BEGIN
     ALTER TABLE "ConversationParticipant"
       ADD CONSTRAINT "ConversationParticipant_conversationId_userId_key"
       UNIQUE ("conversationId","userId");
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
     ALTER TABLE "ConversationParticipant"
       ADD CONSTRAINT "ConversationParticipant_conversationId_fkey"
       FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
     ALTER TABLE "ConversationParticipant"
       ADD CONSTRAINT "ConversationParticipant_userId_fkey"
       FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `CREATE INDEX IF NOT EXISTS "ConversationParticipant_userId_lastReadAt_idx"
     ON "ConversationParticipant"("userId","lastReadAt")`,

  `CREATE TABLE IF NOT EXISTS "Message" (
     "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     "conversationId" UUID NOT NULL,
     "senderUserId"   UUID NOT NULL,
     "body"           TEXT NOT NULL,
     "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "editedAt"       TIMESTAMP(3),
     "deletedAt"      TIMESTAMP(3)
   )`,
  `DO $$ BEGIN
     ALTER TABLE "Message"
       ADD CONSTRAINT "Message_conversationId_fkey"
       FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
     ALTER TABLE "Message"
       ADD CONSTRAINT "Message_senderUserId_fkey"
       FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `CREATE INDEX IF NOT EXISTS "Message_conversationId_createdAt_idx"
     ON "Message"("conversationId","createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Message_senderUserId_idx"
     ON "Message"("senderUserId")`,
]

let ok = 0
for (const stmt of statements) {
  try {
    await prisma.$executeRawUnsafe(stmt)
    ok += 1
    console.log(`✓ ${stmt.replace(/\s+/g, ' ').slice(0, 90)}…`)
  } catch (e) {
    console.error('✗ failed:', stmt.slice(0, 120))
    console.error(e.message)
    process.exit(1)
  }
}
console.log(`\nApplied ${ok}/${statements.length} statements.`)
await prisma.$disconnect()
