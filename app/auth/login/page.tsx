import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getLoginPath, normalizeAuthLanguage } from '@/lib/auth-routes'

export default async function LegacyLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const cookieStore = await cookies()
  const lang = normalizeAuthLanguage(cookieStore.get('asistan-lang')?.value)
  const params = await searchParams
  const qs = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value.length > 0) qs.set(key, value)
    else if (Array.isArray(value) && value[0]) qs.set(key, value[0])
  }

  const base = getLoginPath(lang)
  redirect(qs.size > 0 ? `${base}?${qs.toString()}` : base)
}
