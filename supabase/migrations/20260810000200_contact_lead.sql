-- Marketing contact / demo inquiry leads (form at /contact — not a calendar booking).
CREATE TABLE IF NOT EXISTS "ContactLead" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "company" TEXT,
  "serviceType" TEXT,
  "message" TEXT NOT NULL,
  "privacyAcceptedAt" TIMESTAMP(3) NOT NULL,
  "privacyNoticeVersion" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'contact',
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ContactLead_createdAt_idx" ON "ContactLead" ("createdAt");
CREATE INDEX IF NOT EXISTS "ContactLead_status_idx" ON "ContactLead" ("status");
CREATE INDEX IF NOT EXISTS "ContactLead_email_idx" ON "ContactLead" ("email");
