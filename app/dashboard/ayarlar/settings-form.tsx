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
import { MembershipPanel, type MembershipSnapshot } from '@/components/dashboard/membership-panel'
import type { MembershipPaymentView } from '@/lib/actions/membership-payment'
import {
  CalendarIntegrationPanel,
  type CalendarConnectionRow,
  type CalendarStaffRow,
} from '@/components/dashboard/calendar-integration-panel'
import { PublicBookingLinkCard } from '@/components/dashboard/public-booking-link-card'
import {
  PatientOutboundChannelsPanel,
  type PatientOutboundChannelFlags,
} from '@/components/dashboard/patient-outbound-channels-panel'
import {
  LocationsSettingsPanel,
  type LocationSettingsRow,
} from '@/components/dashboard/locations-settings-panel'
import {
  canManageClinicSettings,
  isSettingsTab,
  resolveSettingsTab,
  type SettingsTab,
} from '@/lib/settings/tabs'

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
  requireGuestIdentity: boolean
  depositEnabled: boolean
  depositAmount: string
  noShowFeeEnabled: boolean
  noShowFeeAmount: string
  noShowFeeNote: string
  invoiceEnabled: boolean
  taxVkn: string
  taxOffice: string
  invoiceTitle: string
  invoiceAddress: string
  whatsappAgentEnabled: boolean
}

export function SettingsForm({
  session,
  initial,
  membership,
  pendingPayment = null,
  selfServeEnabled = true,
  calendar,
  bookingSlug,
  patientChannels,
  patientChannelDelivery = null,
  locations = [],
}: {
  session: SessionContext
  initial: BusinessForm
  membership: MembershipSnapshot | null
  pendingPayment?: MembershipPaymentView | null
  selfServeEnabled?: boolean
  calendar: {
    enabled: boolean
    configured: boolean
    canManageTeam: boolean
    staff: CalendarStaffRow[]
    connections: CalendarConnectionRow[]
  }
  bookingSlug: string
  patientChannels: PatientOutboundChannelFlags
  patientChannelDelivery?: import('@/lib/notifications/channel-delivery-store').BusinessChannelDeliveryStats | null
  locations?: LocationSettingsRow[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState<BusinessForm>(initial)
  const [pending, startTransition] = useTransition()
  const canManageBusiness = canManageClinicSettings(session)

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
    // No tab in URL: keep preference only when URL did not ask for a tab.
    const saved = readUiPreference<string>(UI_PREF_KEYS.settingsTab)
    const next = resolveSettingsTab(saved, canManageBusiness)
    setTab(next)
    const params = new URLSearchParams(searchParams.toString())
    if (params.get('tab') !== next) {
      params.set('tab', next)
      router.replace(`/dashboard/ayarlar?${params.toString()}`, { scroll: false })
    }
  }, [canManageBusiness, router, searchParams])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canManageBusiness) {
      toast.error('Bu ayarları yalnızca işletme yöneticisi düzenleyebilir')
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
              <TabsTrigger value="fatura" className="rounded-full border px-4 data-[state=active]:border-brand-teal data-[state=active]:bg-brand-teal data-[state=active]:text-white">
                Fatura
              </TabsTrigger>
              <TabsTrigger value="marka" className="rounded-full border px-4 data-[state=active]:border-brand-teal data-[state=active]:bg-brand-teal data-[state=active]:text-white">
                Marka & dil
              </TabsTrigger>
              <TabsTrigger value="entegrasyonlar" className="rounded-full border px-4 data-[state=active]:border-brand-teal data-[state=active]:bg-brand-teal data-[state=active]:text-white">
                Entegrasyonlar
              </TabsTrigger>
              <TabsTrigger value="abonelik" className="rounded-full border px-4 data-[state=active]:border-brand-teal data-[state=active]:bg-brand-teal data-[state=active]:text-white">
                Abonelik
              </TabsTrigger>
            </>
          )}
          {!canManageBusiness && (
            <TabsTrigger value="entegrasyonlar" className="rounded-full border px-4 data-[state=active]:border-brand-teal data-[state=active]:bg-brand-teal data-[state=active]:text-white">
              Entegrasyonlar
            </TabsTrigger>
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
            <CardContent className="space-y-4 p-5">
              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <Field label="İşletme Adı *">
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!canManageBusiness} />
                </Field>
                <Field label="Telefon">
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={!canManageBusiness} />
                </Field>
                <Field label="E-posta">
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!canManageBusiness} />
                </Field>
                <Field label="Şehir">
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} disabled={!canManageBusiness} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Adres">
                    <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} disabled={!canManageBusiness} />
                  </Field>
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit" disabled={pending || !canManageBusiness} className="bg-brand-teal hover:bg-brand-teal-hover text-white">
                    {pending ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </form>

              <LocationsSettingsPanel
                locations={locations}
                canManage={canManageBusiness}
                businessDefaults={{
                  name: form.name,
                  address: form.address,
                  city: form.city,
                  phone: form.phone,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="randevu">
          <Card>
            <CardContent className="space-y-4 p-5">
              <PublicBookingLinkCard slug={bookingSlug} clinicName={form.name || session.businessName} />
              <div className="rounded-xl border border-border/70 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">Mobil / web randevularını otomatik onayla</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Kapalı (önerilen): hasta “Randevu talebi gönder” der; kayıt Onay bekliyor kalır, klinik onayından
                      sonra kesinleşir — çakışma riski düşer. Açık: talep anında onaylanır.
                    </p>
                  </div>
                  <Switch
                    checked={form.autoConfirmClientAppointments}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, autoConfirmClientAppointments: checked })
                    }
                    disabled={!canManageBusiness}
                    aria-label="Otomatik randevu onayı"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">
                      Genel linkte kimlik / pasaport zorunlu
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Kapalı (önerilen, veri minimizasyonu): ad + telefon yeter. Açık: hasta KKTC, TC veya pasaport
                      numarası girer; platformda yalnızca tek yönlü hash tutulur, hasta kartına düz metin yazılmaz.
                      Zorunlu tuttuğunuzda formda neden gerekli olduğu açıklanır.
                    </p>
                  </div>
                  <Switch
                    checked={form.requireGuestIdentity}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, requireGuestIdentity: checked })
                    }
                    disabled={!canManageBusiness}
                    aria-label="Genel linkte kimlik zorunluluğu"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-slate-50/70 p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">Genel linkte depozito iste</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Randevu oluşunca hasta için depozito kaydı açılır (Stripe bağlıysa PaymentIntent; değilse manuel talimat).
                      Randevu soft-fail — ödeme başarısız olsa bile rezervasyon kalır.
                    </p>
                  </div>
                  <Switch
                    checked={form.depositEnabled}
                    onCheckedChange={(checked) => setForm({ ...form, depositEnabled: checked })}
                    disabled={!canManageBusiness}
                    aria-label="Depozito zorunluluğu"
                  />
                </div>
                {form.depositEnabled && (
                  <Field label={`Depozito tutarı (${form.currency})`}>
                    <Input
                      type="number"
                      min={0}
                      step="1"
                      value={form.depositAmount}
                      onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
                      disabled={!canManageBusiness}
                      inputMode="decimal"
                    />
                  </Field>
                )}
              </div>

              <div className="rounded-xl border border-border/70 bg-slate-50/70 p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">Gelinmedi ücreti politikası</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Hastaya genel linkte gösterilir. Tahsilat sonra da olabilir — MVP politikayı kaydeder ve
                      gelinmedi durumunda funnel’a yazar.
                    </p>
                  </div>
                  <Switch
                    checked={form.noShowFeeEnabled}
                    onCheckedChange={(checked) => setForm({ ...form, noShowFeeEnabled: checked })}
                    disabled={!canManageBusiness}
                    aria-label="Gelinmedi ücreti politikası"
                  />
                </div>
                {form.noShowFeeEnabled && (
                  <>
                    <Field label={`Gelinmedi ücreti (${form.currency})`}>
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        value={form.noShowFeeAmount}
                        onChange={(e) => setForm({ ...form, noShowFeeAmount: e.target.value })}
                        disabled={!canManageBusiness}
                        inputMode="decimal"
                      />
                    </Field>
                    <Field label="Politika notu (hastaya görünür)">
                      <Textarea
                        rows={2}
                        value={form.noShowFeeNote}
                        onChange={(e) => setForm({ ...form, noShowFeeNote: e.target.value })}
                        disabled={!canManageBusiness}
                        placeholder="Örn. Gelinmezse depozito iade edilmez / ücret klinik politikasına göre alınır."
                      />
                    </Field>
                  </>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={pending || !canManageBusiness}
                  className="bg-brand-teal hover:bg-brand-teal-hover text-white"
                  onClick={() => {
                    if (!canManageBusiness) {
                      toast.error('Bu ayarları yalnızca işletme sahibi düzenleyebilir')
                      return
                    }
                    startTransition(async () => {
                      const result = await updateBusinessSettings({
                        autoConfirmClientAppointments: form.autoConfirmClientAppointments,
                        requireGuestIdentity: form.requireGuestIdentity,
                        depositEnabled: form.depositEnabled,
                        depositAmount: form.depositEnabled
                          ? form.depositAmount === ''
                            ? null
                            : Number(form.depositAmount)
                          : null,
                        noShowFeeEnabled: form.noShowFeeEnabled,
                        noShowFeeAmount: form.noShowFeeEnabled
                          ? form.noShowFeeAmount === ''
                            ? null
                            : Number(form.noShowFeeAmount)
                          : null,
                        noShowFeeNote: form.noShowFeeEnabled ? form.noShowFeeNote || null : null,
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

        <TabsContent value="fatura">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="rounded-xl border border-border/70 bg-slate-50/70 p-4 text-xs leading-5 text-muted-foreground">
                KKTC Maliye e-Fatura taslakları için vergi profili. Türkiye GİB e-SMM / e-Fatura gönderimi yoktur.
                Maliye’ye elektronik gönderim Asistan destek ekibi tarafından açılır; açık değilse belgeleri
                yazdırabilirsiniz.
              </div>
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-slate-50/70 p-4">
                <div>
                  <p className="text-sm font-semibold text-brand-ink">Fatura taslaklarını aç</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Açıkken tamamlanan randevudan Faturalar sayfasında taslak üretilebilir.
                  </p>
                </div>
                <Switch
                  checked={form.invoiceEnabled}
                  onCheckedChange={(checked) => setForm({ ...form, invoiceEnabled: checked })}
                  disabled={!canManageBusiness}
                  aria-label="Fatura özelliğini aç"
                />
              </div>
              {form.invoiceEnabled && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Fatura ünvanı">
                    <Input
                      value={form.invoiceTitle}
                      onChange={(e) => setForm({ ...form, invoiceTitle: e.target.value })}
                      placeholder={form.name || 'İşletme ünvanı'}
                      disabled={!canManageBusiness}
                    />
                  </Field>
                  <Field label="Vergi no (VKN)">
                    <Input
                      value={form.taxVkn}
                      onChange={(e) => setForm({ ...form, taxVkn: e.target.value })}
                      placeholder="KKTC vergi kimlik no"
                      disabled={!canManageBusiness}
                    />
                  </Field>
                  <Field label="Vergi dairesi">
                    <Input
                      value={form.taxOffice}
                      onChange={(e) => setForm({ ...form, taxOffice: e.target.value })}
                      disabled={!canManageBusiness}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Fatura adresi">
                      <Textarea
                        value={form.invoiceAddress}
                        onChange={(e) => setForm({ ...form, invoiceAddress: e.target.value })}
                        rows={2}
                        disabled={!canManageBusiness}
                      />
                    </Field>
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={pending || !canManageBusiness}
                  className="bg-brand-teal hover:bg-brand-teal-hover text-white"
                  onClick={() => {
                    if (!canManageBusiness) {
                      toast.error('Bu ayarları yalnızca işletme sahibi düzenleyebilir')
                      return
                    }
                    startTransition(async () => {
                      const result = await updateBusinessSettings({
                        invoiceEnabled: form.invoiceEnabled,
                        taxVkn: form.invoiceEnabled ? form.taxVkn || null : null,
                        taxOffice: form.invoiceEnabled ? form.taxOffice || null : null,
                        invoiceTitle: form.invoiceEnabled ? form.invoiceTitle || null : null,
                        invoiceAddress: form.invoiceEnabled ? form.invoiceAddress || null : null,
                      })
                      if (!result.ok) {
                        toast.error(result.error)
                        return
                      }
                      toast.success('Fatura ayarı güncellendi')
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
                    disabled={!canManageBusiness}
                  />
                </Field>
                <Field label="Marka Rengi">
                  <Input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} disabled={!canManageBusiness} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Açıklama">
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} disabled={!canManageBusiness} />
                  </Field>
                </div>
                <Field label="Para Birimi">
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v as BusinessForm['currency'] })} disabled={!canManageBusiness}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">TRY</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Zaman Dilimi">
                  <Select value={form.timezone} onValueChange={(v) => setForm({ ...form, timezone: v })} disabled={!canManageBusiness}>
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
                  <Button type="submit" disabled={pending || !canManageBusiness} className="bg-brand-teal hover:bg-brand-teal-hover text-white">
                    {pending ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entegrasyonlar">
          <CalendarIntegrationPanel
            enabled={calendar.enabled}
            configured={calendar.configured}
            canManageTeam={calendar.canManageTeam}
            selfStaffId={session.staffMemberId}
            staff={calendar.staff}
            connections={calendar.connections}
          />
          {canManageBusiness && (
            <Card className="mt-4">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">WhatsApp randevu asistanı</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Gelen WhatsApp mesajlarından müsait slot önerisi ve genel randevu linki sunar.
                      Yapay zeka iddiası değildir. Çalışması için WhatsApp bildirim kanalının bağlı
                      olması gerekir.
                    </p>
                    {!patientChannels.whatsapp ? (
                      <p className="mt-2 text-xs text-amber-900">
                        WhatsApp kanalı bağlı değil.{' '}
                        <a href="/contact" className="font-medium underline underline-offset-2">
                          WhatsApp&apos;ı bağla
                        </a>
                      </p>
                    ) : null}
                  </div>
                  <Switch
                    checked={form.whatsappAgentEnabled}
                    onCheckedChange={(checked) => setForm({ ...form, whatsappAgentEnabled: checked })}
                    aria-label="WhatsApp randevu asistanını aç"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    disabled={pending}
                    className="bg-brand-teal text-white hover:bg-brand-teal-hover"
                    onClick={() => {
                      startTransition(async () => {
                        const result = await updateBusinessSettings({
                          whatsappAgentEnabled: form.whatsappAgentEnabled,
                        })
                        if (!result.ok) {
                          toast.error(result.error)
                          return
                        }
                        toast.success('WhatsApp asistan ayarı güncellendi')
                        router.refresh()
                      })
                    }}
                  >
                    {pending ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <PatientOutboundChannelsPanel
            channels={patientChannels}
            delivery={patientChannelDelivery}
          />
        </TabsContent>

        <TabsContent value="abonelik">
          <MembershipPanel
            membership={membership}
            pendingPayment={pendingPayment}
            selfServeEnabled={selfServeEnabled}
            isOwner={canManageBusiness}
          />
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
