'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/audit'
import { requireSession, can } from '@/lib/session'
import { ok, err, type ActionResult } from '@/lib/actions/result'
import { entityIdSchema } from '@/lib/actions/validation'
import {
  createInvoiceFromAppointment,
  isKktcEFaturaConfigured,
  submitKktcEFatura,
  type InvoiceDraftDocument,
} from '@/lib/invoicing'

function canManageInvoices(session: Awaited<ReturnType<typeof requireSession>>): boolean {
  return (
    session.isOwner ||
    can(session, 'appointment.manage') ||
    can(session, 'analytics.revenue.view')
  )
}

export type ClinicInvoiceRow = {
  id: string
  number: string | null
  status: string
  kind: string
  buyerName: string | null
  total: number
  currency: string
  appointmentId: string | null
  patientId: string | null
  provider: string | null
  providerRef: string | null
  lastError: string | null
  issuedAt: string | null
  submittedAt: string | null
  createdAt: string
}

export async function createDraftInvoiceFromAppointment(
  raw: unknown
): Promise<ActionResult<{ invoiceId: string; number: string }>> {
  const parsed = z
    .object({
      appointmentId: entityIdSchema,
      taxRate: z.coerce.number().min(0).max(100).optional(),
      notes: z.string().max(2000).optional(),
    })
    .safeParse(raw)
  if (!parsed.success) return err('Geçersiz istek', parsed.error.issues)

  const session = await requireSession()
  if (!canManageInvoices(session)) return err('Bu işlem için yetkiniz yok')

  const result = await createInvoiceFromAppointment({
    businessId: session.businessId,
    appointmentId: parsed.data.appointmentId,
    createdByUserId: session.userId,
    taxRate: parsed.data.taxRate,
    notes: parsed.data.notes ?? null,
  })
  if (!result.ok) return err(result.error)

  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'invoice.draft.create',
    entityType: 'ClinicInvoice',
    entityId: result.invoiceId,
    severity: 'INFO',
    summary: `Fatura taslağı oluşturuldu (${result.number})`,
    metadata: { appointmentId: parsed.data.appointmentId },
  })

  revalidatePath('/dashboard/faturalar')
  revalidatePath('/dashboard/ajanda')
  return ok({ invoiceId: result.invoiceId, number: result.number })
}

export async function markInvoiceReady(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = z.object({ invoiceId: entityIdSchema }).safeParse(raw)
  if (!parsed.success) return err('Geçersiz fatura', parsed.error.issues)

  const session = await requireSession()
  if (!canManageInvoices(session)) return err('Bu işlem için yetkiniz yok')

  const invoice = await prisma.clinicInvoice.findFirst({
    where: { id: parsed.data.invoiceId, businessId: session.businessId },
  })
  if (!invoice) return err('Fatura bulunamadı')
  if (invoice.status === 'VOID' || invoice.status === 'SUBMITTED') {
    return err('Bu fatura durumu değiştirilemez')
  }

  await prisma.clinicInvoice.update({
    where: { id: invoice.id },
    data: { status: 'READY', issuedAt: invoice.issuedAt ?? new Date() },
  })

  revalidatePath('/dashboard/faturalar')
  return ok({ id: invoice.id })
}

export async function voidInvoice(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = z.object({ invoiceId: entityIdSchema }).safeParse(raw)
  if (!parsed.success) return err('Geçersiz fatura', parsed.error.issues)

  const session = await requireSession()
  if (!canManageInvoices(session)) return err('Bu işlem için yetkiniz yok')

  const invoice = await prisma.clinicInvoice.findFirst({
    where: { id: parsed.data.invoiceId, businessId: session.businessId },
  })
  if (!invoice) return err('Fatura bulunamadı')
  if (invoice.status === 'SUBMITTED') {
    return err('Gönderilmiş fatura iptal edilemez — Maliye sürecini kullanın')
  }

  await prisma.clinicInvoice.update({
    where: { id: invoice.id },
    data: { status: 'VOID' },
  })

  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'invoice.void',
    entityType: 'ClinicInvoice',
    entityId: invoice.id,
    severity: 'WARN',
    summary: `Fatura iptal edildi (${invoice.number ?? invoice.id})`,
  })

  revalidatePath('/dashboard/faturalar')
  return ok({ id: invoice.id })
}

export async function submitInvoiceToKktc(
  raw: unknown
): Promise<ActionResult<{ id: string; providerRef: string | null; printedOnly?: boolean }>> {
  const parsed = z.object({ invoiceId: entityIdSchema }).safeParse(raw)
  if (!parsed.success) return err('Geçersiz fatura', parsed.error.issues)

  const session = await requireSession()
  if (!canManageInvoices(session)) return err('Bu işlem için yetkiniz yok')

  const invoice = await prisma.clinicInvoice.findFirst({
    where: { id: parsed.data.invoiceId, businessId: session.businessId },
    include: {
      business: {
        select: { taxVkn: true, name: true },
      },
    },
  })
  if (!invoice) return err('Fatura bulunamadı')
  if (invoice.status === 'VOID') return err('İptal edilmiş fatura gönderilemez')
  if (invoice.status === 'SUBMITTED') return err('Fatura zaten gönderilmiş')
  if (invoice.kind === 'SMM_TR') {
    return err('TR GİB e-SMM gönderimi desteklenmiyor')
  }

  const document = invoice.ublPayload as InvoiceDraftDocument | null
  if (!document || document.schema !== 'asistan.clinic-invoice.v1') {
    return err('Fatura belgesi eksik — yeniden taslak oluşturun')
  }

  if (!isKktcEFaturaConfigured()) {
    await prisma.clinicInvoice.update({
      where: { id: invoice.id },
      data: {
        status: 'READY',
        lastError:
          'API yok — yazdırılabilir READY. KKTC_EFATURA_* env ile Maliye gönderimi açılır.',
      },
    })
    revalidatePath('/dashboard/faturalar')
    return ok({ id: invoice.id, providerRef: null, printedOnly: true })
  }

  const result = await submitKktcEFatura({
    document,
    taxVkn: invoice.business.taxVkn,
  })

  if (!result.ok) {
    await prisma.clinicInvoice.update({
      where: { id: invoice.id },
      data: { status: 'FAILED', lastError: result.error },
    })
    revalidatePath('/dashboard/faturalar')
    return err(result.error)
  }

  await prisma.clinicInvoice.update({
    where: { id: invoice.id },
    data: {
      status: 'SUBMITTED',
      provider: 'kktc_maliye',
      providerRef: result.providerRef,
      submittedAt: new Date(),
      lastError: null,
    },
  })

  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'invoice.kktc.submit',
    entityType: 'ClinicInvoice',
    entityId: invoice.id,
    severity: 'INFO',
    summary: `KKTC e-Fatura gönderildi (${invoice.number ?? invoice.id})`,
    metadata: { providerRef: result.providerRef },
  })

  revalidatePath('/dashboard/faturalar')
  return ok({ id: invoice.id, providerRef: result.providerRef })
}

export async function listClinicInvoices(): Promise<ClinicInvoiceRow[]> {
  const session = await requireSession()
  if (!canManageInvoices(session)) return []

  const rows = await prisma.clinicInvoice.findMany({
    where: { businessId: session.businessId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return rows.map((r) => ({
    id: r.id,
    number: r.number,
    status: r.status,
    kind: r.kind,
    buyerName: r.buyerName,
    total: Number(r.total),
    currency: r.currency,
    appointmentId: r.appointmentId,
    patientId: r.patientId,
    provider: r.provider,
    providerRef: r.providerRef,
    lastError: r.lastError,
    issuedAt: r.issuedAt?.toISOString() ?? null,
    submittedAt: r.submittedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }))
}

/** Used by print — returns document JSON for client print helper. */
export async function getInvoicePrintPayload(
  raw: unknown
): Promise<ActionResult<{ document: InvoiceDraftDocument; totalsLabel: string }>> {
  const parsed = z.object({ invoiceId: entityIdSchema }).safeParse(raw)
  if (!parsed.success) return err('Geçersiz fatura', parsed.error.issues)

  const session = await requireSession()
  if (!canManageInvoices(session)) return err('Bu işlem için yetkiniz yok')

  const invoice = await prisma.clinicInvoice.findFirst({
    where: { id: parsed.data.invoiceId, businessId: session.businessId },
  })
  if (!invoice) return err('Fatura bulunamadı')

  const document = invoice.ublPayload as InvoiceDraftDocument | null
  if (!document) return err('Yazdırılacak belge yok')

  return ok({
    document,
    totalsLabel: `${Number(invoice.total).toFixed(2)} ${invoice.currency}`,
  })
}
