import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicBookingWidget } from '@/components/book/public-booking-widget'
import { getPublicClinicBySlug } from '@/lib/public-booking/clinic-by-slug'
import { getPublicBookPath } from '@/lib/public-booking/paths'
import { absoluteUrl, withCanonical } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    embed?: string
    serviceId?: string
    doctorId?: string
    locationId?: string
    date?: string
    lang?: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const clinic = await getPublicClinicBySlug(slug)
  if (!clinic) {
    return { title: 'Randevu bulunamadı' }
  }
  return withCanonical(getPublicBookPath(clinic.slug), {
    title: `${clinic.name} — Online randevu`,
    description: clinic.description?.slice(0, 160) || `${clinic.name} için online randevu alın.`,
    openGraph: {
      title: `${clinic.name} — Online randevu`,
      description: clinic.description?.slice(0, 160) || `${clinic.name} için online randevu alın.`,
      url: absoluteUrl(getPublicBookPath(clinic.slug)),
    },
  })
}

export default async function PublicBookPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const clinic = await getPublicClinicBySlug(slug)
  if (!clinic) notFound()

  const embed = query.embed === '1' || query.embed === 'true'
  const langRaw = (query.lang || 'tr').toLowerCase()
  const lang = langRaw === 'en' || langRaw === 'ru' ? langRaw : 'tr'

  return (
    <main
      className={embed ? 'min-h-dvh bg-white' : undefined}
      style={!embed ? { background: `radial-gradient(90%_60%_at_50%_-10%, ${clinic.primaryColor}33, transparent 55%), linear-gradient(180deg, #E8EEF6 0%, #F3F6FA 100%)` } : undefined}
    >
      <PublicBookingWidget
        clinic={clinic}
        embed={embed}
        initialServiceId={query.serviceId ?? null}
        initialDoctorId={query.doctorId ?? null}
        initialLocationId={query.locationId ?? null}
        initialDate={query.date ?? null}
        lang={lang}
      />
    </main>
  )
}
