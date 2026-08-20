'use client'

import {
  AlertTriangle,
  ChevronDown,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  UserCog,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { ROLE_LABELS, type Permission } from '@/lib/rbac'
import type { Member, MatrixRoleId, PermissionGroup, Role, RoleId } from './team-board-types'
import { GROUPS, MANAGED_ROLES, PERMISSION_CATALOG, roleLevel } from './team-board-utils'

export function SummaryCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: number; detail: string }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex items-center gap-4 p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-teal/10 text-brand-teal [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </span>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-brand-ink">{value}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function PermissionMatrixGroup({
  group,
  roleDrafts,
  onToggle,
}: {
  group: PermissionGroup
  roleDrafts: Record<RoleId, Permission[]>
  onToggle: (role: MatrixRoleId, permission: Permission) => void
}) {
  const permissions = PERMISSION_CATALOG.filter((permission) => permission.group === group)
  return (
    <>
      <tr className="border-t bg-white">
        <td colSpan={5} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-brand-ink">
          {group}
        </td>
      </tr>
      {permissions.map((permission) => (
        <tr key={permission.key} className="border-t hover:bg-dashboard-surface">
          <td className="px-4 py-3">
            <div className="flex items-start gap-2">
              {permission.critical && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />}
              <div>
                <p className="font-semibold text-brand-ink">{permission.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{permission.description}</p>
              </div>
            </div>
          </td>
          {MANAGED_ROLES.map((role) => {
            const enabled = role === 'ISLETME_SAHIBI' || roleDrafts[role].includes(permission.key)
            return (
              <td key={role} className="px-4 py-3 text-center">
                <Switch
                  checked={enabled}
                  disabled={role === 'ISLETME_SAHIBI'}
                  onCheckedChange={() => onToggle(role, permission.key)}
                  aria-label={`${ROLE_LABELS[role]} ${permission.label}`}
                />
              </td>
            )
          })}
        </tr>
      ))}
    </>
  )
}

type TeamAdvancedSectionProps = {
  showAdvanced: boolean
  onToggleAdvanced: () => void
  roleCards: Role[]
  members: Member[]
  customMembers: number
  criticalPermissionCount: number
  roleDrafts: Record<RoleId, Permission[]>
  pending: boolean
  onToggleRolePermission: (role: RoleId, permission: Permission) => void
  onSaveRole: (role: RoleId) => void
}

export function TeamAdvancedSection({
  showAdvanced,
  onToggleAdvanced,
  roleCards,
  members,
  customMembers,
  criticalPermissionCount,
  roleDrafts,
  pending,
  onToggleRolePermission,
  onSaveRole,
}: TeamAdvancedSectionProps) {
  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={onToggleAdvanced}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:bg-slate-50"
        aria-expanded={showAdvanced}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-brand-ink">
            <SlidersHorizontal className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-brand-ink">Gelişmiş — rol yetkileri</p>
            <p className="text-sm text-muted-foreground">
              Rol kartları ve yetki matrisi. Çoğu klinik için varsayılan roller yeterlidir.
            </p>
          </div>
        </div>
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform', showAdvanced && 'rotate-180')} />
      </button>

      {showAdvanced && (
        <div className="space-y-6 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <section className="grid gap-3 sm:grid-cols-2">
            <SummaryCard icon={<UserCog />} label="Roller" value={5} detail={`${customMembers} özel yetki atanmış`} />
            <SummaryCard icon={<ShieldAlert />} label="Kritik Yetkiler" value={criticalPermissionCount} detail="Hassas veri ve yönetim işlemleri" />
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-bold text-brand-ink">Rol Yönetimi</h2>
              <p className="text-sm text-muted-foreground">Rollerin kapsamını, risk seviyesini ve kullanıcı dağılımını izleyin.</p>
            </div>
            <div className="grid gap-3 lg:grid-cols-5">
              {roleCards.map((role) => {
                const count = role.id === 'OZEL'
                  ? customMembers
                  : members.filter((member) => member.role === role.id).length
                return (
                  <Card key={role.id} className="border-border/70 bg-white shadow-sm">
                    <CardContent className="flex h-full flex-col gap-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
                          <Shield className="h-5 w-5" />
                        </span>
                        <Badge variant="outline" className="bg-white text-[10px]">{roleLevel(role.id)}</Badge>
                      </div>
                      <div className="min-h-[112px]">
                        <h3 className="font-bold text-brand-ink">{role.name}</h3>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{role.description}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between border-t pt-3">
                        <div>
                          <p className="text-lg font-bold text-brand-ink">{count}</p>
                          <p className="text-[11px] text-muted-foreground">kullanıcı</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={role.id === 'OZEL'}
                          onClick={() => document.getElementById('permission-matrix')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          Düzenle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          <section id="permission-matrix" className="space-y-3">
            <div>
              <h2 className="text-lg font-bold text-brand-ink">Yetki Matrisi</h2>
              <p className="text-sm text-muted-foreground">Rol bazlı erişim hiyerarşisini yönetin. İşletme sahibi yetkileri kilitlidir.</p>
            </div>
            <Card className="overflow-hidden border-border/70 bg-white shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-sm">
                    <thead className="bg-dashboard-surface text-left">
                      <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        <th className="w-[360px] px-4 py-3 font-semibold">Yetki</th>
                        {MANAGED_ROLES.map((role) => (
                          <th key={role} className="px-4 py-3 text-center font-semibold">{role === 'ISLETME_SAHIBI' ? 'İşletme Sahibi' : ROLE_LABELS[role]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {GROUPS.map((group) => (
                        <PermissionMatrixGroup
                          key={group}
                          group={group}
                          roleDrafts={roleDrafts}
                          onToggle={onToggleRolePermission}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap justify-end gap-2 border-t bg-white p-3">
                  {(['DOKTOR', 'SEKRETER', 'PERSONEL'] as MatrixRoleId[]).map((role) => (
                    <Button key={role} variant="outline" size="sm" disabled={pending} onClick={() => onSaveRole(role)}>
                      {ROLE_LABELS[role]} rolünü kaydet
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </section>
  )
}
