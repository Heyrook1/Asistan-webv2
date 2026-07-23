-- ============================================================================
-- Asistan Health production hardening
-- Date: 2026-05-19
--
-- Adds message media storage plus RLS for notification actions and team chat.
-- Reinforces tenant access using Business membership and explicit RBAC helpers
-- from 20260518_0002_patient_files_storage_rls.sql.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'message-media',
  'message-media',
  false,
  15728640,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists "MessageAttachment" (
  "id"         uuid primary key default gen_random_uuid(),
  "messageId"  uuid not null references "Message"("id") on delete cascade,
  "fileName"   text not null,
  "fileType"   text not null,
  "fileSize"   integer not null,
  "storageKey" text not null,
  "fileUrl"    text not null,
  "createdAt"  timestamptz not null default now()
);

create index if not exists "MessageAttachment_messageId_idx" on "MessageAttachment" ("messageId");

create table if not exists "MessageReaction" (
  "id"        uuid primary key default gen_random_uuid(),
  "messageId" uuid not null references "Message"("id") on delete cascade,
  "userId"    uuid not null references "User"("id") on delete cascade,
  "emoji"     text not null,
  "createdAt" timestamptz not null default now(),
  unique ("messageId", "userId", "emoji")
);

create index if not exists "MessageReaction_messageId_idx" on "MessageReaction" ("messageId");
create index if not exists "MessageReaction_userId_idx" on "MessageReaction" ("userId");

alter table "Message" alter column "body" set default '';

create or replace function public.is_conversation_participant(target_conversation_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from "ConversationParticipant" cp
    join "Conversation" c on c.id = cp."conversationId"
    where cp."conversationId" = target_conversation_id
      and cp."isActive" = true
      and cp."userId" = auth.uid()::text
      and public.is_business_member(c."businessId")
  );
$$;

create or replace function public.message_business_id(target_message_id text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select c."businessId"
  from "Message" m
  join "Conversation" c on c.id = m."conversationId"
  where m.id = target_message_id;
$$;

create or replace function public.message_conversation_id(target_message_id text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select m."conversationId"
  from "Message" m
  where m.id = target_message_id;
$$;

create or replace function public.storage_conversation_id(object_name text)
returns text
language sql
stable
as $$
  select nullif((storage.foldername(object_name))[2], '');
$$;

alter table "NotificationAction" enable row level security;
alter table "Conversation" enable row level security;
alter table "ConversationParticipant" enable row level security;
alter table "Message" enable row level security;
alter table "MessageAttachment" enable row level security;
alter table "MessageReaction" enable row level security;

drop policy if exists "notification_action_member_select" on "NotificationAction";
create policy "notification_action_member_select" on "NotificationAction"
  for select using (
    exists (
      select 1
      from "Notification" n
      where n.id = "NotificationAction"."notificationId"
        and public.is_business_member(n."businessId")
        and (n."userId" is null or n."userId" = auth.uid()::text)
    )
  );

drop policy if exists "notification_action_member_update" on "NotificationAction";
create policy "notification_action_member_update" on "NotificationAction"
  for update using (
    exists (
      select 1
      from "Notification" n
      where n.id = "NotificationAction"."notificationId"
        and public.is_business_member(n."businessId")
        and (n."userId" is null or n."userId" = auth.uid()::text)
    )
  )
  with check (
    exists (
      select 1
      from "Notification" n
      where n.id = "NotificationAction"."notificationId"
        and public.is_business_member(n."businessId")
        and (n."userId" is null or n."userId" = auth.uid()::text)
    )
  );

drop policy if exists "conversation_participant_select" on "Conversation";
create policy "conversation_participant_select" on "Conversation"
  for select using (public.is_conversation_participant(id));

drop policy if exists "conversation_member_insert" on "Conversation";
create policy "conversation_member_insert" on "Conversation"
  for insert with check (public.is_business_member("businessId"));

drop policy if exists "conversation_participant_update" on "Conversation";
create policy "conversation_participant_update" on "Conversation"
  for update using (public.is_conversation_participant(id))
  with check (public.is_conversation_participant(id));

drop policy if exists "conversation_participant_visible" on "ConversationParticipant";
create policy "conversation_participant_visible" on "ConversationParticipant"
  for select using (public.is_conversation_participant("conversationId"));

drop policy if exists "conversation_participant_member_insert" on "ConversationParticipant";
create policy "conversation_participant_member_insert" on "ConversationParticipant"
  for insert with check (
    exists (
      select 1
      from "Conversation" c
      where c.id = "ConversationParticipant"."conversationId"
        and public.is_business_member(c."businessId")
    )
  );

drop policy if exists "conversation_participant_self_update" on "ConversationParticipant";
create policy "conversation_participant_self_update" on "ConversationParticipant"
  for update using ("userId" = auth.uid()::text and public.is_conversation_participant("conversationId"))
  with check ("userId" = auth.uid()::text and public.is_conversation_participant("conversationId"));

drop policy if exists "message_participant_select" on "Message";
create policy "message_participant_select" on "Message"
  for select using (public.is_conversation_participant("conversationId"));

drop policy if exists "message_participant_insert" on "Message";
create policy "message_participant_insert" on "Message"
  for insert with check (
    "senderUserId" = auth.uid()::text
    and public.is_conversation_participant("conversationId")
  );

drop policy if exists "message_sender_update" on "Message";
create policy "message_sender_update" on "Message"
  for update using ("senderUserId" = auth.uid()::text and public.is_conversation_participant("conversationId"))
  with check ("senderUserId" = auth.uid()::text and public.is_conversation_participant("conversationId"));

drop policy if exists "message_attachment_participant_select" on "MessageAttachment";
create policy "message_attachment_participant_select" on "MessageAttachment"
  for select using (public.is_conversation_participant(public.message_conversation_id("messageId")));

drop policy if exists "message_attachment_sender_insert" on "MessageAttachment";
create policy "message_attachment_sender_insert" on "MessageAttachment"
  for insert with check (
    public.is_conversation_participant(public.message_conversation_id("messageId"))
    and "fileUrl" = ('storage://message-media/' || "storageKey")
  );

drop policy if exists "message_reaction_participant_select" on "MessageReaction";
create policy "message_reaction_participant_select" on "MessageReaction"
  for select using (public.is_conversation_participant(public.message_conversation_id("messageId")));

drop policy if exists "message_reaction_self_manage" on "MessageReaction";
create policy "message_reaction_self_manage" on "MessageReaction"
  for all using (
    "userId" = auth.uid()::text
    and public.is_conversation_participant(public.message_conversation_id("messageId"))
  )
  with check (
    "userId" = auth.uid()::text
    and public.is_conversation_participant(public.message_conversation_id("messageId"))
  );

drop policy if exists "message_media_select" on storage.objects;
create policy "message_media_select" on storage.objects
  for select using (
    bucket_id = 'message-media'
    and public.is_business_member(public.storage_business_id(name))
    and public.is_conversation_participant(public.storage_conversation_id(name))
  );

drop policy if exists "message_media_insert" on storage.objects;
create policy "message_media_insert" on storage.objects
  for insert with check (
    bucket_id = 'message-media'
    and owner = auth.uid()
    and public.is_business_member(public.storage_business_id(name))
    and public.is_conversation_participant(public.storage_conversation_id(name))
  );

drop policy if exists "message_media_delete" on storage.objects;
create policy "message_media_delete" on storage.objects
  for delete using (
    bucket_id = 'message-media'
    and owner = auth.uid()
    and public.is_business_member(public.storage_business_id(name))
    and public.is_conversation_participant(public.storage_conversation_id(name))
  );
