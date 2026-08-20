-- ============================================================================
-- Reminder and push subscription RLS
-- Date: 2026-05-20
--
-- Closes the remaining Prisma-managed user-scoped tables so direct Supabase
-- client access cannot read or mutate another user's reminder/subscription data.
-- ============================================================================

alter table "Reminder" enable row level security;
alter table "PushSubscription" enable row level security;

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
