'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AsistanLogo } from '@/components/asistan-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error('Giriş başarısız', {
          description: error.message === 'Invalid login credentials' 
            ? 'E-posta veya şifre hatalı' 
            : error.message,
        })
        return
      }

      toast.success('Giriş başarılı!')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#06B6D4]/10 via-background to-[#2563EB]/10 p-4 relative">
      <Link href="/" className="absolute top-6 right-6 text-sm font-semibold text-slate-500 hover:text-[#2563EB] flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200 hover:border-[#2563EB]/30 transition-all">
        <ArrowLeft className="h-3.5 w-3.5" /> Anasayfa
      </Link>
      <Card className="w-full max-w-md border-slate-200 shadow-xl shadow-blue-900/5">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <AsistanLogo variant="dark" />
          </div>
          <div>
            <CardTitle className="text-2xl">Hoş Geldiniz</CardTitle>
            <CardDescription className="mt-2">
              Hesabınıza giriş yapın
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Şifre</Label>
                <Link href="/auth/forgot-password" className="text-xs font-medium text-[#2563EB] hover:underline">
                  Şifremi unuttum?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>
            <p className="text-sm text-slate-500 text-center">
              Hesabınız yok mu?{' '}
              <Link href="/auth/sign-up" className="text-[#2563EB] hover:underline font-medium">
                Kayıt olun
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
