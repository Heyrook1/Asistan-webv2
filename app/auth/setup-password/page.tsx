'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { AsistanLogo } from '@/components/asistan-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<SetupPasswordShell loading />}>
      <SetupPasswordForm />
    </Suspense>
  )
}

function SetupPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true

    async function exchangeCode() {
      const code = searchParams.get('code')
      const supabase = createClient()

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          toast.error('Sifre kurulum baglantisi gecersiz veya suresi dolmus.')
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

    exchangeCode()
    return () => {
      mounted = false
    }
  }, [router, searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('Sifre en az 6 karakter olmali')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Sifreler eslesmiyor')
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

      toast.success('Sifreniz hazir. Hos geldiniz!')
      router.push('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <SetupPasswordShell ready={ready} loading={loading} onSubmit={handleSubmit}>
      {ready ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="password">Yeni sifre</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Sifre tekrar</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
        </>
      ) : null}
    </SetupPasswordShell>
  )
}

function SetupPasswordShell({
  children,
  ready = false,
  loading = false,
  onSubmit,
}: {
  children?: React.ReactNode
  ready?: boolean
  loading?: boolean
  onSubmit?: (e: React.FormEvent) => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <AsistanLogo variant="dark" />
          </div>
          <div>
            <CardTitle className="text-2xl">Sifrenizi Belirleyin</CardTitle>
            <CardDescription className="mt-2">
              Ekip hesabiniza giris yapmak icin yeni bir sifre olusturun.
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            {!ready ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Baglanti dogrulaniyor...
              </div>
            ) : children}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={!ready || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Sifreyi Kaydet'
              )}
            </Button>
            <Link href="/auth/login" className="text-sm font-medium text-primary hover:underline">
              Giris sayfasina don
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
