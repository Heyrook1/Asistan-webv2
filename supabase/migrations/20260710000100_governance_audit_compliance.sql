-- ============================================================================
-- Governance: audit logs, consents, deletion requests, compliance docs
-- Date: 2026-07-10
-- Mirrors prisma/schema.prisma governance models (Prisma db push is source of truth).
-- ============================================================================

do $$ begin
  create type "AuditSeverity" as enum ('DEBUG','INFO','WARN','ERROR','CRITICAL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "ConsentType" as enum (
    'TERMS_OF_SERVICE',
    'PRIVACY_POLICY',
    'KVKK_EXPLICIT',
    'MARKETING_EMAILS',
    'MARKETING_SMS',
    'DATA_SHARING_THIRD_PARTY',
    'HEALTH_DATA_PROCESSING'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type "DataDeletionStatus" as enum ('PENDING','IN_REVIEW','COMPLETED','REJECTED');
exception when duplicate_object then null; end $$;

create table if not exists "AuditLog" (
  "id" text primary key,
  "businessId" text references "Business"("id") on delete set null,
  "actorUserId" text references "User"("id") on delete set null,
  "action" text not null,
  "entityType" text not null,
  "entityId" text,
  "severity" "AuditSeverity" not null default 'INFO',
  "summary" text,
  "metadata" jsonb,
  "ipAddress" text,
  "userAgent" text,
  "createdAt" timestamptz not null default now()
);

create index if not exists "AuditLog_businessId_createdAt_idx" on "AuditLog" ("businessId", "createdAt");
create index if not exists "AuditLog_actorUserId_createdAt_idx" on "AuditLog" ("actorUserId", "createdAt");
create index if not exists "AuditLog_entityType_entityId_idx" on "AuditLog" ("entityType", "entityId");
create index if not exists "AuditLog_action_createdAt_idx" on "AuditLog" ("action", "createdAt");
create index if not exists "AuditLog_severity_createdAt_idx" on "AuditLog" ("severity", "createdAt");

create table if not exists "UserConsent" (
  "id" text primary key,
  "userId" text not null references "User"("id") on delete cascade,
  "consentType" "ConsentType" not null,
  "version" text not null,
  "granted" boolean not null,
  "ipAddress" text,
  "userAgent" text,
  "grantedAt" timestamptz not null default now(),
  "revokedAt" timestamptz
);

create index if not exists "UserConsent_userId_consentType_idx" on "UserConsent" ("userId", "consentType");
create index if not exists "UserConsent_consentType_grantedAt_idx" on "UserConsent" ("consentType", "grantedAt");

create table if not exists "DataDeletionRequest" (
  "id" text primary key,
  "businessId" text references "Business"("id") on delete set null,
  "userId" text not null references "User"("id") on delete cascade,
  "patientId" text,
  "status" "DataDeletionStatus" not null default 'PENDING',
  "reason" text,
  "requestedAt" timestamptz not null default now(),
  "processedAt" timestamptz,
  "processedById" text references "User"("id") on delete set null,
  "notes" text
);

create index if not exists "DataDeletionRequest_business_status_idx" on "DataDeletionRequest" ("businessId", "status", "requestedAt");
create index if not exists "DataDeletionRequest_userId_requestedAt_idx" on "DataDeletionRequest" ("userId", "requestedAt");
create index if not exists "DataDeletionRequest_status_requestedAt_idx" on "DataDeletionRequest" ("status", "requestedAt");

create table if not exists "ComplianceDocument" (
  "id" text primary key,
  "businessId" text references "Business"("id") on delete cascade,
  "title" text not null,
  "category" text not null,
  "version" text not null,
  "status" text not null default 'ACTIVE',
  "fileUrl" text,
  "notes" text,
  "effectiveAt" timestamptz not null default now(),
  "expiresAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "ComplianceDocument_business_category_idx" on "ComplianceDocument" ("businessId", "category", "status");
create index if not exists "ComplianceDocument_expiresAt_idx" on "ComplianceDocument" ("expiresAt");
