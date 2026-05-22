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
import { Loader2, KeyRound } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor', {
        description: 'Lütfen her iki alana da aynı şifreyi girin.'
      })
      return
    }

    if (password.length < 6) {
      toast.error('Şifre çok kısa', {
        description: 'Şifreniz en az 6 karakter olmalıdır.'
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        toast.error('Şifre güncellenemedi', {
          description: error.message,
        })
        return
      }

      setIsSuccess(true)
      toast.success('Şifreniz başarıyla güncellendi!')
    } catch {
      toast.error('Beklenmeyen bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#06B6D4]/10 via-background to-[#2563EB]/10 p-4">
        <Card className="w-full max-w-md border-slate-200 shadow-xl shadow-blue-900/5">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <KeyRound className="h-8 w-8" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl text-[#0C1D36]">Şifreniz Güncellendi</CardTitle>
              <CardDescription className="mt-2 text-slate-500">
                Yeni şifrenizle sisteme güvenle giriş yapabilirsiniz.
              </CardDescription>
            </div>
          </CardHeader>
          <CardFooter className="flex justify-center pt-2">
            <Button asChild className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white">
              <Link href="/auth/login">Giriş Yap</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#06B6D4]/10 via-background to-[#2563EB]/10 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl shadow-blue-900/5">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <AsistanLogo variant="dark" />
          </div>
          <div>
            <CardTitle className="text-2xl text-[#0C1D36]">Yeni Şifre Belirle</CardTitle>
            <CardDescription className="mt-2 text-slate-500">
              Lütfen hesabınız için yeni bir şifre girin.
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleUpdate}>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="font-semibold text-slate-700">Yeni Şifre</Label>
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
            <div className="space-y-2 text-left">
              <Label htmlFor="confirmPassword" className="font-semibold text-slate-700">Şifre Tekrarı</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="focus-visible:ring-[#2563EB] focus-visible:border-[#2563EB]"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-md shadow-blue-600/20" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                'Şifreyi Güncelle'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
