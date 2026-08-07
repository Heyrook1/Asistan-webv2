// components/auth/RegisterForm.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { useLanguage } from '@/hooks/useLanguage'
import { getLoginPath } from '@/lib/auth-routes'
import { ENTRY_CTA } from '@/lib/entry-routes'
import { authFormCopy } from '@/lib/auth/auth-form-copy'
import { CheckCircle2, User, Mail, Lock, ShieldAlert, Loader2, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { checkDuplicateEmail } from '@/app/register/actions'
import { markForceQuickStart } from '@/lib/onboarding/quick-start-handoff'
import { toast } from 'sonner'

export function RegisterForm() {
  const { t, language } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  // Field errors: Empty ✅ on blur/submit (not keystroke for email — BUG-008)
  const [emailError, setEmailError] = useState('')
  const [nameError, setNameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [termsError, setTermsError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' })
  const [passwordMatchError, setPasswordMatchError] = useState('')

  const supabase = createClient()

  function validateName(value: string, opts?: { allowEmpty?: boolean }) {
    if (!value.trim()) {
      if (opts?.allowEmpty) {
        setNameError('')
        return false
      }
      setNameError(t({ tr: 'Ad soyad gerekli', en: 'Full name is required' }))
      return false
    }
    if (value.trim().length < 2) {
      setNameError(t({ tr: 'Lütfen adınızı ve soyadınızı eksiksiz girin.', en: 'Please enter your full name.' }))
      return false
    }
    setNameError('')
    return true
  }

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
    if (value.length < 6) {
      setPasswordError(t({ tr: 'Şifre en az 6 karakter olmalı', en: 'Password must be at least 6 characters' }))
      return false
    }
    setPasswordError('')
    return true
  }

  function validateConfirmPassword(value: string, opts?: { allowEmpty?: boolean }) {
    if (!value) {
      if (opts?.allowEmpty) {
        setPasswordMatchError('')
        return false
      }
      setPasswordMatchError(t({ tr: 'Şifre tekrarı gerekli', en: 'Confirm password is required' }))
      return false
    }
    if (value !== password) {
      setPasswordMatchError(t({ tr: 'Şifreler eşleşmiyor', en: 'Passwords do not match' }))
      return false
    }
    setPasswordMatchError('')
    return true
  }

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

    const strength =
      score <= 2
        ? { text: t({ tr: 'Zayıf', en: 'Weak' }), color: 'bg-red-500' }
        : score <= 4
          ? { text: t({ tr: 'Orta', en: 'Medium' }), color: 'bg-amber-500' }
          : { text: t({ tr: 'Güçlü', en: 'Strong' }), color: 'bg-emerald-500' }

    setPasswordStrength({ score, text: strength.text, color: strength.color })
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
    setTermsError('')

    const nameOk = validateName(name)
    const emailOk = validateEmail(email)
    const passwordOk = validatePassword(password)
    const confirmOk = validateConfirmPassword(confirmPassword)
    if (!nameOk || !emailOk || !passwordOk || !confirmOk) return

    if (!agreeTerms) {
      setTermsError(t({ tr: 'Kullanım koşullarını kabul etmelisiniz.', en: 'Please accept the terms of use.' }))
      toast.warning(t({ tr: 'Lütfen kullanım koşullarını kabul edin.', en: 'Please accept the terms of use.' }))
      return
    }

    setLoading(true)
    try {
      const gateRes = await fetch('/api/auth/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register' }),
      })
      if (gateRes.status === 429) {
        setError(t({ tr: 'Çok fazla deneme. 15 dakika sonra tekrar deneyin.', en: 'Too many attempts. Try again in 15 minutes.' }))
        toast.error(t({ tr: 'Çok fazla deneme', en: 'Too many attempts' }))
        setLoading(false)
        return
      }

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

      markForceQuickStart()
      setSignUpSuccess(true)
      toast.success(t({ tr: 'Kayıt işlemi başlatıldı', en: 'Account created — check your email' }))
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
              tr: 'Demo sürecinde birebir kurulum desteği',
              en: 'One-on-one setup support during demo'
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
                {t(ENTRY_CTA.clinicTrial)}
              </h2>
              <p className="text-xs font-semibold text-[#86868B]">
                {t(ENTRY_CTA.clinicTrialRiskReducer)}
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

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              {/* Full Name Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1D1D1F]/80 px-0.5" htmlFor="register-name">
                  {t({ tr: 'Ad Soyad', en: 'Full Name' })}{' '}
                  <span className="text-red-500" aria-hidden="true">
                    *
                  </span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
                  <Input
                    id="register-name"
                    type="text"
                    required
                    disabled={loading}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (nameError) setNameError('')
                    }}
                    onBlur={() => validateName(name, { allowEmpty: !name.trim() })}
                    placeholder={t(authFormCopy.namePlaceholder)}
                    autoComplete="name"
                    aria-required="true"
                    aria-describedby={nameError ? 'register-name-error' : undefined}
                    aria-invalid={nameError ? true : undefined}
                    className="h-11 rounded-xl border-slate-200 bg-white/80 pl-10.5 text-base focus-visible:ring-2 focus-visible:ring-[#0071E3]/40 md:text-sm"
                  />
                </div>
                {nameError && (
                  <p id="register-name-error" role="alert" className="px-0.5 text-xs font-medium text-red-500">
                    {nameError}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1D1D1F]/80 px-0.5" htmlFor="register-email">
                  {t({ tr: 'E-posta Adresi', en: 'Email Address' })}{' '}
                  <span className="text-red-500" aria-hidden="true">
                    *
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
                  <Input
                    id="register-email"
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
                    aria-describedby={emailError ? 'register-email-error' : undefined}
                    aria-invalid={emailError ? true : undefined}
                    className="h-11 rounded-xl border-slate-200 bg-white/80 pl-10.5 text-base focus-visible:ring-2 focus-visible:ring-[#0071E3]/40 md:text-sm"
                  />
                </div>
                {emailError && (
                  <p id="register-email-error" role="alert" className="px-0.5 text-xs font-medium text-red-500">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Passwords row */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#1D1D1F]/80 px-0.5" htmlFor="register-password">
                    {t({ tr: 'Şifre', en: 'Password' })}{' '}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
                    <Input
                      id="register-password"
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
                      autoComplete="new-password"
                      aria-required="true"
                      aria-describedby={passwordError ? 'register-password-error' : undefined}
                      aria-invalid={passwordError ? true : undefined}
                      className="h-11 rounded-xl border-slate-200 bg-white/80 pl-10.5 pr-12 text-base focus-visible:ring-2 focus-visible:ring-[#0071E3]/40 md:text-sm"
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
                    <p id="register-password-error" role="alert" className="px-0.5 text-xs font-medium text-red-500">
                      {passwordError}
                    </p>
                  )}
                  {password && !passwordError && (
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
                    {t({ tr: 'Şifre Tekrar', en: 'Confirm Password' })}{' '}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" aria-hidden="true" />
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      disabled={loading}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (passwordMatchError) setPasswordMatchError('')
                      }}
                      onBlur={() => validateConfirmPassword(confirmPassword, { allowEmpty: !confirmPassword })}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      aria-required="true"
                      aria-describedby={passwordMatchError ? 'register-password-match-error' : undefined}
                      aria-invalid={passwordMatchError ? true : undefined}
                      className="h-11 rounded-xl border-slate-200 bg-white/80 pl-10.5 pr-12 text-base focus-visible:ring-2 focus-visible:ring-[#0071E3]/40 md:text-sm"
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/40"
                      aria-label={
                        showConfirmPassword
                          ? t({ tr: 'Şifreyi gizle', en: 'Hide password' })
                          : t({ tr: 'Şifreyi göster', en: 'Show password' })
                      }
                      aria-pressed={showConfirmPassword}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4.5 w-4.5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {passwordMatchError && (
                    <p id="register-password-match-error" role="alert" className="px-0.5 text-xs font-medium text-red-500">
                      {passwordMatchError}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="space-y-1 py-1.5">
                <div className="flex items-start gap-2">
                  <input
                    id="register-terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked)
                      if (e.target.checked) setTermsError('')
                    }}
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={termsError ? true : undefined}
                    aria-describedby={termsError ? 'register-terms-error' : undefined}
                    className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/40"
                  />
                  <label htmlFor="register-terms" className="cursor-pointer text-xs font-semibold leading-normal text-[#5D6068] selection:bg-transparent">
                    {language === 'tr' ? (
                      <>
                        <Link
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-[#0071E3]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Kullanım şartlarını
                        </Link>
                        {' '}ve{' '}
                        <Link
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-[#0071E3]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          gizlilik politikasını
                        </Link>
                        {' '}kabul ediyorum.
                        <span className="text-red-500" aria-hidden="true">
                          {' '}
                          *
                        </span>
                      </>
                    ) : (
                      <>
                        I agree to the{' '}
                        <Link
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-[#0071E3]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          terms of use
                        </Link>
                        {' '}and{' '}
                        <Link
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-[#0071E3]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          privacy policy
                        </Link>
                        .
                        <span className="text-red-500" aria-hidden="true">
                          {' '}
                          *
                        </span>
                      </>
                    )}
                  </label>
                </div>
                {termsError && (
                  <p id="register-terms-error" role="alert" className="px-0.5 text-xs font-medium text-red-500">
                    {termsError}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !!emailError || !!nameError || !!passwordError || !!passwordMatchError || !!termsError}
                className="mt-3 h-11 min-h-11 w-full rounded-xl bg-[#0071E3] text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-[1.01] hover:bg-[#0063C8] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#0071E3]/40"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    {t({ tr: 'Hesap Oluşturuluyor...', en: 'Creating Account...' })}
                  </>
                ) : (
                  <>
                    {t(ENTRY_CTA.clinicTrial)}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <p className="px-0.5 text-center text-[11px] font-medium text-[#86868B]">
                {t(ENTRY_CTA.clinicTrialRiskReducer)}
              </p>
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
                  tr: 'E-postanızdaki doğrulama linkine tıklayın. Panele girdiğinizde 3 adımlık hızlı başlangıç turu açılır — ilk randevunuzu dakikalar içinde oluşturursunuz.',
                  en: 'Click the verification link in your email. When you open the panel, a 3-step quick-start tour appears so you can book your first appointment in minutes.',
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
