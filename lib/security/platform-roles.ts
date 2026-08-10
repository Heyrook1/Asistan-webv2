/**
 * Platform-level roles that must never be granted through tenant team UI/actions.
 * P0.8 paid-pilot gate — owner → SUPER_ADMIN escalation.
 */
export function platformRoleAssignmentError(role: string | null | undefined): string | null {
  if (role === 'SUPER_ADMIN') {
    return 'SUPER_ADMIN platform rolu ekip yonetimi uzerinden atanamaz.'
  }
  return null
}
