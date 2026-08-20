export type DepositPolicy = {
  depositEnabled: boolean
  depositAmount: number | null
  noShowFeeEnabled: boolean
  noShowFeeAmount: number | null
  noShowFeeNote: string | null
  currency: string
}

function toNumber(value: unknown): number | null {
  if (value == null) return null
  const n = Number(typeof value === 'object' ? String(value) : value)
  return Number.isFinite(n) ? n : null
}

export function parseDepositPolicy(row: {
  depositEnabled?: boolean | null
  depositAmount?: unknown
  noShowFeeEnabled?: boolean | null
  noShowFeeAmount?: unknown
  noShowFeeNote?: string | null
  currency?: string | null
}): DepositPolicy {
  return {
    depositEnabled: Boolean(row.depositEnabled),
    depositAmount: toNumber(row.depositAmount),
    noShowFeeEnabled: Boolean(row.noShowFeeEnabled),
    noShowFeeAmount: toNumber(row.noShowFeeAmount),
    noShowFeeNote: row.noShowFeeNote?.trim() || null,
    currency: row.currency || 'TRY',
  }
}
