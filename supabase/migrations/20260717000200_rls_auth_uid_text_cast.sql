-- ============================================================================
-- RLS auth.uid() text cast parity (Prisma String user ids)
-- Date: 2026-07-17
--
-- Supabase auth.uid() returns uuid; Prisma User.id and userId FKs are text.
-- Idempotent re-apply of helper functions + policies that compare user ids.
-- Safe on DBs that already ran patched 20260518/19/20 migrations.
-- ============================================================================

create or replace function public.current_business_ids()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(distinct b.id), array[]::text[])
  from "Business" b
  left join "TeamMember" tm on tm."businessId" = b.id
  left join "User" u on u.id = auth.uid()::text
  where b."ownerUserId" = auth.uid()::text
     or (
       tm."isActive" = true
       and (
         tm."userId" = auth.uid()::text
         or lower(tm.email) = lower(coalesce(u.email, auth.jwt() ->> 'email'))
       )
     );
$$;

create or replace function public.is_business_member(target_business_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_business_id = any(public.current_business_ids());
$$;

create or replace function public.has_business_permission(
  target_business_id text,
  required_permission text default null
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
      and b."ownerUserId" = auth.uid()::text
  )
  or exists (
    select 1
    from "TeamMember" tm
    left join "User" u on u.id = auth.uid()::text
    where tm."businessId" = target_business_id
      and tm."isActive" = true
      and (
        tm."userId" = auth.uid()::text
        or lower(tm.email) = lower(coalesce(u.email, auth.jwt() ->> 'email'))
      )
      and (
        required_permission is null
        or tm.role in ('SUPER_ADMIN', 'ISLETME_SAHIBI')
        or tm.permissions @> array[required_permission]::text[]
      )
  );
$$;

create or replace function public.storage_business_id(object_name text)
returns text
language sql
stable
as $$
  select nullif((storage.foldername(object_name))[1], '');
$$;

create or replace function public.storage_patient_id(object_name text)
returns text
language sql
stable
as $$
  select nullif((storage.foldername(object_name))[2], '');
$$;

create or replace function public.patient_belongs_to_business(target_patient_id text, target_business_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from "Patient" p
    where p.id = target_patient_id
      and p."businessId" = target_business_id
  );
$$;

create or replace function public.is_business_member_text(target_business_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when target_business_id is null or target_business_id = '' then false
    else public.is_business_member(target_business_id)
  end;
$$;

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

create or replace function public.user_belongs_to_business(
  target_user_id text,
  target_business_id text
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

drop policy if exists "user_self_select" on "User";
create policy "user_self_select" on "User"
  for select using (id = auth.uid()::text);

drop policy if exists "user_self_update" on "User";
create policy "user_self_update" on "User"
  for update using (id = auth.uid()::text) with check (id = auth.uid()::text);

drop policy if exists "user_business_member_select" on "User";
create policy "user_business_member_select" on "User"
  for select using (
    exists (
      select 1
      from "TeamMember" viewer
      join "TeamMember" target on target."businessId" = viewer."businessId"
      where target."userId" = "User".id
        and viewer."isActive" = true
        and (
          viewer."userId" = auth.uid()::text
          or lower(viewer.email) = lower(auth.jwt() ->> 'email')
        )
    )
  );

drop policy if exists "business_owner_insert" on "Business";
create policy "business_owner_insert" on "Business"
  for insert with check ("ownerUserId" = auth.uid()::text);

drop policy if exists "business_owner_update" on "Business";
create policy "business_owner_update" on "Business"
  for update using ("ownerUserId" = auth.uid()::text) with check ("ownerUserId" = auth.uid()::text);

drop policy if exists "notification_select" on "Notification";
create policy "notification_select" on "Notification"
  for select using (
    public.is_business_member("businessId")
    and ("userId" is null or "userId" = auth.uid()::text)
  );

-- Reminder / push (re-assert text cast)
drop policy if exists "reminder_self_select" on "Reminder";
create policy "reminder_self_select" on "Reminder"
  for select using (
    "userId" = auth.uid()::text
    and public.is_business_member("businessId")
  );

drop policy if exists "reminder_self_insert" on "Reminder";
create policy "reminder_self_insert" on "Reminder"
  for insert with check (
    "userId" = auth.uid()::text
    and public.is_business_member("businessId")
  );

drop policy if exists "reminder_self_update" on "Reminder";
create policy "reminder_self_update" on "Reminder"
  for update using (
    "userId" = auth.uid()::text
    and public.is_business_member("businessId")
  )
  with check (
    "userId" = auth.uid()::text
    and public.is_business_member("businessId")
  );

drop policy if exists "reminder_self_delete" on "Reminder";
create policy "reminder_self_delete" on "Reminder"
  for delete using (
    "userId" = auth.uid()::text
    and public.is_business_member("businessId")
  );

drop policy if exists "push_subscription_self_select" on "PushSubscription";
create policy "push_subscription_self_select" on "PushSubscription"
  for select using (
    "userId" = auth.uid()::text
    and public.is_business_member("businessId")
  );

drop policy if exists "push_subscription_self_insert" on "PushSubscription";
create policy "push_subscription_self_insert" on "PushSubscription"
  for insert with check (
    "userId" = auth.uid()::text
    and public.is_business_member("businessId")
  );

drop policy if exists "push_subscription_self_update" on "PushSubscription";
create policy "push_subscription_self_update" on "PushSubscription"
  for update using (
    "userId" = auth.uid()::text
    and public.is_business_member("businessId")
  )
  with check (
    "userId" = auth.uid()::text
    and public.is_business_member("businessId")
  );

drop policy if exists "push_subscription_self_delete" on "PushSubscription";
create policy "push_subscription_self_delete" on "PushSubscription"
  for delete using (
    "userId" = auth.uid()::text
    and public.is_business_member("businessId")
  );
