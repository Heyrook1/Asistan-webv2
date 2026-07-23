-- D2: ClientUser ↔ Person (patient-facing Asistan passport)

alter table "ClientUser"
  add column if not exists "personId" text references "Person"("id") on delete set null;

create index if not exists "ClientUser_personId_idx" on "ClientUser" ("personId");

-- Prisma (asistan_app) must manage ClientUser rows (Bearer auth upsert).
-- Existing policies target auth.uid() for PostgREST; this is server-role only.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'asistan_app')
     and to_regclass('public."ClientUser"') is not null then
    alter table "ClientUser" enable row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'ClientUser'
        and policyname = 'client_user_asistan_app'
    ) then
      create policy client_user_asistan_app on "ClientUser"
        for all
        to asistan_app
        using (true)
        with check (true);
    end if;
  end if;
exception
  when undefined_object then null;
  when insufficient_privilege then null;
end $$;

-- Passport GUC: app.person_id — patient-owned membership + visit read (no chart PHI).
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'asistan_app') then
    return;
  end if;

  if to_regclass('public."Patient"') is not null then
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'Patient'
        and policyname = 'patient_passport_person_guc'
    ) then
      create policy patient_passport_person_guc on "Patient"
        for select
        to asistan_app
        using (
          "personId" is not null
          and "personId" = nullif(current_setting('app.person_id', true), '')
        );
    end if;
  end if;

  if to_regclass('public."Appointment"') is not null then
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'Appointment'
        and policyname = 'appointment_passport_person_guc'
    ) then
      create policy appointment_passport_person_guc on "Appointment"
        for select
        to asistan_app
        using (
          (
            "clientUserId" is not null
            and exists (
              select 1 from "ClientUser" cu
              where cu.id = "Appointment"."clientUserId"
                and cu."personId" is not null
                and cu."personId" = nullif(current_setting('app.person_id', true), '')
            )
          )
          or exists (
            select 1 from "Patient" p
            where p.id = "Appointment"."patientId"
              and p."personId" is not null
              and p."personId" = nullif(current_setting('app.person_id', true), '')
          )
        );
    end if;
  end if;
exception
  when undefined_object then null;
  when insufficient_privilege then null;
end $$;
