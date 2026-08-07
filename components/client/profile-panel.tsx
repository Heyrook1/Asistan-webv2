'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  Eye,
  EyeOff,
  HeartPulse,
  Loader2,
  LogOut,
  Search,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { productName } from '@/lib/brand/masterbrand'
import { cn } from '@/lib/utils'

type Profile = {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
}

async function getAccessToken() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function claimGuestBookings(token: string) {
  const res = await fetch('/api/client/bookings/claim', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
  })
  if (!res.ok) return
  const json = (await res.json().catch(() => null)) as {
    ok?: boolean
    data?: { claimed?: number; message?: string }
    claimed?: number
    message?: string
  } | null
  const claimed = json?.data?.claimed ?? json?.claimed ?? 0
  const message = json?.data?.message ?? json?.message
  if (claimed > 0) {
    toast.success(message || `${claimed} misafir randevu hesabınıza bağlandı.`)
  } else if (message) {
    toast.message(message)
  }
}

export function ClientProfilePanel() {
  const [booting, setBooting] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authName, setAuthName] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [authBusy, setAuthBusy] = useState(false)
  const [verifyHint, setVerifyHint] = useState(false)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [claiming, setClaiming] = useState(false)

  const loadProfile = useCallback(async (opts?: { claim?: boolean }) => {
    const token = await getAccessToken()
    if (!token) {
      setAuthed(false)
      setProfile(null)
      return
    }
    const res = await fetch('/api/client/profile', {
      headers: { authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      setAuthed(false)
      setProfile(null)
      if (res.status === 401 || res.status === 403) {
        setVerifyHint(true)
      }
      return
    }
    const json = (await res.json()) as { profile: Profile | null }
    setAuthed(true)
    setVerifyHint(false)
    setProfile(json.profile)
    if (json.profile) {
      setFullName(json.profile.fullName ?? '')
      setPhone(json.profile.phone ?? '')
      setProfileEmail(json.profile.email ?? '')
      setCity(json.profile.city ?? '')
      setAddress(json.profile.address ?? '')
    }
    if (opts?.claim) {
      await claimGuestBookings(token)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setBooting(true)
      try {
        const token = await Promise.race([
          getAccessToken(),
          new Promise<null>((resolve) => {
            window.setTimeout(() => resolve(null), 4_000)
          }),
        ])
        if (cancelled) return
        if (!token) {
          setAuthed(false)
          setProfile(null)
          return
        }
        await loadProfile({ claim: true })
      } catch {
        if (!cancelled) {
          setAuthed(false)
          setProfile(null)
        }
      } finally {
        if (!cancelled) setBooting(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadProfile])

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || password.length < 6) {
      toast.error('Geçerli e-posta ve en az 6 karakter şifre girin')
      return
    }
    if (mode === 'register' && !acceptedTerms) {
      toast.error('Devam etmek için gizlilik ve kullanım koşullarını kabul edin')
      return
    }
    setAuthBusy(true)
    const supabase = createClient()
    try {
      const gateRes = await fetch('/api/auth/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: mode === 'login' ? 'login' : 'register' }),
      })
      if (gateRes.status === 429) {
        toast.error('Çok fazla deneme. 15 dakika sonra tekrar deneyin.')
        return
      }

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: trimmed, password })
        if (error) {
          toast.error('Giriş başarısız. E-posta veya şifreyi kontrol edin.')
          return
        }
        toast.success('Giriş yapıldı')
        await loadProfile({ claim: true })
      } else {
        const origin = window.location.origin
        const { data, error } = await supabase.auth.signUp({
          email: trimmed,
          password,
          options: {
            data: { full_name: authName.trim() || trimmed.split('@')[0] },
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent('/client/profile')}`,
          },
        })
        if (error) {
          toast.error('Kayıt tamamlanamadı. Lütfen tekrar deneyin.')
          return
        }
        if (data.session) {
          toast.success('Hesap oluşturuldu')
          await loadProfile({ claim: true })
        } else {
          setVerifyHint(true)
          setMode('login')
          toast.success('Doğrulama e-postası gönderildi. Gelen kutunuzu kontrol edin.')
        }
      }
    } catch {
      toast.error('Kimlik doğrulama başarısız. Lütfen tekrar deneyin.')
    } finally {
      setAuthBusy(false)
    }
  }

  async function handleSave() {
    const token = await getAccessToken()
    if (!token) return
    setSaving(true)
    try {
      const res = await fetch('/api/client/profile', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim() || null,
          email: profileEmail.trim() || null,
          city: city.trim() || null,
          address: address.trim() || null,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((json as { error?: string }).error || 'Kayıt başarısız')
      toast.success('Profil güncellendi')
      await loadProfile({ claim: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kayıt başarısız')
    } finally {
      setSaving(false)
    }
  }

  async function handleClaim() {
    const token = await getAccessToken()
    if (!token) return
    setClaiming(true)
    try {
      await claimGuestBookings(token)
    } finally {
      setClaiming(false)
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setAuthed(false)
    setProfile(null)
    toast.message('Çıkış yapıldı')
  }

  if (booting) {
    return (
      <main className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
      </main>
    )
  }

  if (!authed) {
    return (
      <main className="space-y-5">
        <header className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0071E3]">
            {productName('booking', 'tr')}
          </p>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900">Profil</h1>
          <p className="text-sm text-slate-500">
            Randevularınızı takip etmek için giriş yapın. Hesap olmadan da kliniklerden randevu alabilirsiniz.
          </p>
        </header>

        {verifyHint ? (
          <div className="rounded-[1.15rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            E-posta doğrulaması gerekli. Gelen kutunuzdaki bağlantıyı açtıktan sonra tekrar giriş yapın.
          </div>
        ) : null}

        <div className="rounded-[1.35rem] bg-white/90 p-4 ring-1 ring-slate-900/5">
          <div className="mb-4 flex gap-1 rounded-full bg-slate-100/80 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={cn(
                'flex-1 rounded-full py-2 text-sm font-bold transition',
                mode === 'login' ? 'bg-white text-slate-900' : 'text-slate-500',
              )}
            >
              Giriş
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={cn(
                'flex-1 rounded-full py-2 text-sm font-bold transition',
                mode === 'register' ? 'bg-white text-slate-900' : 'text-slate-500',
              )}
            >
              Kayıt
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-3">
            {mode === 'register' ? (
              <div>
                <label htmlFor="client-auth-name" className="mb-1.5 block text-xs font-medium text-slate-500">
                  Ad soyad
                </label>
                <Input
                  id="client-auth-name"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            ) : null}
            <div>
              <label htmlFor="client-auth-email" className="mb-1.5 block text-xs font-medium text-slate-500">
                E-posta
              </label>
              <Input
                id="client-auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label htmlFor="client-auth-password" className="mb-1.5 block text-xs font-medium text-slate-500">
                Şifre
              </label>
              <div className="relative">
                <Input
                  id="client-auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  className="pr-11"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-700"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' ? (
              <label className="flex items-start gap-2 text-[12px] leading-relaxed text-slate-600">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 rounded border-slate-300"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span>
                  <Link href="/privacy" className="font-semibold text-[#0071E3] underline-offset-2 hover:underline">
                    Gizlilik
                  </Link>
                  {' '}ve{' '}
                  <Link href="/terms" className="font-semibold text-[#0071E3] underline-offset-2 hover:underline">
                    kullanım koşullarını
                  </Link>{' '}
                  okudum, kabul ediyorum.
                </span>
              </label>
            ) : (
              <div className="text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-[12px] font-semibold text-[#0071E3] underline-offset-2 hover:underline"
                >
                  Şifremi unuttum
                </Link>
              </div>
            )}

            <Button
              type="submit"
              disabled={authBusy}
              className="h-11 w-full rounded-full bg-[#0071E3] font-bold text-white hover:bg-[#0077ed]"
            >
              {authBusy ? 'Bekleyin…' : mode === 'login' ? 'Giriş yap' : 'Hesap oluştur'}
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/client/clinics"
            className="rounded-[1.15rem] bg-white p-4 ring-1 ring-slate-200/70 transition active:scale-[0.98]"
          >
            <Search className="size-4 text-[#0071E3]" />
            <p className="mt-2 text-sm font-bold text-slate-900">Klinik bul</p>
            <p className="mt-1 text-xs text-slate-500">Hesapsız randevu</p>
          </Link>
          <Link
            href="/client/health"
            className="rounded-[1.15rem] bg-white p-4 ring-1 ring-slate-200/70 transition active:scale-[0.98]"
          >
            <HeartPulse className="size-4 text-emerald-600" />
            <p className="mt-2 text-sm font-bold text-slate-900">Sağlık</p>
            <p className="mt-1 text-xs text-slate-500">Ziyaret geçmişi</p>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0071E3]">
            {productName('booking', 'tr')}
          </p>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900">Profilim</h1>
          <p className="mt-1 text-sm text-slate-500">İletişim bilgilerinizi güncelleyin.</p>
        </div>
        <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={handleLogout}>
          <LogOut className="mr-1 size-3.5" />
          Çıkış
        </Button>
      </header>

      <div className="flex items-center gap-3 rounded-[1.25rem] bg-[#0071E3] px-4 py-4 text-white">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15">
          <UserRound className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-bold">{fullName || profile?.fullName || 'Hasta'}</p>
          <p className="truncate text-sm text-white/80">{profileEmail || profile?.email || email}</p>
        </div>
      </div>

      <div className="space-y-3 rounded-[1.25rem] bg-white p-4 ring-1 ring-slate-200/70">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Ad soyad</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Telefon</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">E-posta</label>
          <Input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Şehir</label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">Adres</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <Button
          type="button"
          disabled={saving || fullName.trim().length < 2}
          className="h-11 w-full rounded-xl bg-[#0071E3] font-semibold text-white hover:bg-[#0077ed]"
          onClick={handleSave}
        >
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={claiming}
          className="h-11 w-full rounded-xl"
          onClick={handleClaim}
        >
          {claiming ? 'Bağlanıyor…' : 'Misafir randevularımı bağla'}
        </Button>
        <p className="text-center text-[11px] text-slate-400">
          <Link href="/privacy" className="underline-offset-2 hover:underline">
            Gizlilik
          </Link>
          {' · '}
          <Link href="/terms" className="underline-offset-2 hover:underline">
            Kullanım koşulları
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="h-11 rounded-xl">
          <Link href="/client/bookings">
            <CalendarDays className="mr-1.5 size-4" />
            Randevularım
          </Link>
        </Button>
        <Button asChild className="h-11 rounded-xl bg-[#0071E3] text-white hover:bg-[#0077ed]">
          <Link href="/client/health">
            <HeartPulse className="mr-1.5 size-4" />
            Sağlık
          </Link>
        </Button>
      </div>
    </main>
  )
}
