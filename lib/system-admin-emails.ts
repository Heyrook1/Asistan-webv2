/** Parse SYSTEM_ADMIN_EMAILS (comma-separated). Empty → callers fall back to SUPER_ADMIN role. */
export function parseSystemAdminEmails(raw: string | null | undefined): Set<string> {
  return new Set(
    (raw ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}
