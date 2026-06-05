'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'

import { AuthShell } from '@/components/marketing/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error('Sifre guncellenemedi', { description: error.message })
        return
      }
      setSuccess(true)
      toast.success('Sifreniz guncellendi.')
    } catch {
      toast.error('Beklenmeyen bir hata olustu.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthShell
        badge="Sifre Guncellendi"
        title="Yeni sifreniz hazir."
        description="Artik panelinize yeni sifrenizle guvenli sekilde giris yapabilirsiniz."
      >
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-7" />
          </div>
          <h2 className="text-2xl font-black text-brand-navy">Sifre degisimi tamamlandi</h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">Giris ekranina donerek devam edebilirsiniz.</p>
          <Button asChild className="mt-6 h-11 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90">
            <Link href="/auth/login">Giris Yap</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      badge="Yeni Sifre"
      title="Hesabiniz icin yeni sifre belirleyin."
      description="Guclu bir sifre secin ve eski sifrenizin yerine kaydedin."
    >
      <div className="mb-6">
        <h2 className="text-2xl font-black text-brand-navy">Yeni Sifre</h2>
        <p className="mt-2 text-sm text-slate-500">Iki alana da ayni sifreyi girin.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-password">Yeni Sifre</Label>
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
            className="h-11 rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reset-password-confirm">Sifre Tekrar</Label>
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
            className="h-11 rounded-lg"
          />
        </div>

        <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90">
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Guncelleniyor...
            </>
          ) : (
            <>
              <Lock className="mr-2 size-4" />
              Sifreyi Guncelle
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
