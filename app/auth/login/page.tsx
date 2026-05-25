'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, LockKeyhole } from 'lucide-react'
import { toast } from 'sonner'

import { AuthShell } from '@/components/marketing/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [packageExpired, setPackageExpired] = useState(false)

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get('reason')
    setPackageExpired(reason === 'package-expired')
  }, [])

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toast.error('Giris basarisiz', {
          description: error.message === 'Invalid login credentials' ? 'E-posta veya sifre hatali.' : error.message,
        })
        return
      }

      toast.success('Giris basarili')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Beklenmeyen bir hata olustu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      badge="Panel Girisi"
      title="Hesabiniza guvenli giris yapin."
      description="Klinik panelinize ulasarak randevu, hasta ve ekip akislarini tek yerden yonetin."
      highlights={[
        'Randevu ve takvim kontrolu',
        'Hasta kayitlari ve notlar',
        'Ekip rolleri ve bildirimler',
      ]}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-black text-brand-navy">Giris Yap</h2>
        <p className="mt-2 text-sm text-slate-500">Panel hesabiniza devam edin.</p>
      </div>

      {packageExpired ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Paket sureciniz pasif gorunuyor. Yenileme icin odeme adimini tamamlayin.
        </div>
      ) : null}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">E-posta</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="ornek@klinik.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={loading}
            className="h-11 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Sifre</Label>
            <Link href="/auth/forgot-password" className="text-xs font-semibold text-brand-blue hover:text-brand-teal">
              Sifremi unuttum
            </Link>
          </div>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={loading}
            className="h-11 rounded-lg"
          />
        </div>

        <Button type="submit" disabled={loading} className="mt-2 h-11 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90">
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Giris yapiliyor...
            </>
          ) : (
            <>
              <LockKeyhole className="mr-2 size-4" />
              Giris Yap
            </>
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Hesabiniz yok mu?{' '}
        <Link href="/auth/sign-up" className="font-semibold text-brand-blue hover:text-brand-teal">
          Kayit olun
        </Link>
      </p>
    </AuthShell>
  )
}
