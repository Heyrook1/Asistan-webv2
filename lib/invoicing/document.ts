/**
 * Minimal invoice document payload for print / optional KKTC API.
 * Not a certified UBL XML exporter — structured JSON only.
 */

import type { InvoiceLineItem } from './calc'

export type ClinicTaxProfile = {
  taxVkn: string | null
  taxOffice: string | null
  invoiceTitle: string | null
  invoiceAddress: string | null
  currency: string
}

export type InvoiceDraftDocument = {
  schema: 'asistan.clinic-invoice.v1'
  jurisdiction: 'KKTC'
  kind: 'SERVICE' | 'SMM_TR'
  seller: {
    title: string
    taxId: string | null
    taxOffice: string | null
    address: string | null
  }
  buyer: {
    name: string | null
    taxId: string | null
  }
  currency: string
  number: string | null
  issuedAt: string | null
  lineItems: InvoiceLineItem[]
  totals: {
    subtotal: number
    taxRate: number
    taxAmount: number
    total: number
  }
  notes: string | null
  /** Explicit: TR GİB e-SMM is not submitted from this product path. */
  trGibESmmSupported: false
}

export function buildInvoiceDocument(input: {
  businessName: string
  tax: ClinicTaxProfile
  kind?: 'SERVICE' | 'SMM_TR'
  buyerName: string | null
  buyerTaxId: string | null
  number: string | null
  issuedAt: Date | null
  lineItems: InvoiceLineItem[]
  totals: InvoiceDraftDocument['totals']
  notes?: string | null
}): InvoiceDraftDocument {
  return {
    schema: 'asistan.clinic-invoice.v1',
    jurisdiction: 'KKTC',
    kind: input.kind ?? 'SERVICE',
    seller: {
      title: input.tax.invoiceTitle?.trim() || input.businessName,
      taxId: input.tax.taxVkn?.trim() || null,
      taxOffice: input.tax.taxOffice?.trim() || null,
      address: input.tax.invoiceAddress?.trim() || null,
    },
    buyer: {
      name: input.buyerName?.trim() || null,
      taxId: input.buyerTaxId?.trim() || null,
    },
    currency: input.tax.currency || 'TRY',
    number: input.number,
    issuedAt: input.issuedAt?.toISOString() ?? null,
    lineItems: input.lineItems,
    totals: input.totals,
    notes: input.notes?.trim() || null,
    trGibESmmSupported: false,
  }
}
