/** Typed errors for the health-records service layer → mapped to HTTP by routes. */
export type HealthRecordErrorCode =
  | 'not_found'
  | 'not_editable'
  | 'storage_unavailable'
  | 'storage_failed'
  | 'invalid_file'

export class HealthRecordError extends Error {
  readonly code: HealthRecordErrorCode
  constructor(code: HealthRecordErrorCode, message?: string) {
    super(message ?? code)
    this.name = 'HealthRecordError'
    this.code = code
  }
}

export function isHealthRecordError(value: unknown): value is HealthRecordError {
  return value instanceof HealthRecordError
}
