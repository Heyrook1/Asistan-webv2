// Standard discriminated-union return shape for server actions.
// Lets the client check `result.ok` and TS narrows automatically.

import type { ZodIssue } from 'zod'

export type FieldErrorMap = Record<string, string>

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; issues?: ZodIssue[]; fieldErrors?: FieldErrorMap }

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}

function normalizeIssuePath(path: ZodIssue['path']) {
  if (path.length === 0) return 'form'
  return path.map((segment) => String(segment)).join('.')
}

function toFieldErrorMap(issues: ZodIssue[]): FieldErrorMap | undefined {
  const fieldErrors: FieldErrorMap = {}

  for (const issue of issues) {
    const key = normalizeIssuePath(issue.path)
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message
    }
  }

  if (Object.keys(fieldErrors).length === 0) return undefined
  return fieldErrors
}

export function err(error: string, issues?: ZodIssue[]): ActionResult<never> {
  const fieldErrors = issues && issues.length > 0 ? toFieldErrorMap(issues) : undefined
  return { ok: false, error, issues, fieldErrors }
}
