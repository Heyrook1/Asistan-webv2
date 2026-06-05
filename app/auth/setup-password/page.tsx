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
import { createClient } from '@/lib/supabase/client'

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
          toast.error('Baglanti gecersiz veya suresi dolmus.')
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
      toast.error('Sifre en az 6 karakter olmali.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Sifreler eslesmiyor.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error('Sifre kaydedilemedi', { description: error.message })
        return
      }

      toast.success('Sifreniz hazir. Hos geldiniz.')
      router.push('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <SetupPasswordShell ready={ready} loading={loading} onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="setup-password">Yeni Sifre</Label>
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
          className="h-11 rounded-lg"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="setup-password-confirm">Sifre Tekrar</Label>
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
          className="h-11 rounded-lg"
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
      badge="Ilk Kurulum"
      title="Ekip hesabi sifresini belirleyin."
      description="Davet baglantisi dogrulandiktan sonra yeni sifrenizi kaydedip panelinize gecebilirsiniz."
      highlights={[
        'Baglanti otomatik olarak dogrulanir',
        'Yeni sifre aninda aktif olur',
        'Kayit sonrasi direkt dashboard acilir',
      ]}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-black text-brand-navy">Sifrenizi Belirleyin</h2>
        <p className="mt-2 text-sm text-slate-500">Ekip hesabiniz icin yeni sifre olusturun.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {!ready ? (
          <div className="flex items-center justify-center rounded-xl border border-brand-blue/15 bg-brand-light px-4 py-8 text-sm text-slate-600">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Baglanti dogrulaniyor...
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
              Sifreyi Kaydet
            </>
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Geri donmek icin{' '}
        <Link href="/auth/login" className="font-semibold text-brand-blue hover:text-brand-teal">
          giris sayfasina gecin
        </Link>
        .
      </p>
    </AuthShell>
  )
}
