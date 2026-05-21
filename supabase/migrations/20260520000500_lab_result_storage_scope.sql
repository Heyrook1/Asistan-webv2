-- ============================================================================
-- LabResult storage tenant/patient scope
-- Date: 2026-05-20
--
-- LabResult has only fileUrl (no separate storageKey), so the storage reference
-- itself must encode and enforce the owning business and patient.
-- ============================================================================

alter table "LabResult"
  drop constraint if exists "LabResult_file_url_not_inline_payload_check";

alter table "LabResult"
  drop constraint if exists "LabResult_storage_reference_check";

alter table "LabResult"
  add constraint "LabResult_storage_reference_check"
  check (
    "fileUrl" is null
    or (
      "fileUrl" like ('storage://patient-files/' || "businessId"::text || '/' || "patientId"::text || '/%')
      and octet_length("fileUrl") <= 1200
    )
  ) not valid;
