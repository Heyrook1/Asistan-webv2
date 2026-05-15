'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Capability, TeamMember } from '@/lib/types'

type TeamRole = 'Super Admin' | 'Isletme Sahibi' | 'Doktor' | 'Sekreter' | 'Personel'

type Member = TeamMember

const permOptions = [
  'view_appointments',
  'edit_appointments',
  'manage_customers',
  'access_analytics',
  'manage_team',
]

interface TeamManagementProps {
  providerId: string
  initialMembers: TeamMember[]
  initialLogs: string[]
}

export function TeamManagement({ providerId, initialMembers, initialLogs }: TeamManagementProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [form, setForm] = useState({ name: '', email: '', role: 'Personel' as TeamRole })
  const [logs, setLogs] = useState<string[]>(initialLogs)

  async function addMember() {
    const supabase = createClient()
    const permissions: Capability[] = form.role === 'Super Admin' ? [...permOptions as Capability[]] : ['view_appointments']
    const next: Member = {
      id: crypto.randomUUID(),
      provider_id: providerId,
      user_id: null,
      full_name: form.name,
      email: form.email,
      role: form.role,
      status: 'active',
      permissions,
      is_active: true,
      last_active_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('team_members').insert({
      provider_id: providerId,
      full_name: next.full_name,
      email: next.email,
      role: next.role,
      status: next.status,
      permissions: next.permissions,
      is_active: true,
    })
    if (error) {
      toast.error('Ekip uyesi eklenemedi')
      return
    }
    setMembers((p) => [next, ...p])
    const log = `${next.full_name} eklendi (${next.role})`
    setLogs((p) => [log, ...p])
    await supabase.from('activity_logs').insert({ provider_id: providerId, action: 'team_member_added', entity_type: 'team_members', entity_id: next.id, details: { message: log } })
    toast.success('Ekip uyesi eklendi')
    setForm({ name: '', email: '', role: 'Personel' })
  }

  async function toggleActive(id: string) {
    const supabase = createClient()
    setMembers((p) => p.map((m) => (m.id === id ? { ...m, is_active: !m.is_active, status: m.is_active ? 'inactive' : 'active' } : m)))
    const current = members.find((m) => m.id === id)
    const nextActive = !(current?.is_active ?? true)
    await supabase.from('team_members').update({ is_active: nextActive, status: nextActive ? 'active' : 'inactive' }).eq('id', id)
  }

  async function togglePermission(id: string, perm: string) {
    const supabase = createClient()
    let updatedPermissions: string[] = []
    setMembers((p) => p.map((m) => {
      if (m.id !== id) return m
      const exists = m.permissions.includes(perm)
      updatedPermissions = exists ? m.permissions.filter((x) => x !== perm) : [...m.permissions, perm]
      return { ...m, permissions: updatedPermissions as Capability[] }
    }))
    await supabase.from('team_members').update({ permissions: updatedPermissions }).eq('id', id)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0C1D36]">Takim Yonetimi</h1>
        <p className="text-sm text-muted-foreground">Rol, yetki ve erisim kontrollerini merkezi olarak yonetin.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Yeni Ekip Uyesi</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div><Label>Ad Soyad</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>E-posta</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div>
            <Label>Rol</Label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as TeamRole })} className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {['Super Admin', 'Isletme Sahibi', 'Doktor', 'Sekreter', 'Personel'].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-end"><Button onClick={addMember} className="w-full bg-[#12C8AD] text-white hover:bg-[#10b49c]">Ekle</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Uyeler ve Yetkiler</CardTitle></CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="font-medium">Takim henuz olusturulmadi</p>
              <p className="text-sm text-muted-foreground mt-1">Ilk ekip uyesini ekleyerek rol dagilimini baslatin.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((m) => (
                <div key={m.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{m.full_name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{m.role}</Badge>
                      <div className="flex items-center gap-2 text-xs"><span>Aktif</span><Switch checked={m.is_active} onCheckedChange={() => toggleActive(m.id)} /></div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {permOptions.map((perm) => {
                      const selected = m.permissions.includes(perm)
                      return (
                        <button key={perm} onClick={() => togglePermission(m.id, perm)} className={`rounded-full border px-3 py-1 text-xs ${selected ? 'bg-[#12C8AD] text-white border-[#12C8AD]' : 'bg-background'}`}>
                          {perm}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Aktivite Loglari</CardTitle></CardHeader>
        <CardContent>
          {logs.length === 0 ? <p className="text-sm text-muted-foreground">Henuz aktivite yok.</p> : (
            <div className="space-y-2">{logs.map((l, i) => <div key={`${l}-${i}`} className="rounded-lg bg-secondary/50 p-2 text-sm">{l}</div>)}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
