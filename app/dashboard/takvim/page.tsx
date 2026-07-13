import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TakvimRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const sp = await searchParams
  const params = new URLSearchParams()
  params.set('mode', 'takvim')
  if (sp.date) params.set('date', sp.date)
  redirect(`/dashboard/ajanda?${params.toString()}`)
}
