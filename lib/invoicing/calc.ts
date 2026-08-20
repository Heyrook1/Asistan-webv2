/** Pure money helpers for clinic invoice drafts (KKTC e-Fatura path). */

export type InvoiceLineItem = {
  description: string
  quantity: number
  unitPrice: number
  /** Optional line tax rate % (defaults to invoice-level). */
  taxRate?: number
}

export type InvoiceTotals = {
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
}

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function computeInvoiceTotals(
  lineItems: InvoiceLineItem[],
  defaultTaxRate = 0
): InvoiceTotals {
  const taxRate = Number.isFinite(defaultTaxRate) ? Math.max(0, defaultTaxRate) : 0
  let subtotal = 0
  let taxAmount = 0

  for (const line of lineItems) {
    const qty = Number.isFinite(line.quantity) ? line.quantity : 0
    const unit = Number.isFinite(line.unitPrice) ? line.unitPrice : 0
    const lineSub = qty * unit
    const lineRate =
      line.taxRate != null && Number.isFinite(line.taxRate) ? Math.max(0, line.taxRate) : taxRate
    subtotal += lineSub
    taxAmount += (lineSub * lineRate) / 100
  }

  subtotal = roundMoney(subtotal)
  taxAmount = roundMoney(taxAmount)
  return {
    subtotal,
    taxRate,
    taxAmount,
    total: roundMoney(subtotal + taxAmount),
  }
}

/** Sequential draft number: INV-YYYY-NNNN */
export function formatInvoiceNumber(year: number, seq: number): string {
  const y = Number.isFinite(year) ? year : new Date().getUTCFullYear()
  const n = Math.max(1, Math.floor(seq))
  return `INV-${y}-${String(n).padStart(4, '0')}`
}
