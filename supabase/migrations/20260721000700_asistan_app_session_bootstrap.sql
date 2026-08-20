-- ============================================================================
-- asistan_app session bootstrap — User / Business / TeamMember self-discovery
-- Date: 2026-07-21
--
-- Runtime Prisma as asistan_app has NOBYPASSRLS. Legacy "User"/"Business" RLS
-- policies are auth.uid()-oriented (PostgREST) and deny INSERT for asistan_app,
-- which breaks dashboard session bootstrap (lib/session.ts user.create).
--
-- Prefer DATABASE_URL_MIGRATE (owner) for session when available; these policies
-- keep asistan_app usable when migrate URL is unset.
-- ============================================================================

-- User — clinic staff auth mirror (not businessId PHI)
drop policy if exists user_asistan_app on public."User";
create policy user_asistan_app on public."User"
  for all to asistan_app
  using (true)
  with check (true);

-- Business — clinic registry (needed before app.business_id can be set)
drop policy if exists business_asistan_app on public."Business";
create policy business_asistan_app on public."Business"
  for all to asistan_app
  using (true)
  with check (true);

-- TeamMember — membership discovery via app.auth_* (OR with existing GUC policy)
drop policy if exists teammember_asistan_app_self on public."TeamMember";
create policy teammember_asistan_app_self on public."TeamMember"
  for all to asistan_app
  using (
    (
      nullif(current_setting('app.auth_user_id', true), '') is not null
      and "userId" = nullif(current_setting('app.auth_user_id', true), '')
    )
    or (
      nullif(current_setting('app.auth_email', true), '') is not null
      and lower(email) = lower(nullif(current_setting('app.auth_email', true), ''))
    )
  )
  with check (
    (
      nullif(current_setting('app.auth_user_id', true), '') is not null
      and (
        "userId" = nullif(current_setting('app.auth_user_id', true), '')
        or "userId" is null
      )
    )
    or (
      nullif(current_setting('app.auth_email', true), '') is not null
      and lower(email) = lower(nullif(current_setting('app.auth_email', true), ''))
    )
  );

comment on policy user_asistan_app on public."User" is
  'asistan_app session bootstrap — Supabase Auth mirror';
comment on policy business_asistan_app on public."Business" is
  'asistan_app session bootstrap — clinic registry before GUC';
comment on policy teammember_asistan_app_self on public."TeamMember" is
  'asistan_app membership discovery via app.auth_user_id / app.auth_email';
