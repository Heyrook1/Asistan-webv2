-- D3: KKTC medical-tourism inbound leads (not a travel agency)

create table if not exists "TourismLead" (
  "id" text primary key default gen_random_uuid()::text,
  "fullName" text not null,
  "phone" text not null,
  "email" text,
  "preferredLang" text not null default 'en',
  "procedureInterest" text not null,
  "travelDates" text,
  "clinicSlug" text,
  "notes" text,
  "source" text not null default 'visit-cyprus',
  "status" text not null default 'NEW',
  "createdAt" timestamptz not null default now()
);

create index if not exists "TourismLead_created_idx" on "TourismLead" ("createdAt" desc);
create index if not exists "TourismLead_status_idx" on "TourismLead" ("status");
create index if not exists "TourismLead_lang_idx" on "TourismLead" ("preferredLang");

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'asistan_app') then
    grant select, insert, update, delete on table "TourismLead" to asistan_app;
  end if;

  if to_regclass('public."TourismLead"') is not null then
    alter table "TourismLead" enable row level security;
    alter table "TourismLead" force row level security;

    -- Deny PostgREST anon/authenticated; Prisma asistan_app may insert/select.
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'TourismLead'
        and policyname = 'tourism_lead_deny_postgrest'
    ) then
      create policy tourism_lead_deny_postgrest on "TourismLead"
        for all to anon, authenticated
        using (false) with check (false);
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'TourismLead'
        and policyname = 'tourism_lead_asistan_app'
    ) then
      create policy tourism_lead_asistan_app on "TourismLead"
        for all to asistan_app
        using (true) with check (true);
    end if;
  end if;
exception
  when undefined_object then null;
  when insufficient_privilege then null;
end $$;
