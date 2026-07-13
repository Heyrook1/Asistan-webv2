// components/auth/RegisterForm.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { useLanguage } from '@/hooks/useLanguage'
import { getLoginPath } from '@/lib/auth-routes'
import { CheckCircle2, User, Mail, Lock, ShieldAlert, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkDuplicateEmail } from '@/app/register/actions'
import { toast } from 'sonner'

export function RegisterForm() {
  const { t, language } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  // Real-time validations
  const [emailError, setEmailError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' })
  const [passwordMatchError, setPasswordMatchError] = useState('')

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

  // Real-time password strength validation
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, text: '', color: '' })
      return
    }

    let score = 0
    if (password.length >= 6) score += 1
    if (password.length >= 10) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    let text = ''
    let color = ''

    if (score <= 2) {
      text = t({ tr: 'Zayıf', en: 'Weak' })
      color = 'bg-red-500'
    } else if (score <= 4) {
      text = t({ tr: 'Orta', en: 'Medium' })
      color = 'bg-amber-500'
    } else {
      text = t({ tr: 'Güçlü', en: 'Strong' })
      color = 'bg-emerald-500'
    }

    setPasswordStrength({ score, text, color })
  }, [password, t])

  // Real-time password matching check
  useEffect(() => {
    if (!confirmPassword) {
      setPasswordMatchError('')
      return
    }
    if (password !== confirmPassword) {
      setPasswordMatchError(t({ tr: 'Şifreler eşleşmiyor', en: 'Passwords do not match' }))
    } else {
      setPasswordMatchError('')
    }
  }, [password, confirmPassword, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (name.trim().length < 2) {
      setError(t({
        tr: 'Lütfen adınızı ve soyadınızı eksiksiz girin.',
        en: 'Please enter your full name.'
      }))
      return
    }

    if (emailError) return
    if (password.length < 6) return
    if (passwordMatchError) return

    if (!agreeTerms) {
      toast.warning(t({ tr: 'Lütfen kullanım koşullarını kabul edin.', en: 'Please accept the terms of use.' }))
      return
    }

    setLoading(true)
    try {
      // 1. Prevent duplicate signups using Prisma check
      const duplicateCheck = await checkDuplicateEmail(email)
      if (duplicateCheck.error) {
        setError(duplicateCheck.error)
        setLoading(false)
        return
      }

      if (duplicateCheck.exists) {
        setError(t({
          tr: 'Bu e-posta adresiyle kayıtlı bir hesap zaten var. Lütfen giriş yapın.',
          en: 'An account with this email already exists. Please log in.'
        }))
        toast.error(t({ tr: 'Hesap Zaten Mevcut', en: 'Account Already Exists' }))
        setLoading(false)
        return
      }

      // 2. Perform Supabase Sign Up
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          data: {
            full_name: name,
            role: 'provider',
            account_source: 'self_signup',
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        toast.error(t({ tr: 'Kayıt Başarısız', en: 'Registration Failed' }))
        setLoading(false)
        return
      }

      setSignUpSuccess(true)
      toast.success(t({ tr: 'Kayıt İşlemi Başlatıldı', en: 'Registration Initiated' }))
    } catch {
      setError(t({
        tr: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        en: 'An error occurred. Please try again.'
      }))
    } finally {
      setLoading(false)
    }
  }

  const loginUrl = getLoginPath(language)

  return (
    <div className="w-full max-w-4xl grid gap-8 lg:grid-cols-2 items-center">
      {/* LEFT COLUMN: Premium Copy & Benefits */}
      <div className="space-y-6 text-left hidden lg:block">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] leading-tight">
          {t({
            tr: 'Kliniğiniz için hesabınızı oluşturun',
            en: 'Create your clinic account'
          })}
        </h1>
        <p className="text-sm font-semibold leading-relaxed text-[#5D6068]">
          {t({
            tr: 'Dakikalar içinde panelinizi açın, ekip rollerini tanımlayın ve ilk randevuyu planlayın.',
            en: 'Set up your panel in minutes, define team roles, and schedule your first appointment.'
          })}
        </p>

        <ul className="space-y-3.5 pt-4">
          {[
            {
              tr: 'Hızlı kurulum adımları',
              en: 'Quick setup steps'
            },
            {
              tr: 'Kliniğe özel yetki modeli',
              en: 'Clinic-specific permission model'
            },
            {
              tr: 'Demo sürecinde birebir onboarding',
              en: 'One-on-one onboarding during demo'
            }
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>{t(item)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT COLUMN: Glassmorphic RegisterForm Card */}
      <GlassCard className="p-8 sm:p-10 bg-white/40 border-white/60 shadow-2xl rounded-3xl relative overflow-hidden">
        {!signUpSuccess ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
                {t({ tr: 'Kayıt Ol', en: 'Register' })}
              </h2>
              <p className="text-xs text-[#86868B] font-semibold">
                {t({ tr: 'Hemen ücretsiz hesabınızı oluşturun', en: 'Create your free account now' })}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-700 rounded-2xl flex items-center gap-2.5 text-xs font-semibold"
              >
                <ShieldAlert className="h-4.5 w-4.5 text-red-600 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1D1D1F]/80 px-0.5" htmlFor="register-name">
                  {t({ tr: 'Ad Soyad', en: 'Full Name' })}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
                  <Input
                    id="register-name"
                    type="text"
                    required
                    disabled={loading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-10.5 h-11 rounded-xl bg-white/80 border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-[#0071E3]"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1D1D1F]/80 px-0.5" htmlFor="register-email">
                  {t({ tr: 'E-posta Adresi', en: 'Email Address' })}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
                  <Input
                    id="register-email"
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    aria-describedby={emailError ? 'register-email-error' : undefined}
                    aria-invalid={emailError ? true : undefined}
                    className="pl-10.5 h-11 rounded-xl bg-white/80 border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-[#0071E3]"
                  />
                </div>
                {emailError && (
                  <p id="register-email-error" role="alert" className="text-xs text-red-500 font-medium px-0.5">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Passwords row */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1D1D1F]/80 px-0.5" htmlFor="register-password">
                    {t({ tr: 'Şifre', en: 'Password' })}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
                    <Input
                      id="register-password"
                      type="password"
                      required
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10.5 h-11 rounded-xl bg-white/80 border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-[#0071E3]"
                    />
                  </div>
                  {password && (
                    <div className="mt-1 flex items-center gap-1.5 px-0.5" aria-live="polite">
                      <div className="h-1 w-12 overflow-hidden rounded-full bg-black/10">
                        <div className={`h-full ${passwordStrength.color}`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{passwordStrength.text}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1D1D1F]/80 px-0.5" htmlFor="register-confirm-password">
                    {t({ tr: 'Şifre Tekrar', en: 'Confirm Password' })}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
                    <Input
                      id="register-confirm-password"
                      type="password"
                      required
                      disabled={loading}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      aria-describedby={passwordMatchError ? 'register-password-match-error' : undefined}
                      aria-invalid={passwordMatchError ? true : undefined}
                      className="pl-10.5 h-11 rounded-xl bg-white/80 border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-[#0071E3]"
                    />
                  </div>
                  {passwordMatchError && (
                    <p id="register-password-match-error" role="alert" className="text-xs text-red-500 font-medium px-0.5">
                      {passwordMatchError}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 py-1.5">
                <input
                  id="register-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  disabled={loading}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0071E3] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="register-terms" className="text-xs leading-normal font-semibold text-[#5D6068] cursor-pointer selection:bg-transparent">
                  {t({
                    tr: 'Kullanım şartlarını ve gizlilik politikasını kabul ediyorum.',
                    en: 'I agree to terms of use and privacy policy.',
                  })}
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !!emailError || !!passwordMatchError || password.length < 6 || !agreeTerms}
                className="w-full h-11 rounded-xl bg-[#0071E3] text-white hover:bg-[#0063C8] font-bold text-sm shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] mt-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    {t({ tr: 'Hesap Oluşturuluyor...', en: 'Creating Account...' })}
                  </>
                ) : (
                  <>
                    {t({ tr: 'Kayıt Ol', en: 'Register' })}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer Link */}
            <div className="text-center pt-1">
              <p className="text-xs text-[#86868B] font-semibold">
                {t({ tr: 'Zaten hesabınız var mı?', en: 'Already have an account?' })}{' '}
                <Link href={loginUrl} className="text-[#0071E3] hover:underline font-bold">
                  {t({ tr: 'Giriş Yapın', en: 'Login' })}
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#1D1D1F]">
                {t({ tr: 'Doğrulama E-postası Gönderildi', en: 'Verification Email Sent' })}
              </h3>
              <p className="text-xs text-[#5D6068] leading-relaxed max-w-sm mx-auto font-semibold">
                {t({
                  tr: 'E-posta adresinize bir doğrulama linki gönderdik. Lütfen hesabınızı doğrulamak için linke tıklayın. Ardından giriş yapabilirsiniz.',
                  en: 'We have sent a verification link to your email. Please click the link to verify your account, and then proceed to log in.',
                })}
              </p>
            </div>

            <div className="pt-2">
              <Button
                asChild
                className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-6"
              >
                <Link href={loginUrl}>{t({ tr: 'Giriş Ekranına Dön', en: 'Back to Login' })}</Link>
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
