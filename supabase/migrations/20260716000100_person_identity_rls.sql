-- ============================================================================
-- Global Person identity RLS — deny PostgREST (anon/authenticated) by default
-- Date: 2026-07-16
--
-- Person / PersonIdentityMatch hold cross-clinic PII (phone, email, hashed national ID).
-- Prisma / service-role bypasses RLS; this closes the Supabase-client door.
-- BookingIdempotency is platform-internal (also Prisma-only).
-- Canonical map: lib/security/rls-inventory.ts
-- ============================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'Person',
    'PersonIdentityMatch',
    'BookingIdempotency'
  ]
  loop
    if to_regclass(format('public.%I', t)) is not null then
      execute format('alter table %I enable row level security', t);
    end if;
  end loop;
end $$;

-- Explicit deny policies for authenticated role (belt + suspenders with empty policy set).
-- No SELECT/INSERT/UPDATE/DELETE policies for anon or authenticated → PostgREST returns empty/denied.
-- Service role and direct Postgres (Prisma) continue to bypass RLS.

drop policy if exists "person_deny_authenticated" on "Person";
create policy "person_deny_authenticated" on "Person"
  for all
  to authenticated
  using (false)
  with check (false);

drop policy if exists "person_deny_anon" on "Person";
create policy "person_deny_anon" on "Person"
  for all
  to anon
  using (false)
  with check (false);

drop policy if exists "person_identity_match_deny_authenticated" on "PersonIdentityMatch";
create policy "person_identity_match_deny_authenticated" on "PersonIdentityMatch"
  for all
  to authenticated
  using (false)
  with check (false);

drop policy if exists "person_identity_match_deny_anon" on "PersonIdentityMatch";
create policy "person_identity_match_deny_anon" on "PersonIdentityMatch"
  for all
  to anon
  using (false)
  with check (false);

drop policy if exists "booking_idempotency_deny_authenticated" on "BookingIdempotency";
create policy "booking_idempotency_deny_authenticated" on "BookingIdempotency"
  for all
  to authenticated
  using (false)
  with check (false);

drop policy if exists "booking_idempotency_deny_anon" on "BookingIdempotency";
create policy "booking_idempotency_deny_anon" on "BookingIdempotency"
  for all
  to anon
  using (false)
  with check (false);
