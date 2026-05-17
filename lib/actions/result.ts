// Standard discriminated-union return shape for server actions.
// Lets the client check `result.ok` and TS narrows automatically.

import type { ZodIssue } from 'zod'

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; issues?: ZodIssue[] }

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}

export function err(error: string, issues?: ZodIssue[]): ActionResult<never> {
  return { ok: false, error, issues }
}
