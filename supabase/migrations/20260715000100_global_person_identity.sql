-- Global Person Identity (ecosystem GPI) + Patient.personId

create table if not exists "Person" (
  "id" text primary key default gen_random_uuid()::text,
  "gpiDisplay" text not null unique,
  "phoneE164" text unique,
  "emailNorm" text unique,
  "identityHash" text unique,
  "birthDate" timestamptz,
  "fullNameCanon" text not null,
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "Person_fullNameCanon_idx" on "Person" ("fullNameCanon");
create index if not exists "Person_deletedAt_idx" on "Person" ("deletedAt");

create table if not exists "PersonIdentityMatch" (
  "id" text primary key default gen_random_uuid()::text,
  "leftPersonId" text not null references "Person"("id") on delete cascade,
  "rightPersonId" text not null references "Person"("id") on delete cascade,
  "score" numeric(4, 3) not null,
  "method" text not null,
  "decidedBy" text,
  "decidedAt" timestamptz,
  "createdAt" timestamptz not null default now()
);

create index if not exists "PersonIdentityMatch_pair_idx"
  on "PersonIdentityMatch" ("leftPersonId", "rightPersonId");
create index if not exists "PersonIdentityMatch_score_idx"
  on "PersonIdentityMatch" ("score");

alter table "Patient"
  add column if not exists "personId" text references "Person"("id") on delete set null;

create index if not exists "Patient_personId_idx" on "Patient" ("personId");
