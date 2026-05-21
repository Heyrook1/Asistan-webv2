-- ============================================================================
-- Race-free patient number generation
-- Date: 2026-05-20
--
-- Generates HST-1001 style numbers under a per-business advisory transaction
-- lock. The trigger covers direct SQL/API inserts; application code also calls
-- the function explicitly so Prisma keeps its required patientNumber field.
-- ============================================================================

create or replace function public.next_patient_number(target_business_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_number integer;
begin
  perform pg_advisory_xact_lock(hashtext(target_business_id::text));

  select coalesce(
    max(nullif(substring("patientNumber" from '^HST-([0-9]+)$'), '')::integer),
    1000
  ) + 1
  into next_number
  from "Patient"
  where "businessId" = target_business_id;

  return 'HST-' || next_number::text;
end;
$$;

create or replace function public.set_patient_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new."patientNumber" is null or btrim(new."patientNumber") = '' then
    new."patientNumber" := public.next_patient_number(new."businessId");
  end if;

  return new;
end;
$$;

drop trigger if exists "Patient_set_patient_number" on "Patient";
create trigger "Patient_set_patient_number"
  before insert on "Patient"
  for each row
  execute function public.set_patient_number();
