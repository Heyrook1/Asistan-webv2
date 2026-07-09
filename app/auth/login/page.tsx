import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getLoginPath, normalizeAuthLanguage } from '@/lib/auth-routes'

export default async function LegacyLoginPage() {
  const cookieStore = await cookies()
  const lang = normalizeAuthLanguage(cookieStore.get('asistan-lang')?.value)
  redirect(getLoginPath(lang))
}
