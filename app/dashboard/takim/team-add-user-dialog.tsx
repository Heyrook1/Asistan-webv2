'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROLE_LABELS } from '@/lib/rbac'
import { createTeamMember } from '@/lib/actions/team'
import type { MembershipSnapshot } from './team-board-types'
import { TEMPLATE_OPTIONS, permissionsByTemplate } from './team-board-utils'

export function AddUserDialog({
  open,
  onClose,
  pending,
  startTransition,
  limitReached,
  membership,
}: {
  open: boolean
  onClose: () => void
  pending: boolean
  startTransition: React.TransitionStartFunction
  limitReached: boolean
  membership: MembershipSnapshot | null
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: 'PERSONEL' as keyof typeof ROLE_LABELS,
    template: 'role-default',
    sendInvite: true,
    password: '',
  })

  function close() {
    setForm({ fullName: '', email: '', role: 'PERSONEL', template: 'role-default', sendInvite: true, password: '' })
    onClose()
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (limitReached) {
      toast.error('Paket kullanıcı limiti doldu. Yeni kullanıcı için Ayarlar → Abonelik’ten yükseltme talep edin.')
      return
    }
    startTransition(async () => {
      const result = await createTeamMember({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: form.role,
        permissions: permissionsByTemplate(form.template, form.role),
        sendInvite: form.sendInvite,
        password: form.password.trim() || undefined,
        color: '#16A9E8',
      })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Kullanıcı eklendi', {
        description: result.data.invitationSent
          ? 'Davet e-postası gönderildi.'
          : form.password
            ? 'Geçici şifre ile giriş yapabilir.'
            : 'Kullanıcı kaydı hazırlandı.',
      })
      close()
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && close()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Üye davet et</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          {limitReached && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {membership?.isDemo
                ? 'Demo hesap en fazla 1 aktif kullanıcıya izin verir.'
                : 'Bu paketin aktif kullanıcı limiti doldu. Ayarlar → Abonelik’ten yükseltme talep edin.'}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Ad Soyad *</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">E-posta *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Rol *</Label>
              <Select
                value={form.role}
                onValueChange={(role) => setForm({ ...form, role: role as keyof typeof ROLE_LABELS })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOKTOR">Doktor</SelectItem>
                  <SelectItem value="SEKRETER">Sekreter</SelectItem>
                  <SelectItem value="PERSONEL">Personel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Yetki şablonu *</Label>
              <Select value={form.template} onValueChange={(template) => setForm({ ...form, template })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_OPTIONS.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Geçici şifre</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={6}
              placeholder="Boş bırakılırsa davet veya sonradan kayıt akışı kullanılır"
              autoComplete="new-password"
            />
          </div>
          <label className="flex items-center justify-between rounded-xl border bg-dashboard-surface p-3 text-sm">
            <span>
              <span className="block font-medium text-brand-ink">Davet gönder</span>
              <span className="text-xs text-muted-foreground">
                Geçici şifre yoksa kullanıcıya şifre kurulum bağlantısı gönderilir.
              </span>
            </span>
            <Switch checked={form.sendInvite} onCheckedChange={(sendInvite) => setForm({ ...form, sendInvite })} />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={close}>
              İptal
            </Button>
            <Button
              type="submit"
              disabled={pending || limitReached}
              className="bg-brand-teal text-white hover:bg-brand-teal-hover"
            >
              {limitReached ? 'Paket limiti dolu' : pending ? 'Kaydediliyor...' : 'Kullanıcı ekle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
