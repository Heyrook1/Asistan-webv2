import Link from 'next/link'
import { notFound } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { requirePagePermission } from '@/lib/session'
import { getPrescriptionForPrint } from '@/lib/prescriptions/queries'
import {
  createPrescriptionVerifyToken,
  prescriptionVerifyAbsoluteUrl,
} from '@/lib/prescriptions/share-token'
import { renderPrescriptionQrSvg } from '@/lib/prescriptions/qr'
import { PrescriptionPrintActions } from '@/components/dashboard/prescription-print-actions'
import { formatDate } from '@/lib/format'
import { captureError } from '@/lib/observability/logger'

export const dynamic = 'force-dynamic'

export default async function PrescriptionPrintPage({
  params,
}: {
  params: Promise<{ id: string; prescriptionId: string }>
}) {
  const { id: patientId, prescriptionId } = await params

  let session
  try {
    session = await requirePagePermission('patient.view')
  } catch (error) {
    await captureError(error, {
      message: 'prescription_print_auth',
      tags: { route: 'prescription-print', phase: 'auth' },
    })
    throw error
  }

  let prescription
  try {
    prescription = await getPrescriptionForPrint(session.businessId, patientId, prescriptionId)
  } catch (error) {
    const digest =
      error instanceof Error && 'digest' in error
        ? String((error as Error & { digest?: string }).digest ?? '')
        : ''
    Sentry.withScope((scope) => {
      scope.setTag('route', 'prescription-print')
      scope.setTag('boundary', 'rsc')
      if (digest) scope.setTag('nextjs.digest', digest)
      scope.setExtra('prescriptionIdPrefix', prescriptionId.slice(0, 8))
      Sentry.captureException(error)
    })
    await captureError(error, {
      message: 'prescription_print_load',
      tags: { route: 'prescription-print', phase: 'load' },
      fields: { digest: digest || null },
    })
    throw error
  }

  if (!prescription) notFound()

  const verifyToken = createPrescriptionVerifyToken({
    businessId: prescription.businessId,
    prescriptionId: prescription.id,
  })
  const verifyUrl = prescriptionVerifyAbsoluteUrl(verifyToken)
  let qrSvg = ''
  try {
    qrSvg = await renderPrescriptionQrSvg(verifyUrl)
  } catch (error) {
    await captureError(error, {
      message: 'prescription_qr_render',
      tags: { route: 'prescription-print', phase: 'qr' },
    })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 lg:p-8" data-testid="prescription-print-page">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/dashboard/hastalar/${patientId}`} className="text-sm text-brand-teal hover:underline">
          Hasta kartına dön
        </Link>
        <PrescriptionPrintActions />
      </div>

      <article className="rounded-2xl border border-border bg-white p-6 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <header className="border-b border-border pb-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-teal">Klinik reçete</p>
              <h1 className="mt-2 text-2xl font-bold text-brand-ink">{prescription.clinicName}</h1>
              <p className="text-sm text-muted-foreground">
                {[prescription.clinicAddress, prescription.clinicCity].filter(Boolean).join(' • ')}
              </p>
              {prescription.clinicPhone && (
                <p className="text-sm text-muted-foreground">Tel: {prescription.clinicPhone}</p>
              )}
            </div>
            <div className="text-right text-sm">
              <p>
                <strong>Protokol:</strong> {prescription.protocolNo}
              </p>
              <p>
                <strong>Tarih:</strong> {formatDate(prescription.issuedAt)}
              </p>
              {prescription.validUntil && (
                <p>
                  <strong>Geçerlilik:</strong> {formatDate(prescription.validUntil)}
                </p>
              )}
            </div>
          </div>
        </header>

        <section className="grid gap-6 border-b border-border py-5 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Hasta</p>
            <p className="font-semibold text-brand-ink">{prescription.patientFullName}</p>
            <p className="text-sm text-muted-foreground">
              KKTC Kimlik: {prescription.patientIdentityNumber ?? '—'}
            </p>
            <p className="text-sm text-muted-foreground">
              Doğum: {prescription.patientBirthDate ? formatDate(prescription.patientBirthDate) : '—'}
            </p>
            <p className="text-sm text-muted-foreground">Cinsiyet: {prescription.patientGender ?? '—'}</p>
            <p className="text-sm text-muted-foreground">Tel: {prescription.patientPhone ?? '—'}</p>
            <p className="text-sm text-muted-foreground">
              Adres:{' '}
              {[prescription.patientAddress, prescription.patientCity].filter(Boolean).join(', ') || '—'}
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Doktor</p>
            <p className="font-semibold text-brand-ink">
              {prescription.doctorTitle ? `${prescription.doctorTitle} ` : ''}
              {prescription.doctorFullName}
            </p>
            <p className="text-sm text-muted-foreground">Uzmanlık: {prescription.doctorSpecialty ?? '—'}</p>
            <p className="text-sm text-muted-foreground">
              KKTC Kimlik: {prescription.doctorKktcIdentityNo ?? '—'}
            </p>
            <p className="text-sm text-muted-foreground">
              Ruhsat/Sicil: {prescription.doctorMedicalLicenseNo ?? '—'}
            </p>
            <p className="text-sm text-muted-foreground">Diploma: {prescription.doctorDiplomaNo ?? '—'}</p>
          </div>
        </section>

        <section className="border-b border-border py-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Tanı</p>
          <p className="text-sm font-medium text-brand-ink">{prescription.diagnosis}</p>
          {prescription.notes && (
            <p className="mt-2 text-sm text-muted-foreground">{prescription.notes}</p>
          )}
          {prescription.allergyWarning && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">
              Alerji uyarısı: {prescription.allergyWarning}
            </p>
          )}
        </section>

        <section className="py-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Reçete</p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">İlaç</th>
                <th className="py-2 pr-3">Doz</th>
                <th className="py-2 pr-3">Kullanım</th>
                <th className="py-2">Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {prescription.lines.map((line, index) => (
                <tr key={line.id} className="border-b border-border/60 align-top">
                  <td className="py-3 pr-3">{index + 1}</td>
                  <td className="py-3 pr-3 font-medium text-brand-ink">{line.drugName}</td>
                  <td className="py-3 pr-3">{line.dosage ?? '—'}</td>
                  <td className="py-3 pr-3">
                    {[
                      line.frequency,
                      line.durationDays ? `${line.durationDays} gün` : null,
                      line.quantity ? `${line.quantity} adet` : null,
                    ]
                      .filter(Boolean)
                      .join(' • ') || '—'}
                  </td>
                  <td className="py-3">{line.instructions ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="grid gap-8 border-t border-border pt-8 md:grid-cols-[1fr_auto_1fr]">
          <div>
            <p className="text-xs text-muted-foreground">Hasta bilgilendirildi</p>
            <div className="mt-10 border-t border-dashed border-border" />
          </div>
          <div className="flex flex-col items-center justify-end" data-testid="prescription-qr">
            {qrSvg ? (
              <>
                <div
                  className="h-36 w-36 text-brand-ink [&_svg]:h-full [&_svg]:w-full"
                  aria-hidden
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <p className="mt-2 max-w-[11rem] text-center text-[10px] text-muted-foreground">
                  Doğrulama QR — resmi e-reçete ağı değildir
                </p>
                <p className="mt-1 max-w-[14rem] break-all text-center text-[9px] text-muted-foreground print:hidden">
                  {verifyUrl}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">QR oluşturulamadı</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Doktor imza / kaşe</p>
            <div className="mt-10 border-t border-dashed border-border" />
            <p className="mt-2 text-sm font-semibold text-brand-ink">
              {prescription.doctorTitle ? `${prescription.doctorTitle} ` : ''}
              {prescription.doctorFullName}
            </p>
          </div>
        </footer>
      </article>
    </div>
  )
}
