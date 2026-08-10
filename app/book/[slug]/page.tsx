import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicBookingWidget } from '@/components/book/public-booking-widget'
import { getPublicClinicBySlug } from '@/lib/public-booking/clinic-by-slug'
import {
  buildClinicPageMetadata,
  buildMedicalClinicJsonLd,
} from '@/lib/seo/clinic-seo'

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
    return {
      title: 'Randevu bulunamadı',
      robots: { index: false, follow: false },
    }
  }

  return buildClinicPageMetadata({
    name: clinic.name,
    slug: clinic.slug,
    description: clinic.description,
    city: clinic.city,
    address: clinic.address,
    phone: clinic.phone,
    email: clinic.email,
    logoUrl: clinic.logoUrl,
    locationLat: clinic.locationLat,
    locationLng: clinic.locationLng,
    specialtySummary: clinic.specialtySummary,
    doctors: clinic.doctors,
    openingHours: clinic.openingHours,
    isDemo: clinic.isDemo,
    isActive: true,
  })
}

export default async function PublicBookPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const clinic = await getPublicClinicBySlug(slug)
  if (!clinic) notFound()

  const embed = query.embed === '1' || query.embed === 'true'
  const langRaw = (query.lang || 'tr').toLowerCase()
  const lang = langRaw === 'en' || langRaw === 'ru' ? langRaw : 'tr'

  const jsonLd = buildMedicalClinicJsonLd({
    name: clinic.name,
    slug: clinic.slug,
    description: clinic.description,
    city: clinic.city,
    address: clinic.address,
    phone: clinic.phone,
    email: clinic.email,
    logoUrl: clinic.logoUrl,
    locationLat: clinic.locationLat,
    locationLng: clinic.locationLng,
    specialtySummary: clinic.specialtySummary,
    doctors: clinic.doctors,
    openingHours: clinic.openingHours,
    isDemo: clinic.isDemo,
    isActive: true,
  })

  return (
    <main
      className={embed ? 'min-h-dvh bg-white' : undefined}
      style={
        !embed
          ? {
              background: `radial-gradient(90% 60% at 50% -10%, ${clinic.primaryColor}33, transparent 55%), linear-gradient(180deg, #E8EEF6 0%, #F3F6FA 100%)`,
            }
          : undefined
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
