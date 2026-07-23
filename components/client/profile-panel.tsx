'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, HeartPulse, Loader2, LogOut, Search, UserRound } from 'lucide-react'
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

export function ClientProfilePanel() {
  const [booting, setBooting] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authBusy, setAuthBusy] = useState(false)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)

  const loadProfile = useCallback(async () => {
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
      return
    }
    const json = (await res.json()) as { profile: Profile | null }
    setAuthed(true)
    setProfile(json.profile)
    if (json.profile) {
      setFullName(json.profile.fullName ?? '')
      setPhone(json.profile.phone ?? '')
      setProfileEmail(json.profile.email ?? '')
      setCity(json.profile.city ?? '')
      setAddress(json.profile.address ?? '')
    }
  }, [])

  useEffect(() => {
    void (async () => {
      setBooting(true)
      try {
        await loadProfile()
      } finally {
        setBooting(false)
      }
    })()
  }, [loadProfile])

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || password.length < 6) {
      toast.error('Geçerli e-posta ve en az 6 karakter şifre girin')
      return
    }
    setAuthBusy(true)
    const supabase = createClient()
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: trimmed, password })
        if (error) throw error
        toast.success('Giriş yapıldı')
      } else {
        const { error } = await supabase.auth.signUp({
          email: trimmed,
          password,
          options: {
            data: { full_name: authName.trim() || trimmed.split('@')[0] },
          },
        })
        if (error) throw error
        toast.success('Hesap oluşturuldu. Giriş yapıldıysa randevularınıza gidebilirsiniz.')
      }
      await loadProfile()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kimlik doğrulama başarısız')
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
      await loadProfile()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kayıt başarısız')
    } finally {
      setSaving(false)
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
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Ad soyad</label>
                <Input value={authName} onChange={(e) => setAuthName(e.target.value)} autoComplete="name" />
              </div>
            ) : null}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">E-posta</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">Şifre</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
              />
            </div>
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
