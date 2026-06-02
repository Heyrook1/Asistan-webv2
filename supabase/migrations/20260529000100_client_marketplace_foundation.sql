-- ============================================================================
-- Asistan Client marketplace foundation
-- Date: 2026-05-29
-- ============================================================================

do $$ begin
  create type "AppointmentSource" as enum ('DASHBOARD', 'CLIENT_APP');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "ClientNotificationType" as enum (
    'BOOKING_CONFIRMATION',
    'BOOKING_PENDING',
    'BOOKING_APPROVED',
    'BOOKING_CANCELLED',
    'BOOKING_RESCHEDULED',
    'APPOINTMENT_REMINDER',
    'REVIEW_REQUEST'
  );
exception when duplicate_object then null; end $$;

alter table "Business"
  add column if not exists "locationLat" numeric(9, 6),
  add column if not exists "locationLng" numeric(9, 6),
  add column if not exists "autoConfirmClientAppointments" boolean not null default false;

alter table "TeamMember"
  add column if not exists "specialty" text,
  add column if not exists "bio" text,
  add column if not exists "isBookable" boolean not null default true;

update "TeamMember"
set "isBookable" = true
where "role" = 'DOKTOR'
  and "isBookable" is distinct from true;

create table if not exists "ClientUser" (
  "id" text primary key default gen_random_uuid(),
  "authUserId" text unique,
  "fullName" text not null,
  "phone" text,
  "email" text unique,
  "locationLat" numeric(9, 6),
  "locationLng" numeric(9, 6),
  "address" text,
  "city" text,
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "ClientUser_fullName_idx" on "ClientUser" ("fullName");
create index if not exists "ClientUser_city_idx" on "ClientUser" ("city");

create table if not exists "ServiceStaff" (
  "id" text primary key default gen_random_uuid(),
  "businessId" text not null references "Business"("id") on delete cascade,
  "serviceId" text not null references "Service"("id") on delete cascade,
  "staffId" text not null references "TeamMember"("id") on delete cascade,
  "isActive" boolean not null default true,
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "ServiceStaff_serviceId_staffId_key" unique ("serviceId", "staffId")
);

create index if not exists "ServiceStaff_business_staff_active_idx"
  on "ServiceStaff" ("businessId", "staffId", "isActive");
create index if not exists "ServiceStaff_business_service_active_idx"
  on "ServiceStaff" ("businessId", "serviceId", "isActive");

create table if not exists "TeamMemberAvailability" (
  "id" text primary key default gen_random_uuid(),
  "businessId" text not null references "Business"("id") on delete cascade,
  "staffId" text not null references "TeamMember"("id") on delete cascade,
  "locationId" text references "Location"("id") on delete set null,
  "weekday" integer not null check ("weekday" between 0 and 6),
  "startTime" text not null,
  "endTime" text not null,
  "slotIntervalMin" integer not null default 15,
  "isActive" boolean not null default true,
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "TeamMemberAvailability_staff_weekday_idx"
  on "TeamMemberAvailability" ("businessId", "staffId", "weekday", "isActive");
create index if not exists "TeamMemberAvailability_location_weekday_idx"
  on "TeamMemberAvailability" ("businessId", "locationId", "weekday", "isActive");

create table if not exists "TeamMemberUnavailableBlock" (
  "id" text primary key default gen_random_uuid(),
  "businessId" text not null references "Business"("id") on delete cascade,
  "staffId" text not null references "TeamMember"("id") on delete cascade,
  "locationId" text references "Location"("id") on delete set null,
  "date" date not null,
  "startTime" text not null,
  "endTime" text not null,
  "reason" text,
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "TeamMemberUnavailableBlock_staff_date_idx"
  on "TeamMemberUnavailableBlock" ("businessId", "staffId", "date");
create index if not exists "TeamMemberUnavailableBlock_location_date_idx"
  on "TeamMemberUnavailableBlock" ("businessId", "locationId", "date");

alter table "Appointment"
  add column if not exists "clientUserId" text references "ClientUser"("id") on delete set null,
  add column if not exists "source" "AppointmentSource" not null default 'DASHBOARD';

create index if not exists "Appointment_business_client_date_idx"
  on "Appointment" ("businessId", "clientUserId", "date");

create table if not exists "Review" (
  "id" text primary key default gen_random_uuid(),
  "businessId" text not null references "Business"("id") on delete cascade,
  "appointmentId" text not null unique references "Appointment"("id") on delete cascade,
  "clientUserId" text not null references "ClientUser"("id") on delete cascade,
  "patientId" text,
  "staffId" text references "TeamMember"("id") on delete set null,
  "serviceId" text references "Service"("id") on delete set null,
  "rating" integer not null check ("rating" between 1 and 5),
  "serviceQuality" integer check ("serviceQuality" between 1 and 5),
  "waitingTime" integer check ("waitingTime" between 1 and 5),
  "communication" integer check ("communication" between 1 and 5),
  "comment" text,
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "Review_business_staff_created_idx"
  on "Review" ("businessId", "staffId", "createdAt");
create index if not exists "Review_business_service_created_idx"
  on "Review" ("businessId", "serviceId", "createdAt");
create index if not exists "Review_client_created_idx"
  on "Review" ("clientUserId", "createdAt");

create table if not exists "ClientNotification" (
  "id" text primary key default gen_random_uuid(),
  "clientUserId" text not null references "ClientUser"("id") on delete cascade,
  "businessId" text references "Business"("id") on delete set null,
  "appointmentId" text references "Appointment"("id") on delete set null,
  "type" "ClientNotificationType" not null,
  "title" text not null,
  "message" text not null,
  "link" text,
  "metadata" jsonb,
  "isRead" boolean not null default false,
  "readAt" timestamptz,
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now()
);

create index if not exists "ClientNotification_user_unread_created_idx"
  on "ClientNotification" ("clientUserId", "isRead", "createdAt");
create index if not exists "ClientNotification_business_created_idx"
  on "ClientNotification" ("businessId", "createdAt");

alter table "ClientUser" enable row level security;
alter table "ClientNotification" enable row level security;
alter table "Review" enable row level security;

drop policy if exists "client_user_self_select" on "ClientUser";
create policy "client_user_self_select" on "ClientUser"
  for select using ("authUserId" = auth.uid()::text);

drop policy if exists "client_user_self_insert" on "ClientUser";
create policy "client_user_self_insert" on "ClientUser"
  for insert with check ("authUserId" = auth.uid()::text);

drop policy if exists "client_user_self_update" on "ClientUser";
create policy "client_user_self_update" on "ClientUser"
  for update using ("authUserId" = auth.uid()::text)
  with check ("authUserId" = auth.uid()::text);

drop policy if exists "client_notification_self_select" on "ClientNotification";
create policy "client_notification_self_select" on "ClientNotification"
  for select using (
    exists (
      select 1
      from "ClientUser" cu
      where cu."id" = "ClientNotification"."clientUserId"
        and cu."authUserId" = auth.uid()::text
    )
  );

drop policy if exists "client_notification_self_update" on "ClientNotification";
create policy "client_notification_self_update" on "ClientNotification"
  for update using (
    exists (
      select 1
      from "ClientUser" cu
      where cu."id" = "ClientNotification"."clientUserId"
        and cu."authUserId" = auth.uid()::text
    )
  )
  with check (
    exists (
      select 1
      from "ClientUser" cu
      where cu."id" = "ClientNotification"."clientUserId"
        and cu."authUserId" = auth.uid()::text
    )
  );

drop policy if exists "review_public_read" on "Review";
create policy "review_public_read" on "Review"
  for select using ("deletedAt" is null);

drop policy if exists "review_client_insert" on "Review";
create policy "review_client_insert" on "Review"
  for insert with check (
    exists (
      select 1
      from "ClientUser" cu
      where cu."id" = "Review"."clientUserId"
        and cu."authUserId" = auth.uid()::text
    )
  );
