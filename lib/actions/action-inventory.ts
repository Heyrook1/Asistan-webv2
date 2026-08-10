/**
 * Inventory of server actions and their Zod validation expectations.
 * Used by scripts/audit-action-validation.ts — keep in sync when adding actions.
 */
export const SERVER_ACTION_NO_INPUT = new Set([
  'markAllNotificationsRead',
  'stopSupportMode',
  'listClinicInvoices',
])

export const SERVER_ACTION_FILES = [
  'lib/actions/appointments.ts',
  'lib/actions/business.ts',
  'lib/actions/locations.ts',
  'lib/actions/global-search.ts',
  'lib/actions/governance.ts',
  'lib/actions/intake-forms.ts',
  'lib/actions/invoices.ts',
  'lib/actions/membership-payment.ts',
  'lib/actions/messages.ts',
  'lib/actions/notifications.ts',
  'lib/actions/patient-import.ts',
  'lib/actions/patients.ts',
  'lib/actions/prescriptions.ts',
  'lib/actions/push-subscriptions.ts',
  'lib/actions/reminders.ts',
  'lib/actions/services.ts',
  'lib/actions/super-admin.ts',
  'lib/actions/support-mode.ts',
  'lib/actions/system-admin.ts',
  'lib/actions/team.ts',
  'app/contact/actions.ts',
  'app/register/actions.ts',
] as const
