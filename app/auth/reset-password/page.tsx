'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'

import { AuthShell } from '@/components/marketing/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { passwordFlowCopy } from '@/lib/auth/password-flow-copy'
import { createClient } from '@/lib/supabase/client'

const copy = passwordFlowCopy.reset

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor.')
      return
    }
    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error('Şifre güncellenemedi', { description: error.message })
        return
      }
      setSuccess(true)
      toast.success('Şifreniz güncellendi.')
    } catch {
      toast.error('Beklenmeyen bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthShell
        badge={copy.successBadge}
        title={copy.successTitle}
        description={copy.successDescription}
      >
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-7" />
          </div>
          <h2 className="text-2xl font-black text-brand-navy">{copy.successHeading}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">{copy.successBody}</p>
          <Button
            asChild
            className="mt-6 h-11 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90"
          >
            <Link href="/auth/login">{copy.successCta}</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell badge={copy.badge} title={copy.title} description={copy.description}>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-brand-navy">{copy.heading}</h2>
        <p className="mt-2 text-sm text-slate-500">{copy.hint}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-password">{copy.passwordLabel}</Label>
          <Input
            id="reset-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={loading}
            className="h-11 rounded-lg text-base md:text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reset-password-confirm">{copy.confirmLabel}</Label>
          <Input
            id="reset-password-confirm"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            placeholder="********"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            disabled={loading}
            className="h-11 rounded-lg text-base md:text-sm"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Güncelleniyor...
            </>
          ) : (
            <>
              <Lock className="mr-2 size-4" />
              {copy.submit}
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
