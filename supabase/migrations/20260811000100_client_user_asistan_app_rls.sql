-- ClientUser: asistan_app must DML for Bearer auth upsert (patient PWA).
-- Legacy policies are auth.uid()-only (PostgREST). Prisma connects as asistan_app
-- with no JWT → those policies deny INSERT/SELECT and /api/client/profile|passport 500.
--
-- Re-asserts grant + policy (idempotent). Pair with clientIdentityPrisma() bootstrap
-- when migrate URL is set and this policy is not yet applied.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'asistan_app') then
    raise notice 'asistan_app role missing — skip ClientUser policy';
    return;
  end if;

  if to_regclass('public."ClientUser"') is null then
    raise notice 'ClientUser missing — skip';
    return;
  end if;

  grant select, insert, update, delete on table public."ClientUser" to asistan_app;

  alter table public."ClientUser" enable row level security;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ClientUser'
      and policyname = 'client_user_asistan_app'
  ) then
    create policy client_user_asistan_app on public."ClientUser"
      for all
      to asistan_app
      using (true)
      with check (true);
  end if;
end $$;
