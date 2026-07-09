import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRegisterPath, normalizeAuthLanguage } from '@/lib/auth-routes'

export default async function LegacySignUpPage() {
  const cookieStore = await cookies()
  const lang = normalizeAuthLanguage(cookieStore.get('asistan-lang')?.value)
  redirect(getRegisterPath(lang))
}
