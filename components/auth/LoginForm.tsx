// components/auth/LoginForm.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { useLanguage } from '@/hooks/useLanguage'
import { getRegisterPath } from '@/lib/auth-routes'
import { ENTRY_CTA } from '@/lib/entry-routes'
import { authFormCopy } from '@/lib/auth/auth-form-copy'
import { CheckCircle2, Mail, Lock, ShieldAlert, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { sanitizeReturnPath } from '@/lib/auth/safe-return-path'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, language } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const packageExpired = searchParams.get('reason') === 'package-expired'
  const nextPath = sanitizeReturnPath(searchParams.get('next'), '/dashboard')
  const supabase = createClient()

  function validateEmail(value: string, opts?: { allowEmpty?: boolean }) {
    if (!value.trim()) {
      if (opts?.allowEmpty) {
        setEmailError('')
        return false
      }
      setEmailError(t({ tr: 'E-posta gerekli', en: 'Email is required' }))
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      setEmailError(t(authFormCopy.emailInvalid))
      return false
    }
    setEmailError('')
    return true
  }

  function validatePassword(value: string, opts?: { allowEmpty?: boolean }) {
    if (!value) {
      if (opts?.allowEmpty) {
        setPasswordError('')
        return false
      }
      setPasswordError(t({ tr: 'Şifre gerekli', en: 'Password is required' }))
      return false
    }
    setPasswordError('')
    return true
  }

  // Break dashboard↔login loop when package is expired; otherwise redirect if already logged in
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email_confirmed_at || cancelled) return

      if (packageExpired) {
        await supabase.auth.signOut()
        return
      }

      router.push(nextPath)
    })()
    return () => {
      cancelled = true
    }
  }, [packageExpired, router, supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const emailOk = validateEmail(email)
    const passwordOk = validatePassword(password)
    if (!emailOk || !passwordOk) return

    setLoading(true)
    try {
      const gateRes = await fetch('/api/auth/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login' }),
      })
      if (gateRes.status === 429) {
        setError(t({ tr: 'Çok fazla deneme. 15 dakika sonra tekrar deneyin.', en: 'Too many attempts. Try again in 15 minutes.' }))
        toast.error(t({ tr: 'Çok fazla deneme', en: 'Too many attempts' }))
        setLoading(false)
        return
      }

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
      router.push(nextPath)
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

  const registerUrl = getRegisterPath(language)

  return (
    <div className="w-full max-w-4xl grid gap-8 lg:grid-cols-2 items-center">
      {/* LEFT COLUMN: Premium Copy & Benefits */}
      <div className="space-y-6 text-left hidden lg:block">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] leading-tight">
          {t({
            tr: 'Hesabınıza güvenli giriş yapın',
            en: 'Sign in securely to your clinic account'
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

          {packageExpired && (
            <div
              role="alert"
              className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-left text-xs font-semibold leading-relaxed text-amber-950"
            >
              <p className="font-bold">
                {t({
                  tr: 'Paket süreniz doldu',
                  en: 'Your package has expired',
                })}
              </p>
              <p className="mt-1.5 font-medium text-amber-900/90">
                {t({
                  tr: 'Klinik paneline erişim askıya alındı. Yenileme için elden / faturalı süreçte ekibimizle iletişime geçin.',
                  en: 'Dashboard access is suspended. Contact us for a manual / invoiced renewal.',
                })}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href="mailto:merhaba@asistan.online?subject=Paket%20yenileme%20talebi"
                  className="font-bold text-[#0071E3] underline-offset-2 hover:underline"
                >
                  merhaba@asistan.online
                </a>
                <Link href="/contact" className="font-bold text-[#0071E3] underline-offset-2 hover:underline">
                  {t({ tr: 'İletişim formu', en: 'Contact form' })}
                </Link>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-700 rounded-2xl flex items-center gap-2.5 text-xs font-semibold"
            >
              <ShieldAlert className="h-4.5 w-4.5 text-red-600 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1D1D1F]/80 px-0.5" htmlFor="login-email">
                {t({ tr: 'E-posta Adresi', en: 'Email Address' })}{' '}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
                <Input
                  id="login-email"
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) setEmailError('')
                  }}
                  onBlur={() => validateEmail(email, { allowEmpty: !email.trim() })}
                  placeholder={t(authFormCopy.emailPlaceholder)}
                  autoComplete="email"
                  aria-required="true"
                  aria-describedby={emailError ? 'login-email-error' : undefined}
                  aria-invalid={emailError ? true : undefined}
                  className="pl-10.5 h-11 rounded-xl bg-white/80 border-slate-200 text-base md:text-sm focus-visible:ring-2 focus-visible:ring-[#0071E3]/40"
                />
              </div>
              {emailError && (
                <p id="login-email-error" role="alert" className="text-xs text-red-500 font-medium px-0.5">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-0.5">
                <label className="text-xs font-bold text-[#1D1D1F]/80" htmlFor="login-password">
                  {t({ tr: 'Şifre', en: 'Password' })}{' '}
                  <span className="text-red-500" aria-hidden="true">
                    *
                  </span>
                </label>
                <Link href="/auth/forgot-password" className="text-xs text-[#0071E3] hover:underline font-semibold">
                  {t({ tr: 'Şifremi Unuttum', en: 'Forgot password?' })}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (passwordError) setPasswordError('')
                  }}
                  onBlur={() => validatePassword(password, { allowEmpty: !password })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-required="true"
                  aria-describedby={passwordError ? 'login-password-error' : undefined}
                  aria-invalid={passwordError ? true : undefined}
                  className="pl-10.5 pr-12 h-11 rounded-xl bg-white/80 border-slate-200 text-base md:text-sm focus-visible:ring-2 focus-visible:ring-[#0071E3]/40"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/40"
                  aria-label={
                    showPassword
                      ? t({ tr: 'Şifreyi gizle', en: 'Hide password' })
                      : t({ tr: 'Şifreyi göster', en: 'Show password' })
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p id="login-password-error" role="alert" className="text-xs text-red-500 font-medium px-0.5">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !!emailError || !!passwordError}
              className="mt-6 h-11 min-h-11 w-full rounded-xl bg-[#0071E3] text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-[1.01] hover:bg-[#0063C8] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#0071E3]/40"
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
                {t(ENTRY_CTA.clinicTrial.short)}
              </Link>
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
