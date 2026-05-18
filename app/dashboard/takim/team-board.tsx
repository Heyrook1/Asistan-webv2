'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Pencil, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { ROLE_LABELS, PERMISSIONS, type Permission } from '@/lib/rbac'
import { EmptyState } from '@/components/dashboard/empty-state'
import { createTeamMember, deleteTeamMember, setTeamMemberActive, updateTeamMember } from '@/lib/actions/team'

type Member = {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: keyof typeof ROLE_LABELS
  permissions: string[]
  color: string
  isActive: boolean
  lastSeenAt: string | null
  userId: string | null
}

const PERMISSION_LABELS: Record<Permission, string> = {
  'patient.view': 'Hasta görüntüle',
  'patient.edit': 'Hasta düzenle',
  'appointment.manage': 'Randevu yönet',
  'team.manage': 'Takım yönet',
  'analytics.view': 'Analitik görüntüle',
  'file.view': 'Dosya görüntüle',
  'medical_note.view': 'Tıbbi not görüntüle',
  'service.manage': 'Hizmet yönet',
}

export function TeamBoard({
  members,
  canManage,
  currentUserId,
}: {
  members: Member[]
  canManage: boolean
  currentUserId: string
}) {
  const router = useRouter()
  const [dialog, setDialog] = useState<{ open: boolean; initial?: Member }>({ open: false })
  const [pending, startTransition] = useTransition()

  function toggleActive(m: Member) {
    startTransition(async () => {
      const result = await setTeamMemberActive({ id: m.id, isActive: !m.isActive })
      if (!result.ok) { toast.error(result.error); return }
      toast.success(m.isActive ? 'Üye pasifleştirildi' : 'Üye aktifleştirildi')
      router.refresh()
    })
  }

  function remove(m: Member) {
    if (m.userId === currentUserId) {
      toast.error('Kendinizi silemezsiniz')
      return
    }
    if (!confirm(`${m.fullName} adlı üyeyi silmek istediğinize emin misiniz?`)) return
    startTransition(async () => {
      const result = await deleteTeamMember({ id: m.id })
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Üye silindi')
      router.refresh()
    })
  }

  function togglePermission(m: Member, perm: Permission) {
    const next = m.permissions.includes(perm) ? m.permissions.filter((p) => p !== perm) : [...m.permissions, perm]
    startTransition(async () => {
      const result = await updateTeamMember({ id: m.id, permissions: next as Permission[] })
      if (!result.ok) { toast.error(result.error); return }
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D36]">Takım</h1>
          <p className="text-sm text-muted-foreground">
            {members.length} üye • {members.filter((m) => m.isActive).length} aktif
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setDialog({ open: true })} className="bg-[#12C8AD] hover:bg-[#10b49c] text-white">
            <Plus className="mr-2 h-4 w-4" /> Takım Üyesi Ekle
          </Button>
        )}
      </div>

      {members.length === 0 ? (
        <EmptyState title="Henüz ekip üyesi yok" description="İlk ekip üyesini ekleyin ve yetkilendirin." />
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <Card key={m.id} className={m.isActive ? '' : 'opacity-70'}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold"
                      style={{ background: m.color }}
                    >
                      {m.fullName.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#0C1D36] truncate">{m.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.email}{m.phone ? ` • ${m.phone}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-[#06142A] text-white">{ROLE_LABELS[m.role]}</Badge>
                    {canManage && (
                      <>
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Switch checked={m.isActive} onCheckedChange={() => toggleActive(m)} disabled={pending} />
                          {m.isActive ? 'Aktif' : 'Pasif'}
                        </label>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDialog({ open: true, initial: m })}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-rose-600"
                          onClick={() => remove(m)}
                          disabled={m.userId === currentUserId}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {PERMISSIONS.map((p) => {
                    const active = m.permissions.includes(p)
                    return (
                      <button
                        key={p}
                        type="button"
                        disabled={!canManage || pending}
                        onClick={() => togglePermission(m, p)}
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-colors ${
                          active
                            ? 'border-[#12C8AD] bg-[#12C8AD]/10 text-[#0b7f6f]'
                            : 'bg-white text-muted-foreground hover:border-[#12C8AD]/40'
                        }`}
                      >
                        {active && <ShieldCheck className="h-3 w-3" />} {PERMISSION_LABELS[p]}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MemberDialog open={dialog.open} initial={dialog.initial} onClose={() => setDialog({ open: false })} />
    </div>
  )
}

function MemberDialog({ open, initial, onClose }: { open: boolean; initial?: Member; onClose: () => void }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({
    fullName: initial?.fullName ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    role: (initial?.role ?? 'PERSONEL') as keyof typeof ROLE_LABELS,
    color: initial?.color ?? '#16A9E8',
  })

  useEffect(() => {
    setForm({
      fullName: initial?.fullName ?? '',
      email: initial?.email ?? '',
      phone: initial?.phone ?? '',
      role: (initial?.role ?? 'PERSONEL') as keyof typeof ROLE_LABELS,
      color: initial?.color ?? '#16A9E8',
    })
  }, [initial, open])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
        color: form.color,
      }
      const result = initial ? await updateTeamMember({ id: initial.id, ...payload }) : await createTeamMember(payload)
      if (!result.ok) { toast.error(result.error); return }
      toast.success(initial ? 'Üye güncellendi' : 'Üye eklendi')
      onClose()
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Üyeyi Düzenle' : 'Yeni Takım Üyesi'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Ad Soyad *</Label>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">E-posta *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Telefon</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Rol *</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as keyof typeof ROLE_LABELS })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Renk</Label>
              <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
            <Button type="submit" disabled={pending} className="bg-[#12C8AD] hover:bg-[#10b49c] text-white">
              {pending ? 'Kaydediliyor...' : initial ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
