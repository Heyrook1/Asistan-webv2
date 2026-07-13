import { Suspense } from 'react'
import { requireSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { SettingsForm } from './settings-form'
import { DoctorPrescriptionProfileCard } from '@/components/dashboard/doctor-prescription-profile-card'

export const dynamic = 'force-dynamic'

export default async function AyarlarPage() {
  const session = await requireSession()
  const [business, doctorProfile] = await Promise.all([
    prisma.business.findUnique({ where: { id: session.businessId } }),
    session.staffMemberId
      ? prisma.teamMember.findFirst({
          where: { id: session.staffMemberId, businessId: session.businessId, role: 'DOKTOR' },
          select: {
            id: true,
            prescriptionTitle: true,
            specialty: true,
            kktcIdentityNo: true,
            medicalLicenseNo: true,
            diplomaNo: true,
          },
        })
      : Promise.resolve(null),
  ])
  if (!business) return null

  return (
    <div className="space-y-4">
      <Suspense fallback={<div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">Ayarlar yükleniyor…</div>}>
        <SettingsForm
          session={session}
          initial={{
            name: business.name,
            description: business.description ?? '',
            phone: business.phone ?? '',
            email: business.email ?? '',
            address: business.address ?? '',
            city: business.city ?? '',
            logoUrl: business.logoUrl ?? '',
            primaryColor: business.primaryColor,
            currency: business.currency as 'TRY' | 'USD' | 'EUR',
            timezone: business.timezone,
            autoConfirmClientAppointments: business.autoConfirmClientAppointments,
          }}
        />
      </Suspense>
      {doctorProfile && (
        <details className="rounded-2xl border bg-white p-4 open:pb-0">
          <summary className="cursor-pointer list-none text-sm font-semibold text-brand-ink">
            E-Reçete profili (gelişmiş)
          </summary>
          <div className="mt-4 border-t pt-4">
            <DoctorPrescriptionProfileCard
              teamMemberId={doctorProfile.id}
              initial={{
                prescriptionTitle: doctorProfile.prescriptionTitle ?? 'Dr.',
                specialty: doctorProfile.specialty ?? '',
                kktcIdentityNo: doctorProfile.kktcIdentityNo ?? '',
                medicalLicenseNo: doctorProfile.medicalLicenseNo ?? '',
                diplomaNo: doctorProfile.diplomaNo ?? '',
              }}
            />
          </div>
        </details>
      )}
    </div>
  )
}
