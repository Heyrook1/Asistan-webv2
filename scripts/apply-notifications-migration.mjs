// Targeted migration: applies ONLY the additive schema changes required by the
// new notification system. Leaves every other table (Prisma-managed and the
// legacy ones from a previous app) untouched.
//
// Idempotent — safe to re-run. UUID types match Prisma's `@default(uuid())`.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const statements = [
  // ── Enums ───────────────────────────────────────────────────────────────
  `DO $$ BEGIN
     CREATE TYPE "NotificationPriority" AS ENUM ('LOW','NORMAL','HIGH','URGENT');
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
     CREATE TYPE "NotificationActionStatus" AS ENUM ('PENDING','COMPLETED','CANCELLED');
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
     CREATE TYPE "NotificationActionType" AS ENUM (
       'APPOINTMENT_APPROVE','APPOINTMENT_CANCEL','APPOINTMENT_RESCHEDULE',
       'OPEN_LINK','OPEN_PATIENT','OPEN_APPOINTMENT','ACK'
     );
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // ── Notification table: new columns ─────────────────────────────────────
  `ALTER TABLE "Notification"
     ADD COLUMN IF NOT EXISTS "actorUserId"    UUID,
     ADD COLUMN IF NOT EXISTS "subtype"        TEXT,
     ADD COLUMN IF NOT EXISTS "entityType"     TEXT,
     ADD COLUMN IF NOT EXISTS "entityId"       TEXT,
     ADD COLUMN IF NOT EXISTS "priority"       "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
     ADD COLUMN IF NOT EXISTS "actionRequired" BOOLEAN NOT NULL DEFAULT false,
     ADD COLUMN IF NOT EXISTS "metadata"       JSONB,
     ADD COLUMN IF NOT EXISTS "archivedAt"     TIMESTAMP(3)`,

  // Heal: a previous run created actorUserId as TEXT before we caught the
  // type mismatch with User.id (uuid). Coerce it to UUID safely.
  `ALTER TABLE "Notification"
     ALTER COLUMN "actorUserId" TYPE UUID USING "actorUserId"::uuid`,

  // FK Notification.actorUserId -> User.id (SET NULL on user delete)
  `DO $$ BEGIN
     ALTER TABLE "Notification"
       ADD CONSTRAINT "Notification_actorUserId_fkey"
       FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // New indexes on Notification
  `CREATE INDEX IF NOT EXISTS "Notification_businessId_entityType_entityId_idx"
     ON "Notification"("businessId","entityType","entityId")`,
  `CREATE INDEX IF NOT EXISTS "Notification_businessId_archivedAt_idx"
     ON "Notification"("businessId","archivedAt")`,

  // ── NotificationAction ──────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "NotificationAction" (
     "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     "notificationId" UUID NOT NULL,
     "label"          TEXT NOT NULL,
     "actionType"     "NotificationActionType" NOT NULL,
     "payload"        JSONB,
     "status"         "NotificationActionStatus" NOT NULL DEFAULT 'PENDING',
     "completedBy"    UUID,
     "completedAt"    TIMESTAMP(3),
     "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   )`,
  `DO $$ BEGIN
     ALTER TABLE "NotificationAction"
       ADD CONSTRAINT "NotificationAction_notificationId_fkey"
       FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `CREATE INDEX IF NOT EXISTS "NotificationAction_notificationId_status_idx"
     ON "NotificationAction"("notificationId","status")`,

  // ── PushSubscription ────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "PushSubscription" (
     "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     "businessId" UUID NOT NULL,
     "userId"     UUID NOT NULL,
     "endpoint"   TEXT NOT NULL UNIQUE,
     "p256dh"     TEXT NOT NULL,
     "auth"       TEXT NOT NULL,
     "userAgent"  TEXT,
     "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "lastUsedAt" TIMESTAMP(3)
   )`,
  `DO $$ BEGIN
     ALTER TABLE "PushSubscription"
       ADD CONSTRAINT "PushSubscription_businessId_fkey"
       FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN
     ALTER TABLE "PushSubscription"
       ADD CONSTRAINT "PushSubscription_userId_fkey"
       FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `CREATE INDEX IF NOT EXISTS "PushSubscription_userId_idx"     ON "PushSubscription"("userId")`,
  `CREATE INDEX IF NOT EXISTS "PushSubscription_businessId_idx" ON "PushSubscription"("businessId")`,
]

let ok = 0
for (const stmt of statements) {
  try {
    await prisma.$executeRawUnsafe(stmt)
    ok += 1
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 90)
    console.log(`✓ ${preview}${stmt.length > 90 ? '…' : ''}`)
  } catch (e) {
    console.error('✗ statement failed:', stmt.slice(0, 120))
    console.error(e.message)
    process.exit(1)
  }
}

console.log(`\nApplied ${ok}/${statements.length} statements.`)
await prisma.$disconnect()
