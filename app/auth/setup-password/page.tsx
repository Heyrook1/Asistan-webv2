'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'

import { AuthShell } from '@/components/marketing/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { passwordFlowCopy } from '@/lib/auth/password-flow-copy'
import { createClient } from '@/lib/supabase/client'

const copy = passwordFlowCopy.setup

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<SetupPasswordShell ready={false} loading />}>
      <SetupPasswordForm />
    </Suspense>
  )
}

function SetupPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    async function bootstrapSession() {
      const code = searchParams.get('code')
      const supabase = createClient()

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          toast.error('Bağlantı geçersiz veya süresi dolmuş.')
          router.replace('/auth/error')
          return
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth/login')
        return
      }

      if (mounted) setReady(true)
    }

    void bootstrapSession()
    return () => {
      mounted = false
    }
  }, [router, searchParams])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error('Şifre kaydedilemedi', { description: error.message })
        return
      }

      toast.success('Şifreniz hazır. Hoş geldiniz.')
      router.push('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <SetupPasswordShell ready={ready} loading={loading} onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="setup-password">{copy.passwordLabel}</Label>
        <Input
          id="setup-password"
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
        <Label htmlFor="setup-password-confirm">{copy.confirmLabel}</Label>
        <Input
          id="setup-password-confirm"
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
    </SetupPasswordShell>
  )
}

function SetupPasswordShell({
  children,
  ready,
  loading,
  onSubmit,
}: {
  children?: React.ReactNode
  ready: boolean
  loading: boolean
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <AuthShell
      badge={copy.badge}
      title={copy.title}
      description={copy.description}
      highlights={[...copy.highlights]}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-black text-brand-navy">{copy.heading}</h2>
        <p className="mt-2 text-sm text-slate-500">{copy.hint}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {!ready ? (
          <div className="flex items-center justify-center rounded-xl border border-brand-blue/15 bg-brand-light px-4 py-8 text-sm text-slate-600">
            <Loader2 className="mr-2 size-4 animate-spin" />
            {copy.verifying}
          </div>
        ) : (
          children
        )}

        <Button type="submit" disabled={!ready || loading} className="h-11 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90">
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Lock className="mr-2 size-4" />
              {copy.submit}
            </>
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        {copy.backPrompt}{' '}
        <Link href="/auth/login" className="font-semibold text-brand-blue hover:text-brand-teal">
          {copy.backLink}
        </Link>
        .
      </p>
    </AuthShell>
  )
}
