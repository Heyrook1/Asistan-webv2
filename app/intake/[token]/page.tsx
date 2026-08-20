import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicIntakeForm } from '@/components/intake/public-intake-form'
import { getPublicIntakeByToken } from '@/lib/public-intake/submit'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const result = await getPublicIntakeByToken(token)
  if (!result.ok) return { title: 'Ön kayıt formu', robots: { index: false, follow: false } }
  return {
    title: `${result.formName} | Ön kayıt`,
    robots: { index: false, follow: false },
  }
}

export default async function IntakeTokenPage({ params }: PageProps) {
  const { token } = await params
  const result = await getPublicIntakeByToken(token)

  if (!result.ok) {
    if (result.error === 'not_found') notFound()
    const messages: Record<string, string> = {
      expired: 'Bu form bağlantısının süresi dolmuş.',
      revoked: 'Bu form bağlantısı iptal edilmiş.',
      unavailable: 'Bu form artık kullanılamıyor.',
    }
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Form açılamıyor</h1>
        <p className="mt-2 text-sm text-slate-600">{messages[result.error] || 'Bağlantı geçersiz.'}</p>
      </main>
    )
  }

  if (result.alreadySubmitted) {
    return (
      <PublicIntakeForm
        token={token}
        clinicName={result.clinicName}
        primaryColor="#0071E3"
        logoUrl={null}
        formName={result.formName}
        formDescription={null}
        fields={[]}
        patientName=""
        appointment={{ date: '', startTime: '', serviceName: '' }}
        alreadySubmitted
        submittedAt={result.submittedAt?.toISOString?.() ?? null}
      />
    )
  }

  return (
    <main>
      <PublicIntakeForm
        token={token}
        clinicName={result.clinicName}
        primaryColor={result.primaryColor}
        logoUrl={result.logoUrl}
        formName={result.formName}
        formDescription={result.formDescription}
        fields={result.fields}
        patientName={result.patientName}
        appointment={result.appointment}
      />
    </main>
  )
}
