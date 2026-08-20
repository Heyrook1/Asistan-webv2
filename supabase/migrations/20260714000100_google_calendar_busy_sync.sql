-- Google Calendar busy-block sync (FreeBusy import). Write-back deferred.

do $$ begin
  create type "CalendarProvider" as enum ('GOOGLE', 'OUTLOOK');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type "UnavailableBlockSource" as enum ('MANUAL', 'GOOGLE_CALENDAR', 'OUTLOOK');
exception when duplicate_object then null;
end $$;

create table if not exists "CalendarConnection" (
  "id" text primary key default gen_random_uuid()::text,
  "businessId" text not null references "Business"("id") on delete cascade,
  "staffId" text not null references "TeamMember"("id") on delete cascade,
  "provider" "CalendarProvider" not null,
  "calendarId" text not null default 'primary',
  "accountEmail" text,
  "accessTokenEncrypted" text not null,
  "refreshTokenEncrypted" text not null,
  "tokenExpiresAt" timestamptz,
  "syncEnabled" boolean not null default true,
  "lastSyncAt" timestamptz,
  "lastError" text,
  "connectedByUserId" text,
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create unique index if not exists "CalendarConnection_business_staff_provider_uidx"
  on "CalendarConnection" ("businessId", "staffId", "provider");
create index if not exists "CalendarConnection_business_sync_idx"
  on "CalendarConnection" ("businessId", "syncEnabled");
create index if not exists "CalendarConnection_provider_sync_idx"
  on "CalendarConnection" ("provider", "syncEnabled", "lastSyncAt");

alter table "TeamMemberUnavailableBlock"
  add column if not exists "source" "UnavailableBlockSource" not null default 'MANUAL',
  add column if not exists "externalEventId" text,
  add column if not exists "calendarConnectionId" text references "CalendarConnection"("id") on delete cascade,
  add column if not exists "syncedAt" timestamptz;

create unique index if not exists "TeamMemberUnavailableBlock_connection_external_alive_uidx"
  on "TeamMemberUnavailableBlock" ("calendarConnectionId", "externalEventId")
  where "deletedAt" is null and "externalEventId" is not null;
create index if not exists "TeamMemberUnavailableBlock_connection_source_idx"
  on "TeamMemberUnavailableBlock" ("calendarConnectionId", "source", "deletedAt");
create index if not exists "TeamMemberUnavailableBlock_connection_external_idx"
  on "TeamMemberUnavailableBlock" ("calendarConnectionId", "externalEventId");
