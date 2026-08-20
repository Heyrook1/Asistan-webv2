-- P0-07: clinic wall-clock default = Asia/Nicosia (KKTC).
-- Existing rows keep their stored timezone; only the column default changes.
ALTER TABLE "Business"
  ALTER COLUMN "timezone" SET DEFAULT 'Asia/Nicosia';
