-- ============================================================================
-- Runtime schema parity with prisma/schema.prisma
-- Date: 2026-05-19
--
-- Adds the notification, reminder, push subscription, and messaging tables that
-- later RLS/realtime migrations depend on. Keep this before
-- 20260519000100_production_rls_messaging_storage.sql.
-- ============================================================================

do $$ begin
  create type "NotificationPriority" as enum ('LOW','NORMAL','HIGH','URGENT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "NotificationActionStatus" as enum ('PENDING','COMPLETED','CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "NotificationActionType" as enum (
    'APPOINTMENT_APPROVE',
    'APPOINTMENT_CANCEL',
    'APPOINTMENT_RESCHEDULE',
    'OPEN_LINK',
    'OPEN_PATIENT',
    'OPEN_APPOINTMENT',
    'ACK'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type "ReminderPriority" as enum ('LOW','NORMAL','HIGH');
exception when duplicate_object then null; end $$;

alter table "Notification" add column if not exists "actorUserId" uuid;
alter table "Notification" add column if not exists "subtype" text;
alter table "Notification" add column if not exists "entityType" text;
alter table "Notification" add column if not exists "entityId" text;
alter table "Notification" add column if not exists "priority" "NotificationPriority" not null default 'NORMAL';
alter table "Notification" add column if not exists "actionRequired" boolean not null default false;
alter table "Notification" add column if not exists "metadata" jsonb;
alter table "Notification" add column if not exists "archivedAt" timestamptz;

do $$ begin
  alter table "Notification"
    add constraint "Notification_actorUserId_fkey"
    foreign key ("actorUserId") references "User"("id") on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists "Notification_business_entity_idx" on "Notification" ("businessId", "entityType", "entityId");
create index if not exists "Notification_business_archived_idx" on "Notification" ("businessId", "archivedAt");

create table if not exists "NotificationAction" (
  "id"             uuid primary key default gen_random_uuid(),
  "notificationId" uuid not null references "Notification"("id") on delete cascade,
  "label"          text not null,
  "actionType"     "NotificationActionType" not null,
  "payload"        jsonb,
  "status"         "NotificationActionStatus" not null default 'PENDING',
  "completedBy"    text,
  "completedAt"    timestamptz,
  "createdAt"      timestamptz not null default now()
);
create index if not exists "NotificationAction_notification_status_idx" on "NotificationAction" ("notificationId", "status");

create table if not exists "PushSubscription" (
  "id"         uuid primary key default gen_random_uuid(),
  "businessId" uuid not null references "Business"("id") on delete cascade,
  "userId"     uuid not null references "User"("id") on delete cascade,
  "endpoint"   text unique not null,
  "p256dh"     text not null,
  "auth"       text not null,
  "userAgent"  text,
  "createdAt"  timestamptz not null default now(),
  "lastUsedAt" timestamptz
);
create index if not exists "PushSubscription_userId_idx" on "PushSubscription" ("userId");
create index if not exists "PushSubscription_businessId_idx" on "PushSubscription" ("businessId");

create table if not exists "Reminder" (
  "id"         uuid primary key default gen_random_uuid(),
  "businessId" uuid not null references "Business"("id") on delete cascade,
  "userId"     uuid not null references "User"("id") on delete cascade,
  "title"      text not null,
  "note"       text,
  "dueAt"      timestamptz,
  "isDone"     boolean not null default false,
  "priority"   "ReminderPriority" not null default 'NORMAL',
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);
create index if not exists "Reminder_business_user_done_due_idx" on "Reminder" ("businessId", "userId", "isDone", "dueAt");

create table if not exists "Conversation" (
  "id"            uuid primary key default gen_random_uuid(),
  "businessId"    uuid not null references "Business"("id") on delete cascade,
  "title"         text,
  "isGroup"       boolean not null default false,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now(),
  "lastMessageAt" timestamptz
);
create index if not exists "Conversation_business_lastMessage_idx" on "Conversation" ("businessId", "lastMessageAt");

create table if not exists "ConversationParticipant" (
  "id"             uuid primary key default gen_random_uuid(),
  "conversationId" uuid not null references "Conversation"("id") on delete cascade,
  "userId"         uuid not null references "User"("id") on delete cascade,
  "joinedAt"       timestamptz not null default now(),
  "lastReadAt"     timestamptz,
  "isActive"       boolean not null default true,
  unique ("conversationId", "userId")
);
create index if not exists "ConversationParticipant_user_lastRead_idx" on "ConversationParticipant" ("userId", "lastReadAt");

create table if not exists "Message" (
  "id"             uuid primary key default gen_random_uuid(),
  "conversationId" uuid not null references "Conversation"("id") on delete cascade,
  "senderUserId"   uuid not null references "User"("id") on delete cascade,
  "body"           text not null default '',
  "createdAt"      timestamptz not null default now(),
  "editedAt"       timestamptz,
  "deletedAt"      timestamptz
);
create index if not exists "Message_conversation_created_idx" on "Message" ("conversationId", "createdAt");
create index if not exists "Message_senderUserId_idx" on "Message" ("senderUserId");
