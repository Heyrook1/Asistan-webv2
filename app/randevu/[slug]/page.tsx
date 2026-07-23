import { permanentRedirect } from 'next/navigation'
import { getPublicBookPath } from '@/lib/public-booking/paths'

/** Legacy share path used by older dashboard copy actions. */
export default async function LegacyRandevuRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { slug } = await params
  const query = await searchParams
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') qs.set(key, value)
    else if (Array.isArray(value) && value[0]) qs.set(key, value[0])
  }
  const suffix = qs.toString()
  permanentRedirect(`${getPublicBookPath(slug)}${suffix ? `?${suffix}` : ''}`)
}
