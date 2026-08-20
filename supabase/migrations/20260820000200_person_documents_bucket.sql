-- ============================================================================
-- Asistan Passport V2 — private patient document bucket
-- Date: 2026-08-20
--
-- Private bucket for patient-owned medical documents. Access is server-mediated:
-- uploads/reads/deletes go through /api/client/health/documents using the
-- service-role client (which bypasses storage RLS) AFTER the route verifies
-- patient auth + Person ownership. No anon/authenticated policies are created,
-- so RLS denies all direct client access by default. Short-lived signed URLs are
-- generated on read only; never a public URL.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'person-documents',
  'person-documents',
  false,
  26214400,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
