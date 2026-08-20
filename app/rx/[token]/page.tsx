import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/format'
import { getPrescriptionByIdForVerify } from '@/lib/prescriptions/queries'
import { parsePrescriptionVerifyToken, maskIdentityNumber } from '@/lib/prescriptions/share-token'

export const dynamic = 'force-dynamic'

export default async function PublicPrescriptionVerifyPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token: rawToken } = await params
  const token = decodeURIComponent(rawToken)
  const parsed = parsePrescriptionVerifyToken(token)
  if (!parsed.ok) notFound()

  const prescription = await getPrescriptionByIdForVerify(parsed.prescriptionId, parsed.businessId)
  if (!prescription) notFound()

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6" data-testid="rx-verify-page">
      <header className="space-y-1 border-b border-border pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-teal">
          Klinik reçete doğrulama
        </p>
        <h1 className="text-2xl font-bold text-brand-ink">{prescription.clinicName}</h1>
        <p className="text-sm text-muted-foreground">
          Bu sayfa yazdırılabilir klinik reçete özetidir — resmi e-reçete ağı değildir.
        </p>
      </header>

      <section className="space-y-2 text-sm">
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
        <p>
          <strong>Hasta:</strong> {prescription.patientFullName} (
          {maskIdentityNumber(prescription.patientIdentityNumber) ?? '—'})
        </p>
        <p>
          <strong>Doktor:</strong>{' '}
          {prescription.doctorTitle ? `${prescription.doctorTitle} ` : ''}
          {prescription.doctorFullName}
        </p>
        <p>
          <strong>Tanı:</strong> {prescription.diagnosis}
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-brand-ink">İlaçlar</h2>
        <ul className="space-y-2 text-sm">
          {prescription.lines.map((line) => (
            <li key={line.id} className="rounded-lg border border-border px-3 py-2">
              <p className="font-medium text-brand-ink">{line.drugName}</p>
              <p className="text-muted-foreground">
                {[line.dosage, line.frequency, line.instructions].filter(Boolean).join(' • ') || '—'}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
