'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { SessionContext } from '@/lib/rbac'
import { ROLE_LABELS } from '@/lib/rbac'
import { updateBusinessSettings } from '@/lib/actions/business'

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
}

export function SettingsForm({
  session,
  initial,
}: {
  session: SessionContext
  initial: BusinessForm
}) {
  const router = useRouter()
  const [form, setForm] = useState<BusinessForm>(initial)
  const [pending, startTransition] = useTransition()

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
        <h1 className="text-2xl font-bold text-[#0C1D36]">Ayarlar</h1>
        <p className="text-sm text-muted-foreground">İşletme ve hesap bilgilerinizi yönetin.</p>
      </div>

      <Card>
        <CardContent className="p-5 grid gap-4 sm:grid-cols-2">
          <Field label="Ad Soyad">
            <Input value={session.fullName} disabled />
          </Field>
          <Field label="E-posta">
            <Input value={session.email} disabled />
          </Field>
          <Field label="Rol">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#06142A] text-white">{ROLE_LABELS[session.role]}</Badge>
              {session.isOwner && <Badge variant="secondary" className="bg-[#12C8AD]/10 text-[#0b7f6f]">Sahip</Badge>}
            </div>
          </Field>
          <Field label="Aktif İşletme">
            <Input value={session.businessName} disabled />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-[#0C1D36] mb-4">İşletme Bilgileri</p>
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
              <Field label="Adres">
                <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} disabled={!session.isOwner} />
              </Field>
            </div>
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
              <Button type="submit" disabled={pending || !session.isOwner} className="bg-[#12C8AD] hover:bg-[#10b49c] text-white">
                {pending ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  )
}
