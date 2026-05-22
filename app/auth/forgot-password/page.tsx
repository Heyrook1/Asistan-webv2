'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AsistanLogo } from '@/components/asistan-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      // Yönlendirme (Callback) adresi ayarlıyoruz
      const redirectUrl = new URL('/auth/callback', window.location.origin)
      redirectUrl.searchParams.set('next', '/auth/reset-password')

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl.toString(),
      })

      if (error) {
        toast.error('Bağlantı gönderilemedi', {
          description: error.message,
        })
        return
      }

      setIsSent(true)
      toast.success('Sıfırlama bağlantısı gönderildi')
    } catch {
      toast.error('Beklenmeyen bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#06B6D4]/10 via-background to-[#2563EB]/10 p-4">
        <Card className="w-full max-w-md border-slate-200 shadow-xl shadow-blue-900/5">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-[#06B6D4]/10 rounded-full flex items-center justify-center text-[#06B6D4]">
                <MailCheck className="h-8 w-8" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl text-[#0C1D36]">E-postanızı Kontrol Edin</CardTitle>
              <CardDescription className="mt-2 text-slate-500">
                <span className="font-semibold text-slate-700">{email}</span> adresine bir şifre sıfırlama bağlantısı gönderdik. Lütfen gelen kutunuzu (veya spam klasörünüzü) kontrol edin.
              </CardDescription>
            </div>
          </CardHeader>
          <CardFooter className="flex justify-center pt-2">
            <Link href="/auth/login" className="text-sm font-semibold text-[#2563EB] hover:text-[#1d4ed8] hover:underline flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Giriş sayfasına dön
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#06B6D4]/10 via-background to-[#2563EB]/10 p-4 relative">
      <Link href="/" className="absolute top-6 right-6 text-sm font-semibold text-slate-500 hover:text-[#2563EB] flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200 hover:border-[#2563EB]/30 transition-all">
        Anasayfa
      </Link>
      
      <Card className="w-full max-w-md border-slate-200 shadow-xl shadow-blue-900/5">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <AsistanLogo variant="dark" />
          </div>
          <div>
            <CardTitle className="text-2xl text-[#0C1D36]">Şifremi Unuttum</CardTitle>
            <CardDescription className="mt-2 text-slate-500">
              Sisteme kayıtlı e-posta adresinizi girin, size şifre yenileme bağlantısı gönderelim.
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleReset}>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="email" className="font-semibold text-slate-700">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="focus-visible:ring-[#2563EB] focus-visible:border-[#2563EB]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-md shadow-blue-600/20" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                'Bağlantı Gönder'
              )}
            </Button>
            <div className="flex justify-center text-sm w-full">
              <Link href="/auth/login" className="text-slate-500 hover:text-[#2563EB] flex items-center gap-1 hover:underline font-medium">
                <ArrowLeft className="h-3.5 w-3.5" /> Geri dön
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
