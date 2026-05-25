-- ============================================================================
-- Multi-location foundation
-- Date: 2026-05-24
-- ============================================================================

create table if not exists "Location" (
  "id" uuid primary key default gen_random_uuid(),
  "businessId" uuid not null references "Business"("id") on delete cascade,
  "name" text not null,
  "address" text,
  "city" text,
  "phone" text,
  "isActive" boolean not null default true,
  "sortOrder" integer not null default 0,
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "Location_business_active_idx"
  on "Location" ("businessId", "isActive");

create index if not exists "Location_business_sort_name_idx"
  on "Location" ("businessId", "sortOrder", "name");

alter table "Appointment"
  add column if not exists "locationId" uuid;

do $$ begin
  alter table "Appointment"
    add constraint "Appointment_locationId_fkey"
    foreign key ("locationId") references "Location"("id") on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists "Appointment_business_location_date_idx"
  on "Appointment" ("businessId", "locationId", "date");

-- For existing tenants, create one default branch if they already have
-- appointments but no location rows.
insert into "Location" ("businessId", "name", "address", "city", "phone", "isActive", "sortOrder")
select
  b."id",
  'Merkez Sube',
  b."address",
  b."city",
  b."phone",
  true,
  0
from "Business" b
where exists (
  select 1
  from "Appointment" a
  where a."businessId" = b."id"
    and a."locationId" is null
)
and not exists (
  select 1
  from "Location" l
  where l."businessId" = b."id"
    and l."deletedAt" is null
);

with "FirstLocation" as (
  select distinct on (l."businessId")
    l."businessId",
    l."id"
  from "Location" l
  where l."deletedAt" is null
  order by l."businessId", l."sortOrder" asc, l."createdAt" asc
)
update "Appointment" a
set "locationId" = f."id"
from "FirstLocation" f
where a."locationId" is null
  and a."businessId" = f."businessId";
