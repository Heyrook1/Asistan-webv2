import { redirect } from 'next/navigation'

export default async function ClientAppointmentsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const sp = await searchParams
  const qs = sp.id ? `?id=${encodeURIComponent(sp.id)}` : ''
  redirect(`/client/bookings${qs}`)
}
