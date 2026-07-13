import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function RandevularRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; create?: string; id?: string }>
}) {
  const sp = await searchParams
  const params = new URLSearchParams()
  params.set('mode', 'liste')
  if (sp.status) params.set('status', sp.status)
  if (sp.create) params.set('create', sp.create)
  if (sp.id) params.set('id', sp.id)
  redirect(`/dashboard/ajanda?${params.toString()}`)
}
