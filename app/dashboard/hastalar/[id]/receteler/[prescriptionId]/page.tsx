import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requirePagePermission } from '@/lib/session'
import { getPrescriptionForPrint } from '@/lib/prescriptions/queries'
import { PrescriptionPrintActions } from '@/components/dashboard/prescription-print-actions'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function PrescriptionPrintPage({
  params,
}: {
  params: Promise<{ id: string; prescriptionId: string }>
}) {
  const { id: patientId, prescriptionId } = await params
  const session = await requirePagePermission('patient.view')
  const prescription = await getPrescriptionForPrint(session.businessId, patientId, prescriptionId)
  if (!prescription) notFound()

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/dashboard/hastalar/${patientId}`} className="text-sm text-brand-teal hover:underline">
          Hasta kartina don
        </Link>
        <PrescriptionPrintActions />
      </div>

      <article className="rounded-2xl border border-border bg-white p-6 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <header className="border-b border-border pb-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-teal">KKTC E-Reçete</p>
              <h1 className="mt-2 text-2xl font-bold text-brand-ink">{prescription.clinicName}</h1>
              <p className="text-sm text-muted-foreground">
                {[prescription.clinicAddress, prescription.clinicCity].filter(Boolean).join(' • ')}
              </p>
              {prescription.clinicPhone && <p className="text-sm text-muted-foreground">Tel: {prescription.clinicPhone}</p>}
            </div>
            <div className="text-right text-sm">
              <p><strong>Protokol:</strong> {prescription.protocolNo}</p>
              <p><strong>Tarih:</strong> {formatDate(prescription.issuedAt)}</p>
              {prescription.validUntil && <p><strong>Gecerlilik:</strong> {formatDate(prescription.validUntil)}</p>}
            </div>
          </div>
        </header>

        <section className="grid gap-6 border-b border-border py-5 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Hasta</p>
            <p className="font-semibold text-brand-ink">{prescription.patientFullName}</p>
            <p className="text-sm text-muted-foreground">KKTC Kimlik: {prescription.patientIdentityNumber ?? '—'}</p>
            <p className="text-sm text-muted-foreground">
              Dogum: {prescription.patientBirthDate ? formatDate(prescription.patientBirthDate) : '—'}
            </p>
            <p className="text-sm text-muted-foreground">Cinsiyet: {prescription.patientGender ?? '—'}</p>
            <p className="text-sm text-muted-foreground">Tel: {prescription.patientPhone}</p>
            <p className="text-sm text-muted-foreground">
              Adres: {[prescription.patientAddress, prescription.patientCity].filter(Boolean).join(', ') || '—'}
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Doktor</p>
            <p className="font-semibold text-brand-ink">
              {prescription.doctorTitle ? `${prescription.doctorTitle} ` : ''}
              {prescription.doctorFullName}
            </p>
            <p className="text-sm text-muted-foreground">Uzmanlik: {prescription.doctorSpecialty ?? '—'}</p>
            <p className="text-sm text-muted-foreground">KKTC Kimlik: {prescription.doctorKktcIdentityNo ?? '—'}</p>
            <p className="text-sm text-muted-foreground">Ruhsat/Sicil: {prescription.doctorMedicalLicenseNo ?? '—'}</p>
            <p className="text-sm text-muted-foreground">Diploma: {prescription.doctorDiplomaNo ?? '—'}</p>
          </div>
        </section>

        <section className="border-b border-border py-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Tani</p>
          <p className="text-sm font-medium text-brand-ink">{prescription.diagnosis}</p>
          {prescription.notes && <p className="mt-2 text-sm text-muted-foreground">{prescription.notes}</p>}
          {prescription.allergyWarning && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">
              Alerji uyarisi: {prescription.allergyWarning}
            </p>
          )}
        </section>

        <section className="py-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Recete</p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3">#</th>
                <th className="py-2 pr-3">Ilac</th>
                <th className="py-2 pr-3">Doz</th>
                <th className="py-2 pr-3">Kullanim</th>
                <th className="py-2">Aciklama</th>
              </tr>
            </thead>
            <tbody>
              {prescription.lines.map((line, index) => (
                <tr key={line.id} className="border-b border-border/60 align-top">
                  <td className="py-3 pr-3">{index + 1}</td>
                  <td className="py-3 pr-3 font-medium text-brand-ink">{line.drugName}</td>
                  <td className="py-3 pr-3">{line.dosage ?? '—'}</td>
                  <td className="py-3 pr-3">
                    {[line.frequency, line.durationDays ? `${line.durationDays} gun` : null, line.quantity ? `${line.quantity} adet` : null]
                      .filter(Boolean)
                      .join(' • ') || '—'}
                  </td>
                  <td className="py-3">{line.instructions ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="grid gap-8 pt-8 md:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Hasta bilgilendirildi</p>
            <div className="mt-10 border-t border-dashed border-border" />
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Doktor imza / kase</p>
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
