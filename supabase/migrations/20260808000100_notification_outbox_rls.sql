-- NotificationOutbox + PatientChannelAttempt: close RLS policy gap.
-- Tables had ENABLE RLS with zero policies → audit fail + deny-all for everyone.
-- Additive / idempotent.

-- ── NotificationOutbox ─────────────────────────────────────────────────────
do $$
begin
  if to_regclass('public."NotificationOutbox"') is null then
    return;
  end if;

  alter table public."NotificationOutbox" enable row level security;
  alter table public."NotificationOutbox" force row level security;

  if exists (select 1 from pg_roles where rolname = 'asistan_app') then
    grant select, insert, update, delete on table public."NotificationOutbox" to asistan_app;
  end if;

  -- PostgREST closed (payload may include destination address)
  drop policy if exists notification_outbox_deny_anon on public."NotificationOutbox";
  create policy notification_outbox_deny_anon on public."NotificationOutbox"
    for all to anon
    using (false)
    with check (false);

  drop policy if exists notification_outbox_deny_authenticated on public."NotificationOutbox";
  create policy notification_outbox_deny_authenticated on public."NotificationOutbox"
    for all to authenticated
    using (false)
    with check (false);

  -- Runtime clinic path (GUC) — same pattern as Dilim-C / Q3
  if exists (select 1 from pg_roles where rolname = 'asistan_app') then
    drop policy if exists notification_outbox_prisma_guc on public."NotificationOutbox";
    create policy notification_outbox_prisma_guc on public."NotificationOutbox"
      for all
      to asistan_app
      using (
        nullif(current_setting('app.business_id', true), '') is not null
        and "businessId" = current_setting('app.business_id', true)
      )
      with check (
        nullif(current_setting('app.business_id', true), '') is not null
        and "businessId" = current_setting('app.business_id', true)
      );
  end if;
exception
  when undefined_object then null;
  when insufficient_privilege then null;
end $$;

-- ── PatientChannelAttempt (same historical gap) ────────────────────────────
-- Prefer 20260808000200_patient_channel_attempt_rls.sql (creates table + member policy).
do $$
begin
  if to_regclass('public."PatientChannelAttempt"') is null then
    return;
  end if;

  alter table public."PatientChannelAttempt" enable row level security;
  alter table public."PatientChannelAttempt" force row level security;

  if exists (select 1 from pg_roles where rolname = 'asistan_app') then
    grant select, insert, update, delete on table public."PatientChannelAttempt" to asistan_app;
  end if;

  drop policy if exists patient_channel_attempt_deny_anon on public."PatientChannelAttempt";
  create policy patient_channel_attempt_deny_anon on public."PatientChannelAttempt"
    for all to anon
    using (false)
    with check (false);

  drop policy if exists patient_channel_attempt_deny_authenticated on public."PatientChannelAttempt";

  drop policy if exists patient_channel_attempt_member_select on public."PatientChannelAttempt";
  create policy patient_channel_attempt_member_select on public."PatientChannelAttempt"
    for select to authenticated
    using (public.is_business_member("businessId"));

  if exists (select 1 from pg_roles where rolname = 'asistan_app') then
    drop policy if exists patient_channel_attempt_prisma_guc on public."PatientChannelAttempt";
    create policy patient_channel_attempt_prisma_guc on public."PatientChannelAttempt"
      for all
      to asistan_app
      using (
        nullif(current_setting('app.business_id', true), '') is not null
        and "businessId" = current_setting('app.business_id', true)
      )
      with check (
        nullif(current_setting('app.business_id', true), '') is not null
        and "businessId" = current_setting('app.business_id', true)
      );
  end if;
exception
  when undefined_object then null;
  when insufficient_privilege then null;
end $$;
