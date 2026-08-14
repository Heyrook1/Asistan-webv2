-- ============================================================================
-- Lead capture + platform internals — deny PostgREST (anon/authenticated)
-- Date: 2026-08-11
--
-- These tables were in the Prisma schema but absent from the RLS inventory, so
-- `pnpm check:rls-inventory` flagged them and nothing enforced a posture:
--   ContactLead           name, email, phone, free-text message, KVKK consent
--   TourismLead           fullName, phone, email, procedureInterest (health intent)
--   DemoBooking           name, clinic, email, requested slot
--   NewsletterSubscriber  email
--   ProcessedWebhookEvent platform-internal idempotency ledger
--
-- Every one of them is written exclusively through Prisma (server actions and
-- API routes — app/contact/actions.ts, app/api/{tourism-leads,demo-booking,
-- newsletter}/route.ts, app/api/webhooks/stripe/route.ts). None is touched via
-- supabase-js `.from()`, so closing PostgREST breaks no live path.
--
-- Prisma / service-role bypass RLS; these policies exist to shut the
-- Supabase-client door, not to grant access.
-- Canonical map: lib/security/rls-inventory.ts
-- ============================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'ContactLead',
    'TourismLead',
    'DemoBooking',
    'NewsletterSubscriber',
    'ProcessedWebhookEvent'
  ]
  loop
    if to_regclass(format('public.%I', t)) is not null then
      execute format('alter table %I enable row level security', t);

      execute format(
        'drop policy if exists %I on %I',
        format('%s_deny_authenticated', t), t
      );
      execute format(
        'create policy %I on %I for all to authenticated using (false) with check (false)',
        format('%s_deny_authenticated', t), t
      );

      execute format(
        'drop policy if exists %I on %I',
        format('%s_deny_anon', t), t
      );
      execute format(
        'create policy %I on %I for all to anon using (false) with check (false)',
        format('%s_deny_anon', t), t
      );
    end if;
  end loop;
end $$;
