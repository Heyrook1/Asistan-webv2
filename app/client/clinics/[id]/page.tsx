import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ClinicDetailPanel } from '@/components/client/clinic-detail-panel'
import { MarkPwaEngagement } from '@/components/pwa/mark-engagement'
import { getClientClinicDetail } from '@/lib/client-marketplace/clinic-detail'
import { parsePathId } from '@/lib/api-response'
import { getPublicBookPath } from '@/lib/public-booking/paths'
import { getServerLanguage } from '@/lib/server-language'
import {
  buildClinicPageMetadata,
  buildMedicalClinicJsonLd,
} from '@/lib/seo/clinic-seo'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const id = parsePathId((await params).id)
  const { t } = await getServerLanguage()
  const notFoundMetadata: Metadata = {
    title: t({ tr: 'Klinik bulunamadı', en: 'Clinic not found' }),
    robots: { index: false, follow: false },
  }

  if (!id) return notFoundMetadata

  const clinic = await getClientClinicDetail(id)
  if (!clinic) return notFoundMetadata

  // Canonical consolidates to stable slug URL (/book/{slug}) — avoid UUID duplicate ranking.
  return buildClinicPageMetadata(
    {
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
      isActive: true,
    },
    { canonicalPath: getPublicBookPath(clinic.slug) },
  )
}

export default async function ClientClinicDetailPage({ params }: PageProps) {
  const id = parsePathId((await params).id)
  if (!id) notFound()

  const clinic = await getClientClinicDetail(id)
  if (!clinic) notFound()

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
    isActive: true,
  })

  return (
    <main className="space-y-4">
      <MarkPwaEngagement reason="clinic_view" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/client/clinics"
        className="inline-flex text-[13px] font-semibold text-[#0071E3]"
      >
        ← Klinik listesi
      </Link>
      <ClinicDetailPanel clinic={clinic} />
    </main>
  )
}
