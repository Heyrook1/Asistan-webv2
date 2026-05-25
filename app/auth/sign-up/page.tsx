'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { AuthShell } from '@/components/marketing/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Sifreler eslesmiyor.')
      return
    }
    if (password.length < 6) {
      toast.error('Sifre en az 6 karakter olmali.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            role: 'provider',
            account_source: 'self_signup',
          },
        },
      })

      if (error) {
        toast.error('Kayit basarisiz', { description: error.message })
        return
      }

      router.push('/auth/sign-up-success')
    } catch {
      toast.error('Beklenmeyen bir hata olustu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      badge="Erken Erisim"
      title="Kliniginiz icin hesabinizi olusturun."
      description="Dakikalar icinde panelinizi acin, ekip rollerini tanimlayin ve ilk randevuyu planlayin."
      highlights={[
        'Hizli kurulum adimlari',
        'Klinige ozel yetki modeli',
        'Demo surecinde birebir onboarding',
      ]}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-black text-brand-navy">Hesap Olustur</h2>
        <p className="mt-2 text-sm text-slate-500">Erken erisim kaydinizi tamamlayin.</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-full-name">Ad Soyad</Label>
          <Input
            id="signup-full-name"
            name="full_name"
            type="text"
            autoComplete="name"
            placeholder="Adiniz Soyadiniz"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            disabled={loading}
            className="h-11 rounded-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email">E-posta</Label>
          <Input
            id="signup-email"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="signup-password">Sifre</Label>
            <Input
              id="signup-password"
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
            <Label htmlFor="signup-password-confirm">Sifre Tekrar</Label>
            <Input
              id="signup-password-confirm"
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
        </div>

        <Button type="submit" disabled={loading} className="mt-2 h-11 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90">
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Kayit olusturuluyor...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 size-4" />
              Kayit Ol
            </>
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Zaten hesabiniz var mi?{' '}
        <Link href="/auth/login" className="font-semibold text-brand-blue hover:text-brand-teal">
          Giris yapin
        </Link>
      </p>
    </AuthShell>
  )
}
