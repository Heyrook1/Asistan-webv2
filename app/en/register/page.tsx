'use client'

import { AuthMarketingShell } from '@/components/auth/auth-marketing-shell'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <AuthMarketingShell>
      <RegisterForm />
    </AuthMarketingShell>
  )
}
