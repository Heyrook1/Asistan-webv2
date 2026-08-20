-- D1: WhatsApp front-desk booking sessions (rules agent on slot engine)

alter table "Business"
  add column if not exists "whatsappAgentEnabled" boolean not null default false;

create table if not exists "FrontDeskSession" (
  "id" text primary key default gen_random_uuid()::text,
  "businessId" text not null references "Business"("id") on delete cascade,
  "channel" text not null default 'whatsapp',
  "peerKey" text not null,
  "step" text not null default 'idle',
  "draft" jsonb not null default '{}'::jsonb,
  "lastInboundId" text,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create unique index if not exists "FrontDeskSession_business_channel_peer_uidx"
  on "FrontDeskSession" ("businessId", "channel", "peerKey");

create index if not exists "FrontDeskSession_expires_idx"
  on "FrontDeskSession" ("expiresAt");

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'asistan_app') then
    grant select, insert, update, delete on table "FrontDeskSession" to asistan_app;
  end if;

  if to_regclass('public."FrontDeskSession"') is not null then
    alter table "FrontDeskSession" enable row level security;
    alter table "FrontDeskSession" force row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'FrontDeskSession'
        and policyname = 'front_desk_session_prisma_guc'
    ) then
      create policy front_desk_session_prisma_guc on "FrontDeskSession"
        for all
        to asistan_app
        using (
          nullif(current_setting('app.current_business_id', true), '') is not null
          and "businessId" = current_setting('app.current_business_id', true)
        )
        with check (
          nullif(current_setting('app.current_business_id', true), '') is not null
          and "businessId" = current_setting('app.current_business_id', true)
        );
    end if;
  end if;
exception
  when undefined_object then null;
  when insufficient_privilege then null;
end $$;
