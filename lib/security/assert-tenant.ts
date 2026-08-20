import { TenantGuardError } from '@/lib/security/tenant-guard'

/**
 * Explicit same-tenant check after a scoped load (check-then-act paths).
 * Prefer updateMany/findFirst with businessId in where when possible.
 */
export function assertSameTenant(
  sessionBusinessId: string,
  rowBusinessId: string | null | undefined,
): void {
  if (!rowBusinessId || rowBusinessId !== sessionBusinessId) {
    throw new TenantGuardError('assert', 'tenant', 'cross-tenant')
  }
}

/** Returns true when both ids are present and equal (no throw). */
export function isSameTenant(
  sessionBusinessId: string,
  rowBusinessId: string | null | undefined,
): boolean {
  return Boolean(rowBusinessId && rowBusinessId === sessionBusinessId)
}
