import { Suspense } from 'react'
import { requireSession } from '@/lib/session'
import { can, ROLE_LABELS } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { SettingsForm } from './settings-form'
import { DoctorPrescriptionProfileCard } from '@/components/dashboard/doctor-prescription-profile-card'
import {
  getVendorPlanName,
  getVendorPlanUserLimit,
  normalizeVendorPlanCode,
} from '@/lib/vendor-membership'
import type { MembershipSnapshot } from '@/components/dashboard/membership-panel'
import {
  isGoogleCalendarSyncConfigured,
  isGoogleCalendarSyncEnabled,
} from '@/lib/calendar/config'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { getPatientOutboundChannelConfig } from '@/lib/notifications/channels'
import { getBusinessChannelDeliveryStats } from '@/lib/notifications/channel-delivery-store'

export const dynamic = 'force-dynamic'

export default async function AyarlarPage() {
  const session = await requireSession()
  const [business, doctorProfile, vendorAccount, teamMembers, calendarConnections, pendingPaymentRow] =
    await Promise.all([
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
    prisma.vendorAccount.findUnique({
      where: { businessId: session.businessId },
      select: {
        plan: true,
        status: true,
        isDemo: true,
        accessStartAt: true,
        accessEndAt: true,
      },
    }),
    prisma.teamMember.findMany({
      where: { businessId: session.businessId, isActive: true },
      select: { id: true, fullName: true, role: true, isBookable: true },
      orderBy: [{ fullName: 'asc' }],
      take: 200,
    }),
    prisma.calendarConnection.findMany({
      where: { businessId: session.businessId, deletedAt: null },
      select: {
        id: true,
        staffId: true,
        provider: true,
        accountEmail: true,
        syncEnabled: true,
        lastSyncAt: true,
        lastError: true,
      },
      take: 200,
    }),
    prisma.membershipPayment.findFirst({
      where: { businessId: session.businessId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    }),
  ])
  if (!business) return null

  const membership: MembershipSnapshot | null = vendorAccount
    ? {
        businessId: session.businessId,
        businessName: business.name,
        planCode: normalizeVendorPlanCode(vendorAccount.plan),
        planName: getVendorPlanName(vendorAccount.plan),
        status: vendorAccount.status,
        isDemo: vendorAccount.isDemo,
        accessStartAt: vendorAccount.accessStartAt?.toISOString() ?? null,
        accessEndAt: vendorAccount.accessEndAt?.toISOString() ?? null,
        userLimit: getVendorPlanUserLimit({
          plan: vendorAccount.plan,
          isDemo: vendorAccount.isDemo,
        }),
      }
    : null

  const pendingPayment = pendingPaymentRow
    ? {
        id: pendingPaymentRow.id,
        planCode: pendingPaymentRow.planCode,
        planName: getVendorPlanName(pendingPaymentRow.planCode),
        billingPeriod: pendingPaymentRow.billingPeriod as 'MONTHLY' | 'YEARLY',
        amount: Number(pendingPaymentRow.amount),
        currency: pendingPaymentRow.currency,
        status: pendingPaymentRow.status,
        provider: pendingPaymentRow.provider,
        checkoutUrl: pendingPaymentRow.checkoutUrl,
        instructions: pendingPaymentRow.notes,
        packageDurationDays: pendingPaymentRow.packageDurationDays,
        createdAt: pendingPaymentRow.createdAt.toISOString(),
        expiresAt: pendingPaymentRow.expiresAt?.toISOString() ?? null,
      }
    : null

  const calendarConfigured = isGoogleCalendarSyncConfigured()
  const calendarEnabled = isGoogleCalendarSyncEnabled()
  const selfServeEnabled = isFeatureEnabled('selfServeBilling')
  const patientChannels = getPatientOutboundChannelConfig()
  const patientChannelDelivery = await getBusinessChannelDeliveryStats(session.businessId, 24)

  return (
    <div className="space-y-4">
      <Suspense fallback={<div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">Ayarlar yükleniyor…</div>}>
        <SettingsForm
          session={session}
          membership={membership}
          pendingPayment={pendingPayment}
          selfServeEnabled={selfServeEnabled}
          patientChannels={patientChannels}
          patientChannelDelivery={patientChannelDelivery}
          calendar={{
            enabled: calendarEnabled,
            configured: calendarConfigured,
            canManageTeam: session.isOwner || can(session, 'team.manage'),
            staff: teamMembers.map((m) => ({
              id: m.id,
              fullName: m.fullName,
              role: ROLE_LABELS[m.role] ?? m.role,
              isBookable: m.isBookable,
            })),
            connections: calendarConnections.map((c) => ({
              id: c.id,
              staffId: c.staffId,
              provider: c.provider as 'GOOGLE' | 'OUTLOOK',
              accountEmail: c.accountEmail,
              syncEnabled: c.syncEnabled,
              lastSyncAt: c.lastSyncAt?.toISOString() ?? null,
              lastError: c.lastError,
            })),
          }}
          bookingSlug={business.slug}
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
            requireGuestIdentity: business.requireGuestIdentity ?? false,
            depositEnabled: business.depositEnabled,
            depositAmount:
              business.depositAmount != null ? String(Number(business.depositAmount)) : '',
            noShowFeeEnabled: business.noShowFeeEnabled,
            noShowFeeAmount:
              business.noShowFeeAmount != null ? String(Number(business.noShowFeeAmount)) : '',
            noShowFeeNote: business.noShowFeeNote ?? '',
            invoiceEnabled: business.invoiceEnabled,
            taxVkn: business.taxVkn ?? '',
            taxOffice: business.taxOffice ?? '',
            invoiceTitle: business.invoiceTitle ?? '',
            invoiceAddress: business.invoiceAddress ?? '',
            whatsappAgentEnabled: business.whatsappAgentEnabled,
          }}
        />
      </Suspense>
      {doctorProfile && (
        <details className="rounded-2xl border bg-white p-4 open:pb-0">
          <summary className="cursor-pointer list-none text-sm font-semibold text-brand-ink">
            Klinik reçete profili (yazdırılabilir — resmi e-reçete ağı yok)
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
