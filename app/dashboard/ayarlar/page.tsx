import { requireSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { SettingsForm } from './settings-form'

export const dynamic = 'force-dynamic'

export default async function AyarlarPage() {
  const session = await requireSession()
  const business = await prisma.business.findUnique({ where: { id: session.businessId } })
  if (!business) return null

  return (
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
      }}
    />
  )
}
