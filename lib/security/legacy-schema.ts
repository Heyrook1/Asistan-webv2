/**
 * Pre-20260518 snake_case `public.*` schema (marketplace prototype era).
 *
 * Production Asistan Health uses Prisma PascalCase tables ("Business", "Patient", …).
 * These tables must not receive writes; they expand PHI breach surface if left live.
 *
 * Drop migration: `supabase/migrations/20260716000200_drop_legacy_snake_schema.sql`
 */

/** Child tables first — safe for DROP TABLE … CASCADE as well */
export const LEGACY_PUBLIC_TABLES_DROP_ORDER = [
  'appointment_status_history',
  'reviews',
  'appointments',
  'calendar_availability',
  'calendar_blocks',
  'notifications',
  'services',
  'team_members',
  'activity_logs',
  'user_consents',
  'data_deletion_requests',
  'customers',
  'providers',
  'categories',
  'specialties',
  'users',
] as const

export type LegacyPublicTable = (typeof LEGACY_PUBLIC_TABLES_DROP_ORDER)[number]

/** Legacy-only functions — not used by PascalCase schema */
export const LEGACY_PUBLIC_FUNCTIONS = [
  'log_appointment_status_change()',
  'audit_trigger_func()',
  'log_activity(uuid, text, text, uuid, jsonb, text)',
  'is_provider_owner(uuid)',
  'is_team_member(uuid, text)',
  'can_access_provider(uuid, text)',
  'set_updated_at()',
] as const

/**
 * Snake_case names for RLS drift checks — must never appear in REQUIRED_RLS_TABLES
 * or in post-202606 migrations as live targets.
 */
export const LEGACY_SNAKE_RLS_TABLES: readonly LegacyPublicTable[] = LEGACY_PUBLIC_TABLES_DROP_ORDER

export function listLegacyPublicTables() {
  return [...LEGACY_PUBLIC_TABLES_DROP_ORDER]
}
