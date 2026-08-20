'use client'

import { AuthMarketingShell } from '@/components/auth/auth-marketing-shell'
import { RegisterForm } from '@/components/auth/RegisterForm'

/** Legacy path kept for bookmarks; public URLs are /tr/kayit and /en/register. */
export default function RegisterPage() {
  return (
    <AuthMarketingShell>
      <RegisterForm />
    </AuthMarketingShell>
  )
}
