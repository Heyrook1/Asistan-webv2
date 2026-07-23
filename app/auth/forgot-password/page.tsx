'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { toast } from 'sonner'

import { AuthShell } from '@/components/marketing/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { passwordFlowCopy } from '@/lib/auth/password-flow-copy'
import { createClient } from '@/lib/supabase/client'

const copy = passwordFlowCopy.forgot

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const redirectUrl = new URL('/auth/callback', window.location.origin)
      redirectUrl.searchParams.set('next', '/auth/reset-password')

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl.toString(),
      })
      if (error) {
        toast.error('Bağlantı gönderilemedi', { description: error.message })
        return
      }

      setSent(true)
      toast.success('Sıfırlama bağlantısı gönderildi.')
    } catch {
      toast.error('Beklenmeyen bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthShell
        badge={copy.sentBadge}
        title={copy.sentTitle}
        description={`${email} adresine şifre yenileme bağlantısı gönderdik.`}
        highlights={[...copy.sentHighlights]}
      >
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-brand-cyan/10 text-brand-blue">
            <MailCheck className="size-7" />
          </div>
          <h2 className="text-2xl font-black text-brand-navy">{copy.sentHeading}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">{copy.sentBody}</p>
          <Button asChild className="mt-6 h-11 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90">
            <Link href="/auth/login">{copy.backToLogin}</Link>
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
          <Label htmlFor="forgot-email">E-posta</Label>
          <Input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="ornek@klinik.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={loading}
            className="h-11 rounded-lg text-base md:text-sm"
          />
        </div>
        <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90">
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Gönderiliyor...
            </>
          ) : (
            copy.submit
          )}
        </Button>
      </form>

      <Link href="/auth/login" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:text-brand-teal">
        <ArrowLeft className="size-4" />
        {copy.backToLogin}
      </Link>
    </AuthShell>
  )
}
