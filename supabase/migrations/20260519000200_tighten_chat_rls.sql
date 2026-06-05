-- ============================================================================
-- Tighten chat RLS checks
-- Date: 2026-05-19
-- ============================================================================

create or replace function public.user_belongs_to_business(
  target_user_id uuid,
  target_business_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from "Business" b
    where b.id = target_business_id
      and b."ownerUserId" = target_user_id
  )
  or exists (
    select 1
    from "TeamMember" tm
    where tm."businessId" = target_business_id
      and tm."userId" = target_user_id
      and tm."isActive" = true
  );
$$;

drop policy if exists "conversation_participant_member_insert" on "ConversationParticipant";
create policy "conversation_participant_member_insert" on "ConversationParticipant"
  for insert with check (
    exists (
      select 1
      from "Conversation" c
      where c.id = "ConversationParticipant"."conversationId"
        and public.is_conversation_participant(c.id)
        and public.user_belongs_to_business("ConversationParticipant"."userId", c."businessId")
    )
  );

drop policy if exists "message_attachment_sender_insert" on "MessageAttachment";
create policy "message_attachment_sender_insert" on "MessageAttachment"
  for insert with check (
    exists (
      select 1
      from "Message" m
      join "Conversation" c on c.id = m."conversationId"
      where m.id = "MessageAttachment"."messageId"
        and public.is_conversation_participant(c.id)
        and "MessageAttachment"."storageKey" like (c."businessId"::text || '/' || c.id::text || '/%')
        and "MessageAttachment"."fileUrl" = ('storage://message-media/' || "MessageAttachment"."storageKey")
    )
  );
