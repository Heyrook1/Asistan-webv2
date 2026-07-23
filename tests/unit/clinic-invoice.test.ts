import { describe, expect, it } from 'vitest'

import { computeInvoiceTotals, formatInvoiceNumber } from '@/lib/invoicing/calc'
import { buildInvoiceDocument } from '@/lib/invoicing/document'
import { looksLikeForbiddenClaim } from '@/lib/brand/claim-bank'

describe('clinic invoice calc (Q4)', () => {
  it('computes subtotal + tax', () => {
    const totals = computeInvoiceTotals(
      [
        { description: 'Muayene', quantity: 1, unitPrice: 100 },
        { description: 'Kontrol', quantity: 2, unitPrice: 50 },
      ],
      5
    )
    expect(totals.subtotal).toBe(200)
    expect(totals.taxRate).toBe(5)
    expect(totals.taxAmount).toBe(10)
    expect(totals.total).toBe(210)
  })

  it('formats sequential numbers', () => {
    expect(formatInvoiceNumber(2026, 7)).toBe('INV-2026-0007')
  })

  it('builds KKTC document with trGibESmmSupported false', () => {
    const doc = buildInvoiceDocument({
      businessName: 'Demo Klinik',
      tax: {
        taxVkn: '123',
        taxOffice: 'Lefkoşa',
        invoiceTitle: 'Demo Klinik Ltd',
        invoiceAddress: 'Girne',
        currency: 'TRY',
      },
      buyerName: 'Hasta',
      buyerTaxId: null,
      number: 'INV-2026-0001',
      issuedAt: new Date('2026-07-21T10:00:00Z'),
      lineItems: [{ description: 'Muayene', quantity: 1, unitPrice: 100 }],
      totals: { subtotal: 100, taxRate: 0, taxAmount: 0, total: 100 },
    })
    expect(doc.jurisdiction).toBe('KKTC')
    expect(doc.trGibESmmSupported).toBe(false)
    expect(doc.seller.title).toBe('Demo Klinik Ltd')
  })
})

describe('e-fatura claim honesty', () => {
  it('forbids present-tense e-SMM / GİB ready claims', () => {
    expect(looksLikeForbiddenClaim('e-SMM hazır')).toBe(true)
    expect(looksLikeForbiddenClaim('GİB entegre')).toBe(true)
    expect(looksLikeForbiddenClaim('KKTC e-Fatura taslağı yazdırılabilir')).toBe(false)
  })
})
