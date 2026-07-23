'use client'

import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/rbac'
import type { Member, RoleId } from './team-board-types'
import { formatLastSeen, initials, isCriticalPermission, memberPermissions } from './team-board-utils'

type TeamMembersSectionProps = {
  filteredMembers: Member[]
  canManage: boolean
  currentUserId: string
  query: string
  onQueryChange: (value: string) => void
  roleFilter: RoleId | 'ALL'
  onRoleFilterChange: (value: RoleId | 'ALL') => void
  onChangeMemberRole: (member: Member, role: keyof typeof ROLE_LABELS) => void
  onOpenPermissionDrawer: (member: Member) => void
  onOpenPasswordDialog: (member: Member) => void
  onOpenDeactivateDialog: (member: Member) => void
}

export function TeamMembersSection({
  filteredMembers,
  canManage,
  currentUserId,
  query,
  onQueryChange,
  roleFilter,
  onRoleFilterChange,
  onChangeMemberRole,
  onOpenPermissionDrawer,
  onOpenPasswordDialog,
  onOpenDeactivateDialog,
}: TeamMembersSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-brand-ink">Üyeler</h2>
          <p className="text-sm text-muted-foreground">Rol atayın, erişimi açıp kapatın veya üye bazlı yetki düzenleyin.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Üye ara..."
              className="h-10 w-full pl-9 sm:w-72"
            />
          </div>
          <Select value={roleFilter} onValueChange={(value) => onRoleFilterChange(value as RoleId | 'ALL')}>
            <SelectTrigger className="h-10 sm:w-48">
              <SelectValue placeholder="Rol filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tüm roller</SelectItem>
              <SelectItem value="ISLETME_SAHIBI">İşletme Sahibi</SelectItem>
              <SelectItem value="DOKTOR">Doktor</SelectItem>
              <SelectItem value="SEKRETER">Sekreter</SelectItem>
              <SelectItem value="PERSONEL">Personel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Users className="h-6 w-6" />
              </div>
              <p className="font-semibold text-brand-ink">Kullanıcı bulunamadı</p>
              <p className="mt-1 text-sm text-muted-foreground">Arama veya rol filtresini değiştirin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1060px] text-sm">
                <thead className="bg-dashboard-surface text-left">
                  <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Kullanıcı</th>
                    <th className="px-4 py-3 font-semibold">Rol</th>
                    <th className="px-4 py-3 font-semibold">E-posta</th>
                    <th className="px-4 py-3 font-semibold">Durum</th>
                    <th className="px-4 py-3 font-semibold">Son giriş</th>
                    <th className="px-4 py-3 font-semibold">Yetki seviyesi</th>
                    <th className="px-4 py-3 text-right font-semibold">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredMembers.map((member) => {
                    const permissions = memberPermissions(member)
                    const criticalCount = permissions.filter(isCriticalPermission).length
                    const isSelf = member.userId === currentUserId
                    return (
                      <tr key={member.id} className={cn(!member.isActive && 'bg-slate-50/70 text-muted-foreground')}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: member.color }}>
                              {initials(member.fullName)}
                            </span>
                            <div>
                              <p className="font-semibold text-brand-ink">{member.fullName}</p>
                              <p className="text-xs text-muted-foreground">{member.phone ?? 'Telefon yok'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={member.role}
                            disabled={!canManage || member.role === 'ISLETME_SAHIBI'}
                            onValueChange={(value) => onChangeMemberRole(member, value as keyof typeof ROLE_LABELS)}
                          >
                            <SelectTrigger className="h-9 w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DOKTOR">Doktor</SelectItem>
                              <SelectItem value="SEKRETER">Sekreter</SelectItem>
                              <SelectItem value="PERSONEL">Personel</SelectItem>
                              <SelectItem value="ISLETME_SAHIBI">İşletme Sahibi</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                        <td className="px-4 py-3">
                          <Badge className={member.isActive ? 'border-0 bg-emerald-100 text-emerald-700' : 'border-0 bg-slate-200 text-slate-700'}>
                            {member.isActive ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatLastSeen(member.lastSeenAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-brand-teal/10 px-2 py-1 text-xs font-semibold text-brand-teal">
                              {permissions.length} yetki
                            </span>
                            {criticalCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                                <AlertTriangle className="h-3.5 w-3.5" /> {criticalCount} kritik
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => onOpenPermissionDrawer(member)}>
                              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Yetkileri düzenle
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                              disabled={isSelf}
                              onClick={() => onOpenPasswordDialog(member)}
                              aria-label={`${member.fullName} için şifre sıfırla`}
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn('h-9 w-9', member.isActive && 'text-rose-600')}
                              disabled={isSelf}
                              onClick={() => onOpenDeactivateDialog(member)}
                              aria-label={member.isActive ? `${member.fullName} erişimini durdur` : `${member.fullName} erişimini aç`}
                            >
                              {member.isActive ? <X className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
