-- ============================================================================
-- Storage reference guards
-- Date: 2026-05-20
--
-- Enforces that database file columns store small storage references/links, not
-- inline base64 payloads. NOT VALID keeps rollout safe for legacy rows while
-- still protecting all new writes.
-- ============================================================================

alter table "PatientFile"
  drop constraint if exists "PatientFile_storage_reference_check";

alter table "PatientFile"
  add constraint "PatientFile_storage_reference_check"
  check (
    "fileUrl" = ('storage://patient-files/' || "storageKey")
    and "storageKey" like ("businessId"::text || '/' || "patientId"::text || '/%')
    and octet_length("fileUrl") <= 1200
    and octet_length("storageKey") <= 1000
  ) not valid;

alter table "MessageAttachment"
  drop constraint if exists "MessageAttachment_storage_reference_check";

alter table "MessageAttachment"
  add constraint "MessageAttachment_storage_reference_check"
  check (
    "fileUrl" = ('storage://message-media/' || "storageKey")
    and octet_length("fileUrl") <= 1200
    and octet_length("storageKey") <= 1000
  ) not valid;

alter table "LabResult"
  drop constraint if exists "LabResult_file_url_not_inline_payload_check";

alter table "LabResult"
  add constraint "LabResult_file_url_not_inline_payload_check"
  check (
    "fileUrl" is null
    or (
      "fileUrl" !~* '^data:'
      and octet_length("fileUrl") <= 2000
    )
  ) not valid;
