/**
 * Prisma kiracı koruması (uygulama katmanı) — RLS atlandığında ikinci kapı.
 *
 * Tenant modelleri okuma/yazmada `businessId` taşımalı; istisna:
 * hasta sahipli satırlar (`clientUserId`) veya `runWithTenantBypass`
 * (cron, marketplace katalog). Postgres RLS ile birlikte çalışır; tek başına
 * yetmez.
 *
 * Mod (`ASISTAN_TENANT_GUARD`):
 *   - enforce — TenantGuardError fırlat (prod + test varsayılan)
 *   - warn    — yalnız log (development varsayılan)
 *   - off     — kapalı
 */
import { AsyncLocalStorage } from 'node:async_hooks'

export type TenantGuardMode = 'enforce' | 'warn' | 'off'

export class TenantGuardError extends Error {
  readonly model: string
  readonly action: string

  constructor(model: string, action: string, detail: string) {
    super(`[tenant-guard] ${model}.${action}: ${detail}`)
    this.name = 'TenantGuardError'
    this.model = model
    this.action = action
  }
}

/** Models with a required (or strongly expected) businessId tenant column. */
export const TENANT_SCOPED_MODELS = new Set<string>([
  'Location',
  'VendorAccount',
  'MembershipPayment',
  'TeamMember',
  'Patient',
  'PatientNote',
  'Medication',
  'Allergy',
  'Treatment',
  'TreatmentPlanItem',
  'LabResult',
  'PatientFile',
  'Prescription',
  'Service',
  'ServiceStaff',
  'TeamMemberAvailability',
  'TeamMemberUnavailableBlock',
  'CalendarConnection',
  'Appointment',
  'IntakeForm',
  'IntakeInvite',
  'IntakeResponse',
  'Review',
  'TimelineEvent',
  'Notification',
  'PushSubscription',
  'Reminder',
  'ClientNotification',
  'Conversation',
  'AuditLog',
  'DataDeletionRequest',
  'ComplianceDocument',
  'AppointmentDeposit',
  'ClinicInvoice',
  'FrontDeskSession',
  'PatientChannelAttempt',
  'NotificationOutbox',
])

/** Models where `businessId` is optional on create — still scoped on reads when present. */
const OPTIONAL_BUSINESS_ID_ON_CREATE = new Set<string>([
  'ClientNotification',
  'AuditLog',
  'DataDeletionRequest',
  'ComplianceDocument',
])

/**
 * Alternate owner scopes accepted instead of businessId (patient marketplace).
 * Keys are model names; values are field names that prove intentional scope.
 */
export const ALTERNATE_SCOPE_FIELDS: Readonly<Record<string, readonly string[]>> = {
  Appointment: ['clientUserId', 'patientId'],
  Review: ['clientUserId', 'appointmentId'],
  ClientNotification: ['clientUserId', 'appointmentId'],
  AuditLog: ['entityId'],
  /** Passport / GPI membership reads — personId is ecosystem scope, not clinic. */
  Patient: ['personId'],
}

type BypassStore = { reason: string }

/**
 * Singleton ALS on globalThis — Turbopack/Next can evaluate this module twice;
 * separate AsyncLocalStorage instances would make bypass invisible to Prisma $use.
 */
const globalForTenantGuard = globalThis as unknown as {
  __asistanTenantBypassALS?: AsyncLocalStorage<BypassStore>
}

const bypassStorage =
  globalForTenantGuard.__asistanTenantBypassALS ??
  (globalForTenantGuard.__asistanTenantBypassALS = new AsyncLocalStorage<BypassStore>())

export function runWithTenantBypass<T>(reason: string, fn: () => T): T {
  if (!reason.trim()) {
    throw new Error('[tenant-guard] bypass reason is required')
  }
  return bypassStorage.run({ reason: reason.trim() }, fn)
}

export async function runWithTenantBypassAsync<T>(reason: string, fn: () => Promise<T>): Promise<T> {
  if (!reason.trim()) {
    throw new Error('[tenant-guard] bypass reason is required')
  }
  return bypassStorage.run({ reason: reason.trim() }, fn)
}

export function getTenantBypassReason(): string | null {
  return bypassStorage.getStore()?.reason ?? null
}

/**
 * Test / diagnostics: the shared ALS instance (must be identical across Turbopack
 * chunks that both import this module).
 */
export function getTenantBypassAlsIdentity(): object {
  return bypassStorage
}

export function resolveTenantGuardMode(
  envValue: string | undefined = process.env.ASISTAN_TENANT_GUARD,
  nodeEnv: string | undefined = process.env.NODE_ENV
): TenantGuardMode {
  const raw = envValue?.trim().toLowerCase()
  if (raw === 'enforce' || raw === 'warn' || raw === 'off') return raw
  if (nodeEnv === 'production' || nodeEnv === 'test') return 'enforce'
  return 'warn'
}

function isNonEmptyScopeValue(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number' || typeof value === 'boolean') return true
  if (Array.isArray(value)) return value.length > 0 && value.every(isNonEmptyScopeValue)
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if ('equals' in obj) return isNonEmptyScopeValue(obj.equals)
    if ('in' in obj) return isNonEmptyScopeValue(obj.in)
    if ('not' in obj) return true
    // Prisma filter object present (contains, startsWith, etc.) — treat as scoped
    return Object.keys(obj).length > 0
  }
  return false
}

function whereHasField(where: unknown, field: string): boolean {
  if (!where || typeof where !== 'object') return false
  if (Array.isArray(where)) return where.some((item) => whereHasField(item, field))

  const typed = where as Record<string, unknown>
  if (Object.prototype.hasOwnProperty.call(typed, field) && isNonEmptyScopeValue(typed[field])) {
    return true
  }

  if (typed.AND != null && whereHasField(typed.AND, field)) return true
  if (typed.NOT != null && whereHasField(typed.NOT, field)) return true

  // OR: every branch must carry the same scope field (otherwise one branch leaks)
  if (typed.OR != null) {
    const branches = Array.isArray(typed.OR) ? typed.OR : [typed.OR]
    return branches.length > 0 && branches.every((branch) => whereHasField(branch, field))
  }

  return false
}

export function whereHasTenantScope(model: string, where: unknown): boolean {
  if (whereHasField(where, 'businessId')) return true
  const alts = ALTERNATE_SCOPE_FIELDS[model]
  if (!alts) return false
  return alts.some((field) => whereHasField(where, field))
}

function dataHasBusinessId(data: unknown): boolean {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  return isNonEmptyScopeValue((data as Record<string, unknown>).businessId)
}

const READ_ACTIONS = new Set([
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
])

const WRITE_WHERE_ACTIONS = new Set([
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'upsert',
])

export type TenantGuardParams = {
  model?: string
  action?: string
  args?: {
    where?: unknown
    data?: unknown
    create?: unknown
    update?: unknown
  }
}

export type TenantGuardResult =
  | { ok: true }
  | { ok: false; detail: string }

export function evaluateTenantGuard(params: TenantGuardParams): TenantGuardResult {
  const model = params.model
  const action = params.action
  if (!model || !action) return { ok: true }
  if (!TENANT_SCOPED_MODELS.has(model)) return { ok: true }
  if (getTenantBypassReason()) return { ok: true }

  const args = params.args ?? {}

  if (READ_ACTIONS.has(action) || WRITE_WHERE_ACTIONS.has(action)) {
    if (!whereHasTenantScope(model, args.where)) {
      const alts = ALTERNATE_SCOPE_FIELDS[model]
      const hint = alts?.length
        ? `require businessId (or ${alts.join(' / ')}) in where`
        : 'require businessId in where'
      return { ok: false, detail: hint }
    }
  }

  if (action === 'create') {
    if (OPTIONAL_BUSINESS_ID_ON_CREATE.has(model)) return { ok: true }
    if (!dataHasBusinessId(args.data)) {
      return { ok: false, detail: 'require businessId in data' }
    }
  }

  if (action === 'createMany') {
    if (OPTIONAL_BUSINESS_ID_ON_CREATE.has(model)) return { ok: true }
    const rows = Array.isArray(args.data) ? args.data : []
    if (rows.length === 0) return { ok: true }
    if (!rows.every((row) => dataHasBusinessId(row))) {
      return { ok: false, detail: 'require businessId on every createMany row' }
    }
  }

  if (action === 'upsert') {
    if (!whereHasTenantScope(model, args.where)) {
      return { ok: false, detail: 'require businessId (or alternate scope) in upsert where' }
    }
    if (!OPTIONAL_BUSINESS_ID_ON_CREATE.has(model) && !dataHasBusinessId(args.create)) {
      return { ok: false, detail: 'require businessId in upsert create' }
    }
  }

  return { ok: true }
}

export function applyTenantGuard(
  params: TenantGuardParams,
  options?: {
    mode?: TenantGuardMode
    onWarn?: (message: string) => void
  }
): void {
  const mode = options?.mode ?? resolveTenantGuardMode()
  if (mode === 'off') return

  const result = evaluateTenantGuard(params)
  if (result.ok) return

  const model = params.model ?? 'Unknown'
  const action = params.action ?? 'unknown'
  const message = `[tenant-guard] ${model}.${action}: ${result.detail}`

  if (mode === 'warn') {
    ;(options?.onWarn ?? console.warn)(message)
    return
  }

  throw new TenantGuardError(model, action, result.detail)
}
