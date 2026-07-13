'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AccessibleField } from '@/components/ui/accessible-field'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import type { SessionContext } from '@/lib/rbac'
import { ROLE_LABELS } from '@/lib/rbac'
import { updateBusinessSettings } from '@/lib/actions/business'
import { readUiPreference, UI_PREF_KEYS, writeUiPreference } from '@/lib/ui-preferences'

type BusinessForm = {
  name: string
  description: string
  phone: string
  email: string
  address: string
  city: string
  logoUrl: string
  primaryColor: string
  currency: 'TRY' | 'USD' | 'EUR'
  timezone: string
  autoConfirmClientAppointments: boolean
}

const SETTINGS_TABS = ['hesap', 'isletme', 'randevu', 'marka'] as const
type SettingsTab = (typeof SETTINGS_TABS)[number]
const OWNER_SETTINGS_TABS: SettingsTab[] = ['isletme', 'randevu', 'marka']

function isSettingsTab(value: string | null | undefined): value is SettingsTab {
  return Boolean(value && SETTINGS_TABS.includes(value as SettingsTab))
}

function resolveSettingsTab(value: string | null | undefined, isOwner: boolean): SettingsTab {
  if (!isSettingsTab(value)) return 'hesap'
  if (!isOwner && OWNER_SETTINGS_TABS.includes(value)) return 'hesap'
  return value
}

export function SettingsForm({
  session,
  initial,
}: {
  session: SessionContext
  initial: BusinessForm
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState<BusinessForm>(initial)
  const [pending, startTransition] = useTransition()
  const canManageBusiness = session.isOwner

  const [tab, setTab] = useState<SettingsTab>(() =>
    resolveSettingsTab(searchParams.get('tab'), canManageBusiness),
  )

  useEffect(() => {
    const fromUrl = searchParams.get('tab')
    if (isSettingsTab(fromUrl)) {
      const next = resolveSettingsTab(fromUrl, canManageBusiness)
      setTab(next)
      writeUiPreference(UI_PREF_KEYS.settingsTab, next)
      if (next !== fromUrl) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', next)
        router.replace(`/dashboard/ayarlar?${params.toString()}`, { scroll: false })
      }
      return
    }
    const saved = readUiPreference<string>(UI_PREF_KEYS.settingsTab)
    setTab(resolveSettingsTab(saved, canManageBusiness))
  }, [canManageBusiness, router, searchParams])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!session.isOwner) {
      toast.error('Bu ayarları yalnızca işletme sahibi düzenleyebilir')
      return
    }
    startTransition(async () => {
      const result = await updateBusinessSettings(form)
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Ayarlar güncellendi')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Ayarlar</h1>
        <p className="text-sm text-muted-foreground">
          {canManageBusiness
            ? 'Önce hesap ve temel işletme; marka ve lokalizasyon ayrı sekmede.'
            : 'Hesap bilgilerinizi görüntüleyin. İşletme ayarlarını yalnızca sahip düzenleyebilir.'}
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (!isSettingsTab(value)) return
          setTab(value)
          writeUiPreference(UI_PREF_KEYS.settingsTab, value)
          const params = new URLSearchParams(searchParams.toString())
          params.set('tab', value)
          router.replace(`/dashboard/ayarlar?${params.toString()}`, { scroll: false })
        }}
        className="space-y-4"
      >
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          <TabsTrigger value="hesap" className="rounded-full border px-4 data-[state=active]:border-brand-teal data-[state=active]:bg-brand-teal data-[state=active]:text-white">
            Hesap
          </TabsTrigger>
          {canManageBusiness && (
            <>
              <TabsTrigger value="isletme" className="rounded-full border px-4 data-[state=active]:border-brand-teal data-[state=active]:bg-brand-teal data-[state=active]:text-white">
                İşletme
              </TabsTrigger>
              <TabsTrigger value="randevu" className="rounded-full border px-4 data-[state=active]:border-brand-teal data-[state=active]:bg-brand-teal data-[state=active]:text-white">
                Randevu
              </TabsTrigger>
              <TabsTrigger value="marka" className="rounded-full border px-4 data-[state=active]:border-brand-teal data-[state=active]:bg-brand-teal data-[state=active]:text-white">
                Marka & dil
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="hesap">
          <Card>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Ad Soyad">
                <Input value={session.fullName} disabled />
              </Field>
              <Field label="E-posta">
                <Input value={session.email} disabled />
              </Field>
              <Field label="Rol">
                <div className="flex items-center gap-2">
                  <Badge className="bg-brand-navy text-white">{ROLE_LABELS[session.role]}</Badge>
                  {session.isOwner && <Badge variant="secondary" className="bg-brand-teal/10 text-brand-teal">Sahip</Badge>}
                </div>
              </Field>
              <Field label="Aktif İşletme">
                <Input value={session.businessName} disabled />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="isletme">
          <Card>
            <CardContent className="p-5">
              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <Field label="İşletme Adı *">
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!session.isOwner} />
                </Field>
                <Field label="Telefon">
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={!session.isOwner} />
                </Field>
                <Field label="E-posta">
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!session.isOwner} />
                </Field>
                <Field label="Şehir">
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} disabled={!session.isOwner} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Adres">
                    <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} disabled={!session.isOwner} />
                  </Field>
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit" disabled={pending || !session.isOwner} className="bg-brand-teal hover:bg-brand-teal-hover text-white">
                    {pending ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="randevu">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="rounded-xl border border-border/70 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">Mobil / web randevularını otomatik onayla</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Açıkken hasta talepleri doğrudan onaylanır. Kapalıyken klinik onayı gerekir.
                    </p>
                  </div>
                  <Switch
                    checked={form.autoConfirmClientAppointments}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, autoConfirmClientAppointments: checked })
                    }
                    disabled={!session.isOwner}
                    aria-label="Otomatik randevu onayı"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={pending || !session.isOwner}
                  className="bg-brand-teal hover:bg-brand-teal-hover text-white"
                  onClick={() => {
                    if (!session.isOwner) {
                      toast.error('Bu ayarları yalnızca işletme sahibi düzenleyebilir')
                      return
                    }
                    startTransition(async () => {
                      const result = await updateBusinessSettings({
                        autoConfirmClientAppointments: form.autoConfirmClientAppointments,
                      })
                      if (!result.ok) { toast.error(result.error); return }
                      toast.success('Randevu ayarı güncellendi')
                      router.refresh()
                    })
                  }}
                >
                  {pending ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marka">
          <Card>
            <CardContent className="p-5">
              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <Field label="Logo URL">
                  <Input
                    type="url"
                    value={form.logoUrl}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    placeholder="https://..."
                    disabled={!session.isOwner}
                  />
                </Field>
                <Field label="Marka Rengi">
                  <Input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} disabled={!session.isOwner} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Açıklama">
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} disabled={!session.isOwner} />
                  </Field>
                </div>
                <Field label="Para Birimi">
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v as BusinessForm['currency'] })} disabled={!session.isOwner}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">TRY</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Zaman Dilimi">
                  <Select value={form.timezone} onValueChange={(v) => setForm({ ...form, timezone: v })} disabled={!session.isOwner}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Istanbul">Europe/Istanbul</SelectItem>
                      <SelectItem value="Europe/Bucharest">Europe/Bucharest</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit" disabled={pending || !session.isOwner} className="bg-brand-teal hover:bg-brand-teal-hover text-white">
                    {pending ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <AccessibleField label={label} labelClassName="text-xs text-muted-foreground mb-1.5 block">
      {children}
    </AccessibleField>
  )
}
