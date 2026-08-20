import 'server-only'

/**
 * Safe health-record telemetry. Ids + status/category only — never names,
 * titles, notes, or storage keys (PHI).
 */
import { log } from '@/lib/observability/logger'

export function emitHealthRecordEvent(
  event:
    | 'medication_created'
    | 'medication_updated'
    | 'medication_stopped'
    | 'medication_deleted'
    | 'allergy_created'
    | 'allergy_updated'
    | 'allergy_deleted'
    | 'document_uploaded'
    | 'document_updated'
    | 'document_deleted',
  fields: { id: string; status?: string; category?: string }
) {
  log.info(event, fields)
}
