import 'server-only'

import { catalogPrisma } from '@/lib/prisma-owner'
import { isClinicPubliclyIndexable } from '@/lib/seo/clinic-seo'
import { getPublicBookPath } from '@/lib/public-booking/paths'

const SITEMAP_CLINIC_LIMIT = 5_000

/** Active, non-demo, non-test clinics for sitemap `/book/{slug}` entries. */
export async function listIndexableClinicSitemapEntries(): Promise<
  Array<{ path: string; lastModified: Date }>
> {
  const prisma = catalogPrisma()
  const rows = await prisma.business.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      OR: [{ vendorAccount: null }, { vendorAccount: { isDemo: false } }],
    },
    select: {
      slug: true,
      name: true,
      updatedAt: true,
      vendorAccount: { select: { isDemo: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: SITEMAP_CLINIC_LIMIT,
  })

  return rows
    .filter((row) =>
      isClinicPubliclyIndexable({
        slug: row.slug,
        name: row.name,
        isDemo: row.vendorAccount?.isDemo ?? false,
        isActive: true,
      }),
    )
    .map((row) => ({
      path: getPublicBookPath(row.slug),
      lastModified: row.updatedAt,
    }))
}
