import 'server-only'

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { computeInvoiceTotals, formatInvoiceNumber, type InvoiceLineItem } from './calc'
import { buildInvoiceDocument } from './document'

export type CreateInvoiceFromAppointmentResult =
  | { ok: true; invoiceId: string; number: string }
  | { ok: false; error: string }

/**
 * Creates a DRAFT ClinicInvoice from a completed (or any) appointment.
 * Does not submit to Maliye — use submit action separately.
 */
export async function createInvoiceFromAppointment(input: {
  businessId: string
  appointmentId: string
  createdByUserId: string
  taxRate?: number
  notes?: string | null
}): Promise<CreateInvoiceFromAppointmentResult> {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: input.appointmentId,
      businessId: input.businessId,
      deletedAt: null,
    },
    include: {
      patient: { select: { id: true, fullName: true, identityNumber: true } },
      service: { select: { name: true, price: true } },
      business: {
        select: {
          name: true,
          currency: true,
          invoiceEnabled: true,
          taxVkn: true,
          taxOffice: true,
          invoiceTitle: true,
          invoiceAddress: true,
        },
      },
    },
  })

  if (!appointment) return { ok: false, error: 'Randevu bulunamadı' }
  if (!appointment.business.invoiceEnabled) {
    return { ok: false, error: 'Fatura özelliği kapalı — Ayarlar → Fatura’dan açın' }
  }

  const existing = await prisma.clinicInvoice.findFirst({
    where: {
      businessId: input.businessId,
      appointmentId: input.appointmentId,
      status: { not: 'VOID' },
    },
    select: { id: true, number: true },
  })
  if (existing) {
    return {
      ok: true,
      invoiceId: existing.id,
      number: existing.number ?? existing.id.slice(0, 8),
    }
  }

  const unitPrice = Number(
    appointment.price != null ? appointment.price : appointment.service.price ?? 0
  )
  const lineItems: InvoiceLineItem[] = [
    {
      description: appointment.service.name,
      quantity: 1,
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
    },
  ]
  const taxRate = input.taxRate ?? 0
  const totals = computeInvoiceTotals(lineItems, taxRate)

  const year = new Date().getFullYear()
  const yearStart = new Date(Date.UTC(year, 0, 1))
  const count = await prisma.clinicInvoice.count({
    where: {
      businessId: input.businessId,
      createdAt: { gte: yearStart },
    },
  })
  const number = formatInvoiceNumber(year, count + 1)

  const issuedAt = new Date()
  const document = buildInvoiceDocument({
    businessName: appointment.business.name,
    tax: {
      taxVkn: appointment.business.taxVkn,
      taxOffice: appointment.business.taxOffice,
      invoiceTitle: appointment.business.invoiceTitle,
      invoiceAddress: appointment.business.invoiceAddress,
      currency: appointment.business.currency || 'TRY',
    },
    buyerName: appointment.patient.fullName,
    buyerTaxId: appointment.patient.identityNumber,
    number,
    issuedAt,
    lineItems,
    totals,
    notes: input.notes ?? null,
  })

  const invoice = await prisma.clinicInvoice.create({
    data: {
      businessId: input.businessId,
      appointmentId: appointment.id,
      patientId: appointment.patient.id,
      kind: 'SERVICE',
      status: 'DRAFT',
      number,
      currency: appointment.business.currency || 'TRY',
      subtotal: new Prisma.Decimal(totals.subtotal),
      taxRate: new Prisma.Decimal(totals.taxRate),
      taxAmount: new Prisma.Decimal(totals.taxAmount),
      total: new Prisma.Decimal(totals.total),
      buyerName: appointment.patient.fullName,
      buyerTaxId: appointment.patient.identityNumber,
      lineItems,
      notes: input.notes ?? null,
      ublPayload: document,
      issuedAt,
      createdByUserId: input.createdByUserId,
    },
    select: { id: true, number: true },
  })

  return { ok: true, invoiceId: invoice.id, number: invoice.number ?? number }
}
