-- ============================================================================
-- RLS PHI hardening — businessId-scoped policies + PostgREST deny gaps
-- Date: 2026-07-17
--
-- Idempotent gap-close on top of 20260518 + 20260519 + 20260714 + 20260716.
-- Canonical inventory: lib/security/rls-policy-inventory.ts
-- ============================================================================

-- ── Waitlist: platform-only (email capture) — deny anon/authenticated like Person
drop policy if exists "waitlist_deny_authenticated" on "Waitlist";
create policy "waitlist_deny_authenticated" on "Waitlist"
  for all
  to authenticated
  using (false)
  with check (false);

drop policy if exists "waitlist_deny_anon" on "Waitlist";
create policy "waitlist_deny_anon" on "Waitlist"
  for all
  to anon
  using (false)
  with check (false);

-- ── Review: clinic staff see own-business reviews (marketplace public read stays)
drop policy if exists "review_member_select" on "Review";
create policy "review_member_select" on "Review"
  for select using (public.is_business_member("businessId"));

-- ── Appointment: patient PWA path — own bookings via ClientUser (OR clinic policies)
drop policy if exists "appointment_client_select" on "Appointment";
create policy "appointment_client_select" on "Appointment"
  for select using (
    "clientUserId" is not null
    and exists (
      select 1
      from "ClientUser" cu
      where cu.id = "Appointment"."clientUserId"
        and cu."authUserId" = auth.uid()::text
    )
  );

-- ── Re-assert RLS enabled on all PHI tenant tables (no-op if already on)
do $$
declare
  t text;
begin
  foreach t in array array[
    'Business', 'User', 'TeamMember', 'Patient', 'Appointment', 'Service',
    'PatientNote', 'Medication', 'Allergy', 'Treatment', 'TreatmentPlanItem',
    'LabResult', 'PatientFile', 'TimelineEvent', 'Notification', 'NotificationAction',
    'Conversation', 'ConversationParticipant', 'Message', 'MessageAttachment', 'MessageReaction',
    'Reminder', 'PushSubscription', 'ClientUser', 'ClientNotification', 'Review',
    'Location', 'VendorAccount', 'MembershipPayment', 'ServiceStaff',
    'TeamMemberAvailability', 'TeamMemberUnavailableBlock', 'CalendarConnection',
    'IntakeForm', 'IntakeInvite', 'IntakeResponse', 'Prescription', 'PrescriptionLine',
    'AuditLog', 'UserConsent', 'DataDeletionRequest', 'ComplianceDocument', 'Waitlist',
    'Person', 'PersonIdentityMatch', 'BookingIdempotency'
  ]
  loop
    if to_regclass(format('public.%I', t)) is not null then
      execute format('alter table %I enable row level security', t);
    end if;
  end loop;
end $$;

-- ── ClientNotification: clinic members may read notifications tied to their business
drop policy if exists "client_notification_business_select" on "ClientNotification";
create policy "client_notification_business_select" on "ClientNotification"
  for select using (
    "businessId" is not null
    and public.is_business_member("businessId")
  );
