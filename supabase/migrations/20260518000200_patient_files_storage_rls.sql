-- ============================================================================
-- Asistan Health production security layer
-- Date: 2026-05-18
--
-- Secures the Prisma-managed PascalCase tables and the private Supabase Storage
-- bucket used for patient files.
-- ============================================================================

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'patient-files',
  'patient-files',
  false,
  26214400,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

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

alter table "Business" enable row level security;
alter table "User" enable row level security;
alter table "TeamMember" enable row level security;
alter table "Patient" enable row level security;
alter table "Appointment" enable row level security;
alter table "Service" enable row level security;
alter table "PatientNote" enable row level security;
alter table "Medication" enable row level security;
alter table "Allergy" enable row level security;
alter table "Treatment" enable row level security;
alter table "TreatmentPlanItem" enable row level security;
alter table "LabResult" enable row level security;
alter table "PatientFile" enable row level security;
alter table "TimelineEvent" enable row level security;
alter table "Notification" enable row level security;

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

drop policy if exists "business_member_select" on "Business";
create policy "business_member_select" on "Business"
  for select using (public.is_business_member(id));

drop policy if exists "business_owner_insert" on "Business";
create policy "business_owner_insert" on "Business"
  for insert with check ("ownerUserId" = auth.uid()::text);

drop policy if exists "business_owner_update" on "Business";
create policy "business_owner_update" on "Business"
  for update using ("ownerUserId" = auth.uid()::text) with check ("ownerUserId" = auth.uid()::text);

drop policy if exists "team_member_select" on "TeamMember";
create policy "team_member_select" on "TeamMember"
  for select using (public.is_business_member("businessId"));

drop policy if exists "team_member_manage" on "TeamMember";
create policy "team_member_manage" on "TeamMember"
  for all
  using (public.has_business_permission("businessId", 'team.manage'))
  with check (public.has_business_permission("businessId", 'team.manage'));

drop policy if exists "patient_select" on "Patient";
create policy "patient_select" on "Patient"
  for select using (public.has_business_permission("businessId", 'patient.view'));

drop policy if exists "patient_manage" on "Patient";
create policy "patient_manage" on "Patient"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (public.has_business_permission("businessId", 'patient.edit'));

drop policy if exists "appointment_select" on "Appointment";
create policy "appointment_select" on "Appointment"
  for select using (public.has_business_permission("businessId", 'appointment.manage'));

drop policy if exists "appointment_manage" on "Appointment";
create policy "appointment_manage" on "Appointment"
  for all
  using (public.has_business_permission("businessId", 'appointment.manage'))
  with check (
    public.has_business_permission("businessId", 'appointment.manage')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "service_select" on "Service";
create policy "service_select" on "Service"
  for select using (public.is_business_member("businessId"));

drop policy if exists "service_manage" on "Service";
create policy "service_manage" on "Service"
  for all
  using (public.has_business_permission("businessId", 'service.manage'))
  with check (public.has_business_permission("businessId", 'service.manage'));

drop policy if exists "patient_note_select" on "PatientNote";
create policy "patient_note_select" on "PatientNote"
  for select using (
    public.has_business_permission("businessId", 'medical_note.view')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "patient_note_manage" on "PatientNote";
create policy "patient_note_manage" on "PatientNote"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (
    public.has_business_permission("businessId", 'patient.edit')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "medication_select" on "Medication";
create policy "medication_select" on "Medication"
  for select using (
    public.has_business_permission("businessId", 'patient.view')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "medication_manage" on "Medication";
create policy "medication_manage" on "Medication"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (
    public.has_business_permission("businessId", 'patient.edit')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "allergy_select" on "Allergy";
create policy "allergy_select" on "Allergy"
  for select using (
    public.has_business_permission("businessId", 'patient.view')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "allergy_manage" on "Allergy";
create policy "allergy_manage" on "Allergy"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (
    public.has_business_permission("businessId", 'patient.edit')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "treatment_select" on "Treatment";
create policy "treatment_select" on "Treatment"
  for select using (
    public.has_business_permission("businessId", 'patient.view')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "treatment_manage" on "Treatment";
create policy "treatment_manage" on "Treatment"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (
    public.has_business_permission("businessId", 'patient.edit')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "treatment_plan_select" on "TreatmentPlanItem";
create policy "treatment_plan_select" on "TreatmentPlanItem"
  for select using (
    public.has_business_permission("businessId", 'patient.view')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "treatment_plan_manage" on "TreatmentPlanItem";
create policy "treatment_plan_manage" on "TreatmentPlanItem"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (
    public.has_business_permission("businessId", 'patient.edit')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "lab_result_select" on "LabResult";
create policy "lab_result_select" on "LabResult"
  for select using (
    public.has_business_permission("businessId", 'patient.view')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "lab_result_manage" on "LabResult";
create policy "lab_result_manage" on "LabResult"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (
    public.has_business_permission("businessId", 'patient.edit')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "patient_file_select" on "PatientFile";
create policy "patient_file_select" on "PatientFile"
  for select using (
    public.has_business_permission("businessId", 'file.view')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "patient_file_manage" on "PatientFile";
create policy "patient_file_manage" on "PatientFile"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (
    public.has_business_permission("businessId", 'patient.edit')
    and public.patient_belongs_to_business("patientId", "businessId")
    and "storageKey" like ("businessId"::text || '/' || "patientId"::text || '/%')
    and "fileUrl" = ('storage://patient-files/' || "storageKey")
  );

drop policy if exists "timeline_select" on "TimelineEvent";
create policy "timeline_select" on "TimelineEvent"
  for select using (public.has_business_permission("businessId", 'patient.view'));

drop policy if exists "timeline_manage" on "TimelineEvent";
create policy "timeline_manage" on "TimelineEvent"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (public.has_business_permission("businessId", 'patient.edit'));

drop policy if exists "notification_select" on "Notification";
create policy "notification_select" on "Notification"
  for select using (
    public.is_business_member("businessId")
    and ("userId" is null or "userId" = auth.uid()::text)
  );

drop policy if exists "notification_manage" on "Notification";
create policy "notification_manage" on "Notification"
  for all
  using (public.is_business_member("businessId"))
  with check (public.is_business_member("businessId"));

drop policy if exists "patient_files_select" on storage.objects;
create policy "patient_files_select" on storage.objects
  for select using (
    bucket_id = 'patient-files'
    and public.has_business_permission(public.storage_business_id(name), 'file.view')
    and public.patient_belongs_to_business(public.storage_patient_id(name), public.storage_business_id(name))
  );

drop policy if exists "patient_files_insert" on storage.objects;
create policy "patient_files_insert" on storage.objects
  for insert with check (
    bucket_id = 'patient-files'
    and owner = auth.uid()
    and public.has_business_permission(public.storage_business_id(name), 'patient.edit')
    and public.patient_belongs_to_business(public.storage_patient_id(name), public.storage_business_id(name))
  );

drop policy if exists "patient_files_update" on storage.objects;
create policy "patient_files_update" on storage.objects
  for update using (
    bucket_id = 'patient-files'
    and public.has_business_permission(public.storage_business_id(name), 'patient.edit')
  )
  with check (
    bucket_id = 'patient-files'
    and public.has_business_permission(public.storage_business_id(name), 'patient.edit')
    and public.patient_belongs_to_business(public.storage_patient_id(name), public.storage_business_id(name))
  );

drop policy if exists "patient_files_delete" on storage.objects;
create policy "patient_files_delete" on storage.objects
  for delete using (
    bucket_id = 'patient-files'
    and public.has_business_permission(public.storage_business_id(name), 'patient.edit')
  );
