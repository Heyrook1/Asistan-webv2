-- ============================================================================
-- RLS Prisma parity — close gaps for models added after the 20260518 PascalCase layer
-- Date: 2026-07-14
--
-- Canonical map: lib/security/rls-inventory.ts
-- Legacy snake_case tables (providers/customers/…) from 20260516000100 are NOT this map.
-- Prisma / service-role bypasses RLS; this protects anon + authenticated Supabase clients.
-- ============================================================================

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

do $$
declare
  t text;
begin
  foreach t in array array[
    'Location',
    'VendorAccount',
    'MembershipPayment',
    'ServiceStaff',
    'TeamMemberAvailability',
    'TeamMemberUnavailableBlock',
    'CalendarConnection',
    'IntakeForm',
    'IntakeInvite',
    'IntakeResponse',
    'Prescription',
    'PrescriptionLine',
    'AuditLog',
    'UserConsent',
    'DataDeletionRequest',
    'ComplianceDocument',
    'Waitlist'
  ]
  loop
    if to_regclass(format('public.%I', t)) is not null then
      execute format('alter table %I enable row level security', t);
    end if;
  end loop;
end $$;

-- Location
drop policy if exists "location_member_select" on "Location";
create policy "location_member_select" on "Location"
  for select using (public.is_business_member("businessId"));

drop policy if exists "location_owner_manage" on "Location";
create policy "location_owner_manage" on "Location"
  for all
  using (public.has_business_permission("businessId", 'settings.manage'))
  with check (public.has_business_permission("businessId", 'settings.manage'));

-- VendorAccount / MembershipPayment
drop policy if exists "vendor_account_member_select" on "VendorAccount";
create policy "vendor_account_member_select" on "VendorAccount"
  for select using (public.is_business_member("businessId"));

drop policy if exists "vendor_account_owner_manage" on "VendorAccount";
create policy "vendor_account_owner_manage" on "VendorAccount"
  for all
  using (public.has_business_permission("businessId", 'settings.manage'))
  with check (public.has_business_permission("businessId", 'settings.manage'));

drop policy if exists "membership_payment_member_select" on "MembershipPayment";
create policy "membership_payment_member_select" on "MembershipPayment"
  for select using (public.is_business_member("businessId"));

drop policy if exists "membership_payment_owner_manage" on "MembershipPayment";
create policy "membership_payment_owner_manage" on "MembershipPayment"
  for all
  using (public.has_business_permission("businessId", 'settings.manage'))
  with check (public.has_business_permission("businessId", 'settings.manage'));

-- ServiceStaff / availability / busy blocks
drop policy if exists "service_staff_member_select" on "ServiceStaff";
create policy "service_staff_member_select" on "ServiceStaff"
  for select using (public.is_business_member("businessId"));

drop policy if exists "service_staff_manage" on "ServiceStaff";
create policy "service_staff_manage" on "ServiceStaff"
  for all
  using (public.has_business_permission("businessId", 'service.manage'))
  with check (public.has_business_permission("businessId", 'service.manage'));

drop policy if exists "availability_member_select" on "TeamMemberAvailability";
create policy "availability_member_select" on "TeamMemberAvailability"
  for select using (public.is_business_member("businessId"));

drop policy if exists "availability_manage" on "TeamMemberAvailability";
create policy "availability_manage" on "TeamMemberAvailability"
  for all
  using (public.has_business_permission("businessId", 'appointment.manage'))
  with check (public.has_business_permission("businessId", 'appointment.manage'));

drop policy if exists "unavailable_member_select" on "TeamMemberUnavailableBlock";
create policy "unavailable_member_select" on "TeamMemberUnavailableBlock"
  for select using (public.is_business_member("businessId"));

drop policy if exists "unavailable_manage" on "TeamMemberUnavailableBlock";
create policy "unavailable_manage" on "TeamMemberUnavailableBlock"
  for all
  using (public.has_business_permission("businessId", 'appointment.manage'))
  with check (public.has_business_permission("businessId", 'appointment.manage'));

-- CalendarConnection (contains encrypted OAuth material)
drop policy if exists "calendar_connection_member_select" on "CalendarConnection";
create policy "calendar_connection_member_select" on "CalendarConnection"
  for select using (public.has_business_permission("businessId", 'settings.manage'));

drop policy if exists "calendar_connection_manage" on "CalendarConnection";
create policy "calendar_connection_manage" on "CalendarConnection"
  for all
  using (public.has_business_permission("businessId", 'settings.manage'))
  with check (public.has_business_permission("businessId", 'settings.manage'));

-- Intake
drop policy if exists "intake_form_member_select" on "IntakeForm";
create policy "intake_form_member_select" on "IntakeForm"
  for select using (public.is_business_member("businessId"));

drop policy if exists "intake_form_manage" on "IntakeForm";
create policy "intake_form_manage" on "IntakeForm"
  for all
  using (public.has_business_permission("businessId", 'settings.manage'))
  with check (public.has_business_permission("businessId", 'settings.manage'));

drop policy if exists "intake_invite_member_select" on "IntakeInvite";
create policy "intake_invite_member_select" on "IntakeInvite"
  for select using (public.has_business_permission("businessId", 'patient.view'));

drop policy if exists "intake_invite_manage" on "IntakeInvite";
create policy "intake_invite_manage" on "IntakeInvite"
  for all
  using (public.has_business_permission("businessId", 'appointment.manage'))
  with check (public.has_business_permission("businessId", 'appointment.manage'));

drop policy if exists "intake_response_member_select" on "IntakeResponse";
create policy "intake_response_member_select" on "IntakeResponse"
  for select using (public.has_business_permission("businessId", 'patient.view'));

drop policy if exists "intake_response_manage" on "IntakeResponse";
create policy "intake_response_manage" on "IntakeResponse"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (public.has_business_permission("businessId", 'patient.edit'));

-- Prescriptions
drop policy if exists "prescription_member_select" on "Prescription";
create policy "prescription_member_select" on "Prescription"
  for select using (public.has_business_permission("businessId", 'medical_note.view'));

drop policy if exists "prescription_manage" on "Prescription";
create policy "prescription_manage" on "Prescription"
  for all
  using (public.has_business_permission("businessId", 'medical_note.create'))
  with check (public.has_business_permission("businessId", 'medical_note.create'));

drop policy if exists "prescription_line_select" on "PrescriptionLine";
create policy "prescription_line_select" on "PrescriptionLine"
  for select using (
    exists (
      select 1 from "Prescription" p
      where p.id = "PrescriptionLine"."prescriptionId"
        and public.has_business_permission(p."businessId", 'medical_note.view')
    )
  );

drop policy if exists "prescription_line_manage" on "PrescriptionLine";
create policy "prescription_line_manage" on "PrescriptionLine"
  for all
  using (
    exists (
      select 1 from "Prescription" p
      where p.id = "PrescriptionLine"."prescriptionId"
        and public.has_business_permission(p."businessId", 'medical_note.create')
    )
  )
  with check (
    exists (
      select 1 from "Prescription" p
      where p.id = "PrescriptionLine"."prescriptionId"
        and public.has_business_permission(p."businessId", 'medical_note.create')
    )
  );

-- Governance (businessId may be text in older SQL + uuid in Prisma — support both)
drop policy if exists "audit_log_member_select" on "AuditLog";
create policy "audit_log_member_select" on "AuditLog"
  for select using (
    "businessId" is not null
    and public.is_business_member_text("businessId"::text)
  );

drop policy if exists "audit_log_member_insert" on "AuditLog";
create policy "audit_log_member_insert" on "AuditLog"
  for insert with check (
    "businessId" is null
    or public.is_business_member_text("businessId"::text)
  );

drop policy if exists "user_consent_self" on "UserConsent";
create policy "user_consent_self" on "UserConsent"
  for all
  using ("userId"::text = auth.uid()::text)
  with check ("userId"::text = auth.uid()::text);

drop policy if exists "deletion_request_self_select" on "DataDeletionRequest";
create policy "deletion_request_self_select" on "DataDeletionRequest"
  for select using (
    "userId"::text = auth.uid()::text
    or (
      "businessId" is not null
      and public.is_business_member_text("businessId"::text)
    )
  );

drop policy if exists "deletion_request_self_insert" on "DataDeletionRequest";
create policy "deletion_request_self_insert" on "DataDeletionRequest"
  for insert with check ("userId"::text = auth.uid()::text);

drop policy if exists "compliance_doc_member_select" on "ComplianceDocument";
create policy "compliance_doc_member_select" on "ComplianceDocument"
  for select using (
    "businessId" is null
    or public.is_business_member_text("businessId"::text)
  );

drop policy if exists "compliance_doc_owner_manage" on "ComplianceDocument";
create policy "compliance_doc_owner_manage" on "ComplianceDocument"
  for all
  using (
    "businessId" is not null
    and public.has_business_permission("businessId", 'settings.manage')
  )
  with check (
    "businessId" is not null
    and public.has_business_permission("businessId", 'settings.manage')
  );

-- Waitlist: enable RLS with no anon/auth policies → deny via PostgREST; app uses Prisma/service role
-- (intentional empty policy set beyond enable)
