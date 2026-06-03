// components/auth/LoginForm.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { useLanguage } from '@/hooks/useLanguage'
import { CheckCircle2, Mail, Lock, ShieldAlert, Loader2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function LoginForm() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')

  const supabase = createClient()

  // Real-time email validation
  useEffect(() => {
    if (!email) {
      setEmailError('')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError(t({ tr: 'Geçersiz e-posta formatı', en: 'Invalid email format' }))
    } else {
      setEmailError('')
    }
  }, [email, t])

  // Redirect if already logged in with verified session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email_confirmed_at) {
        router.push('/dashboard')
      }
    })
  }, [router, supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (emailError) return

    setLoading(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(
          signInError.message === 'Invalid login credentials'
            ? t({ tr: 'E-posta veya şifre hatalı.', en: 'Incorrect email or password.' })
            : signInError.message
        )
        toast.error(t({ tr: 'Giriş Başarısız', en: 'Login Failed' }))
        setLoading(false)
        return
      }

      const user = data?.user
      if (user && !user.email_confirmed_at) {
        // Enforce verified email
        await supabase.auth.signOut()
        setError(t({
          tr: 'Lütfen giriş yapmadan önce e-postanızı doğrulayın. Doğrulama linki gönderildi.',
          en: 'Please verify your email before logging in. A verification link has been sent.'
        }))
        toast.warning(t({ tr: 'E-posta Doğrulanmadı', en: 'Email Unverified' }))
        setLoading(false)
        return
      }

      toast.success(t({ tr: 'Giriş Başarılı', en: 'Login Successful' }))
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError(t({
        tr: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        en: 'An error occurred. Please try again.'
      }))
    } finally {
      setLoading(false)
    }
  }

  const registerUrl = language === 'tr' ? '/tr/kayit' : '/en/register'

  return (
    <div className="w-full max-w-4xl grid gap-8 lg:grid-cols-2 items-center">
      {/* LEFT COLUMN: Premium Copy & Benefits */}
      <div className="space-y-6 text-left hidden lg:block">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] leading-tight">
          {t({
            tr: 'Hesabınıza güvenli giriş yapın',
            en: 'Secure login to your account'
          })}
        </h1>
        <p className="text-sm font-semibold leading-relaxed text-[#5D6068]">
          {t({
            tr: 'Klinik panelinize ulaşarak randevu, hasta ve ekip akışlarını tek yerden yönetin.',
            en: 'Access your clinic dashboard to manage appointments, patients, and team workflows.'
          })}
        </p>

        <ul className="space-y-3.5 pt-4">
          {[
            {
              tr: 'Randevu ve takvim kontrolü',
              en: 'Appointment & calendar control'
            },
            {
              tr: 'Hasta kayıtları ve notlar',
              en: 'Patient records and notes'
            },
            {
              tr: 'Ekip rolleri ve bildirimler',
              en: 'Team roles and notifications'
            }
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>{t(item)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT COLUMN: Glassmorphic LoginForm Card */}
      <GlassCard className="p-8 sm:p-10 bg-white/40 border-white/60 shadow-2xl rounded-3xl relative overflow-hidden">
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
              {t({ tr: 'Giriş Yap', en: 'Sign In' })}
            </h2>
            <p className="text-xs text-[#86868B] font-semibold">
              {t({ tr: 'Devam etmek için bilgilerinizi girin', en: 'Enter your credentials to continue' })}
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-700 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
              <ShieldAlert className="h-4.5 w-4.5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1D1D1F]/80 px-0.5" htmlFor="login-email">
                {t({ tr: 'E-posta Adresi', en: 'Email Address' })}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <Input
                  id="login-email"
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="pl-10.5 h-11 rounded-xl bg-white/80 border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-[#0071E3]"
                />
              </div>
              {emailError && <p className="text-xs text-red-500 font-medium px-0.5">{emailError}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-0.5">
                <label className="text-xs font-bold text-[#1D1D1F]/80" htmlFor="login-password">
                  {t({ tr: 'Şifre', en: 'Password' })}
                </label>
                <Link href="#" className="text-xs text-[#0071E3] hover:underline font-semibold">
                  {t({ tr: 'Şifremi Unuttum', en: 'Forgot password?' })}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <Input
                  id="login-password"
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10.5 h-11 rounded-xl bg-white/80 border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-[#0071E3]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !!emailError}
              className="w-full h-11 rounded-xl bg-[#0071E3] text-white hover:bg-[#0063C8] font-bold text-sm shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  {t({ tr: 'Giriş Yapılıyor...', en: 'Signing In...' })}
                </>
              ) : (
                <>
                  {t({ tr: 'Giriş Yap', en: 'Sign In' })}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-[#86868B] font-semibold">
              {t({ tr: 'Hesabınız yok mu?', en: "Don't have an account?" })}{' '}
              <Link href={registerUrl} className="text-[#0071E3] hover:underline font-bold">
                {t({ tr: 'Kayıt Olun', en: 'Register' })}
              </Link>
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
