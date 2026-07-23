'use client'

import React from 'react'

import { AuthMarketingShell } from '@/components/auth/auth-marketing-shell'
import { LoginForm } from '@/components/auth/LoginForm'

/** Legacy path kept for bookmarks; public URLs are /tr/giris and /en/login. */
export default function LoginPage() {
  return (
    <AuthMarketingShell>
      <React.Suspense fallback={<div className="text-sm text-slate-500">…</div>}>
        <LoginForm />
      </React.Suspense>
    </AuthMarketingShell>
  )
}
