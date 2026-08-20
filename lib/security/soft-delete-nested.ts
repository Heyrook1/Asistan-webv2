/**
 * Nested Prisma includes / `_count` bypass `$use` soft-delete filtering.
 * Inject `deletedAt: null` into known soft-delete relation args.
 */

type QueryWhere = Record<string, unknown>

/** Relation field names whose target model participates in soft-delete. */
export const SOFT_DELETE_RELATION_FIELDS = new Set([
  'appointment',
  'appointments',
  'patients',
  'staff',
  'notes',
  'medications',
  'allergies',
  'treatments',
  'treatmentPlan',
  'labResults',
  'files',
  'documents',
  'timeline',
  'members',
  'services',
  'serviceStaff',
  'locations',
  'location',
  'reviews',
  'notifications',
  'clientNotifications',
  'reminders',
  'availability',
  'unavailableBlocks',
  'conversations',
  'participants',
  'messages',
  'attachments',
  'reactions',
  'pushSubscriptions',
])

/**
 * `notes` is PatientNote[] on Patient/Business, but a scalar String on
 * PersonMedication / PersonAllergy / PersonDocument (and most other models).
 * Only treat it as a relation on these parents.
 */
const NOTES_RELATION_PARENT_MODELS = new Set(['Patient', 'Business'])

/** When walking a nested include, map the relation field to the child model. */
const RELATION_CHILD_MODEL: Record<string, string> = {
  patients: 'Patient',
  patient: 'Patient',
  notes: 'PatientNote',
}

function isSoftDeleteRelationField(key: string, parentModel?: string): boolean {
  if (!SOFT_DELETE_RELATION_FIELDS.has(key)) return false
  if (key === 'notes') {
    return parentModel != null && NOTES_RELATION_PARENT_MODELS.has(parentModel)
  }
  return true
}

export function withNotDeleted(where: unknown): QueryWhere {
  if (!where || typeof where !== 'object' || Array.isArray(where)) {
    return { deletedAt: null }
  }

  const typedWhere = where as QueryWhere
  if (Object.prototype.hasOwnProperty.call(typedWhere, 'deletedAt')) {
    return typedWhere
  }

  return { ...typedWhere, deletedAt: null }
}

function applyToRelationArg(value: unknown, childModel?: string): unknown {
  if (value === true) {
    return { where: { deletedAt: null } }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value
  }

  const nested = { ...(value as QueryWhere) }
  nested.where = withNotDeleted(nested.where)

  if (nested.include && typeof nested.include === 'object' && !Array.isArray(nested.include)) {
    nested.include = applySoftDeleteToNestedTree(nested.include as QueryWhere, childModel)
  }
  if (nested.select && typeof nested.select === 'object' && !Array.isArray(nested.select)) {
    nested.select = applySoftDeleteToNestedTree(nested.select as QueryWhere, childModel)
  }

  return nested
}

/** Walk include/select trees and soft-delete-filter relation branches. */
export function applySoftDeleteToNestedTree(tree: QueryWhere, parentModel?: string): QueryWhere {
  const out: QueryWhere = {}

  for (const [key, value] of Object.entries(tree)) {
    if (key === '_count' && value && typeof value === 'object' && !Array.isArray(value)) {
      const countArg = value as QueryWhere
      if (countArg.select && typeof countArg.select === 'object' && !Array.isArray(countArg.select)) {
        out[key] = {
          ...countArg,
          select: applySoftDeleteToCountSelect(countArg.select as QueryWhere, parentModel),
        }
      } else {
        out[key] = value
      }
      continue
    }

    if (isSoftDeleteRelationField(key, parentModel)) {
      out[key] = applyToRelationArg(value, RELATION_CHILD_MODEL[key])
      continue
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = value as QueryWhere
      // Nested include/select under non-soft-delete relation (e.g. assignedDoctor)
      if (nested.include || nested.select || nested._count) {
        out[key] = applySoftDeleteToNestedTree(nested, RELATION_CHILD_MODEL[key] ?? parentModel)
        continue
      }
    }

    out[key] = value
  }

  return out
}

export function applySoftDeleteToCountSelect(select: QueryWhere, parentModel?: string): QueryWhere {
  const out: QueryWhere = {}
  for (const [key, value] of Object.entries(select)) {
    if (!isSoftDeleteRelationField(key, parentModel)) {
      out[key] = value
      continue
    }
    if (value === true) {
      out[key] = { where: { deletedAt: null } }
      continue
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = { ...(value as QueryWhere) }
      nested.where = withNotDeleted(nested.where)
      out[key] = nested
      continue
    }
    out[key] = value
  }
  return out
}

/** Apply nested soft-delete filters onto Prisma query args (mutates a shallow copy). */
export function applySoftDeleteToQueryArgs(
  args: QueryWhere | undefined,
  parentModel?: string
): QueryWhere | undefined {
  if (!args) return args
  const next: QueryWhere = { ...args }

  if ('where' in next) {
    next.where = withNotDeleted(next.where)
  }

  if (next.include && typeof next.include === 'object' && !Array.isArray(next.include)) {
    next.include = applySoftDeleteToNestedTree(next.include as QueryWhere, parentModel)
  }

  if (next.select && typeof next.select === 'object' && !Array.isArray(next.select)) {
    next.select = applySoftDeleteToNestedTree(next.select as QueryWhere, parentModel)
  }

  return next
}

/**
 * Relation filters in `where` (some/none/every) also bypass middleware.
 * Add deletedAt:null when the relation target is soft-deleted.
 */
export function applySoftDeleteToWhereRelationFilters(where: unknown, parentModel?: string): unknown {
  if (!where || typeof where !== 'object' || Array.isArray(where)) return where

  const src = where as QueryWhere
  const out: QueryWhere = {}

  for (const [key, value] of Object.entries(src)) {
    if (key === 'AND' || key === 'OR' || key === 'NOT') {
      if (Array.isArray(value)) {
        out[key] = value.map((item) => applySoftDeleteToWhereRelationFilters(item, parentModel))
      } else {
        out[key] = applySoftDeleteToWhereRelationFilters(value, parentModel)
      }
      continue
    }

    if (
      isSoftDeleteRelationField(key, parentModel) &&
      value &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      const rel = { ...(value as QueryWhere) }
      for (const op of ['some', 'none', 'every'] as const) {
        if (op in rel) {
          rel[op] = withNotDeleted(rel[op])
        }
      }
      // Direct nested where on to-one relation
      if (!('some' in rel) && !('none' in rel) && !('every' in rel) && !('is' in rel) && !('isNot' in rel)) {
        out[key] = withNotDeleted(rel)
      } else {
        if ('is' in rel) rel.is = withNotDeleted(rel.is)
        if ('isNot' in rel) {
          // isNot means "not matching this filter" — do not force deletedAt null
          rel.isNot = applySoftDeleteToWhereRelationFilters(rel.isNot, RELATION_CHILD_MODEL[key])
        }
        out[key] = rel
      }
      continue
    }

    out[key] = value
  }

  return out
}
