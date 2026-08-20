'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Plus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ROLE_DEFAULT_PERMISSIONS, ROLE_LABELS, type Permission } from '@/lib/rbac'
import {
  setTeamMemberActive,
  updateRolePermissions,
  updateTeamMember,
} from '@/lib/actions/team'
import type {
  AccessPermission,
  Member,
  Role,
  RoleId,
  TeamBoardProps,
  UserPermission,
} from './team-board-types'
import { PERMISSION_CATALOG, ROLE_DESCRIPTIONS, isCriticalPermission, memberPermissions } from './team-board-utils'
import { TeamMembersSection } from './team-members-section'
import { SummaryCard, TeamAdvancedSection } from './team-advanced-section'
import { AddUserDialog, PermissionDrawer, ResetPasswordDialog } from './team-board-dialogs'
import { TeamMembershipBanner } from './team-membership-banner'
import { TeamDeactivateDialog } from './team-deactivate-dialog'

export type { Role, AccessPermission, UserPermission }

export function TeamBoard({
  members,
  canManage,
  currentUserId,
  membership,
}: TeamBoardProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleId | 'ALL'>('ALL')
  const [addOpen, setAddOpen] = useState(false)
  const [passwordDialog, setPasswordDialog] = useState<{ open: boolean; member?: Member }>({ open: false })
  const [deactivateDialog, setDeactivateDialog] = useState<{ open: boolean; member?: Member }>({ open: false })
  const [drawerMember, setDrawerMember] = useState<Member | null>(null)
  const [drawerPermissions, setDrawerPermissions] = useState<Permission[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [roleDrafts, setRoleDrafts] = useState<Record<RoleId, Permission[]>>(() => ({
    ISLETME_SAHIBI: ROLE_DEFAULT_PERMISSIONS.ISLETME_SAHIBI,
    DOKTOR: ROLE_DEFAULT_PERMISSIONS.DOKTOR,
    SEKRETER: ROLE_DEFAULT_PERMISSIONS.SEKRETER,
    PERSONEL: ROLE_DEFAULT_PERMISSIONS.PERSONEL,
    OZEL: [],
  }))

  const roleCards = useMemo<Role[]>(() => {
    const customCount = members.filter((member) => {
      const defaults = new Set(ROLE_DEFAULT_PERMISSIONS[member.role] ?? [])
      const explicit = new Set(member.permissions)
      return (
        member.permissions.length > 0 &&
        (explicit.size !== defaults.size || [...explicit].some((p) => !defaults.has(p as Permission)))
      )
    }).length

    const roles: Role[] = [
      { id: 'ISLETME_SAHIBI', name: 'İşletme Sahibi', description: ROLE_DESCRIPTIONS.ISLETME_SAHIBI, permissions: roleDrafts.ISLETME_SAHIBI },
      { id: 'DOKTOR', name: 'Doktor', description: ROLE_DESCRIPTIONS.DOKTOR, permissions: roleDrafts.DOKTOR },
      { id: 'SEKRETER', name: 'Sekreter', description: ROLE_DESCRIPTIONS.SEKRETER, permissions: roleDrafts.SEKRETER },
      { id: 'PERSONEL', name: 'Personel', description: ROLE_DESCRIPTIONS.PERSONEL, permissions: roleDrafts.PERSONEL },
      { id: 'OZEL', name: 'Özel Rol', description: ROLE_DESCRIPTIONS.OZEL, permissions: [] },
    ]

    return roles.map((role) => ({
      ...role,
      description:
        role.id === 'OZEL' && customCount === 0 ? 'Henüz özel yetki seti atanmış kullanıcı yok.' : role.description,
    }))
  }, [members, roleDrafts])

  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return members.filter((member) => {
      const matchesQuery =
        !normalized ||
        member.fullName.toLowerCase().includes(normalized) ||
        member.email.toLowerCase().includes(normalized)
      const matchesRole = roleFilter === 'ALL' || member.role === roleFilter
      return matchesQuery && matchesRole
    })
  }, [members, query, roleFilter])

  const criticalPermissionCount = PERMISSION_CATALOG.filter((permission) => permission.critical).length
  const activeMembers = members.filter((member) => member.isActive).length
  const customMembers = members.filter((member) => member.permissions.length > 0).length
  const effectiveActiveMembers = membership?.activeMembers ?? activeMembers
  const reachedUserLimit =
    membership?.userLimit !== null && membership ? effectiveActiveMembers >= membership.userLimit : false

  function openPermissionDrawer(member: Member) {
    setDrawerMember(member)
    setDrawerPermissions(memberPermissions(member))
  }

  function toggleDrawerPermission(permission: Permission) {
    if (!drawerMember) return
    if (drawerMember.role === 'ISLETME_SAHIBI') {
      toast.info('İşletme sahibi tüm yetkilere sahiptir.')
      return
    }
    if (isCriticalPermission(permission)) {
      toast.warning('Kritik yetki değiştiriyorsunuz', {
        description: 'Bu değişiklik hassas verilere veya yönetim işlemlerine erişimi etkileyebilir.',
      })
    }
    setDrawerPermissions((current) =>
      current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]
    )
  }

  function saveDrawerPermissions() {
    if (!drawerMember) return
    startTransition(async () => {
      const result = await updateTeamMember({ id: drawerMember.id, permissions: drawerPermissions })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Kullanıcı yetkileri güncellendi')
      setDrawerMember(null)
      router.refresh()
    })
  }

  function resetDrawerToRole() {
    if (!drawerMember) return
    setDrawerPermissions(ROLE_DEFAULT_PERMISSIONS[drawerMember.role] ?? [])
    toast.info('Varsayılan rol yetkileri yüklendi')
  }

  function toggleRolePermission(role: RoleId, permission: Permission) {
    if (role === 'ISLETME_SAHIBI' || role === 'OZEL') return
    if (isCriticalPermission(permission)) {
      toast.warning('Kritik rol yetkisi değiştiriliyor')
    }
    setRoleDrafts((current) => {
      const existing = current[role]
      return {
        ...current,
        [role]: existing.includes(permission)
          ? existing.filter((item) => item !== permission)
          : [...existing, permission],
      }
    })
  }

  function saveRole(role: RoleId) {
    if (role === 'ISLETME_SAHIBI' || role === 'OZEL') return
    startTransition(async () => {
      const result = await updateRolePermissions({ role, permissions: roleDrafts[role] })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Rol yetkileri kaydedildi', {
        description: `${result.data.updated} kullanıcı güncellendi.`,
      })
      router.refresh()
    })
  }

  function changeMemberRole(member: Member, role: keyof typeof ROLE_LABELS) {
    const permissions = ROLE_DEFAULT_PERMISSIONS[role] ?? []
    startTransition(async () => {
      const result = await updateTeamMember({ id: member.id, role, permissions })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Rol güncellendi')
      router.refresh()
    })
  }

  function confirmDeactivate() {
    const member = deactivateDialog.member
    if (!member) return
    startTransition(async () => {
      const result = await setTeamMemberActive({ id: member.id, isActive: !member.isActive })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(member.isActive ? 'Erişim durduruldu' : 'Erişim yeniden açıldı')
      setDeactivateDialog({ open: false })
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-teal/25 bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
            <Users className="h-3.5 w-3.5" />
            Takım yönetimi
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-brand-ink lg:text-3xl">Takım</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Üyeleri görüntüleyin, davet edin ve rollerini yönetin. Rol yetki matrisi Gelişmiş altında.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          disabled={!canManage || reachedUserLimit}
          className="h-11 bg-brand-teal px-5 text-white shadow-lg shadow-teal-500/20 hover:bg-brand-teal-hover"
        >
          <Plus className="mr-2 h-4 w-4" /> Üye davet et
        </Button>
      </section>

      {membership && (
        <TeamMembershipBanner
          membership={membership}
          effectiveActiveMembers={effectiveActiveMembers}
          reachedUserLimit={reachedUserLimit}
        />
      )}

      <section className="grid gap-3 sm:grid-cols-2">
        <SummaryCard icon={<Users />} label="Toplam Üye" value={members.length} detail={`${activeMembers} aktif`} />
        <SummaryCard
          icon={<CheckCircle2 />}
          label="Aktif Üye"
          value={activeMembers}
          detail={`${members.length - activeMembers} erişimi durdurulmuş`}
        />
      </section>

      <TeamMembersSection
        filteredMembers={filteredMembers}
        canManage={canManage}
        currentUserId={currentUserId}
        query={query}
        onQueryChange={setQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        onChangeMemberRole={changeMemberRole}
        onOpenPermissionDrawer={openPermissionDrawer}
        onOpenPasswordDialog={(member) => setPasswordDialog({ open: true, member })}
        onOpenDeactivateDialog={(member) => setDeactivateDialog({ open: true, member })}
      />

      {canManage && (
        <TeamAdvancedSection
          showAdvanced={showAdvanced}
          onToggleAdvanced={() => setShowAdvanced((v) => !v)}
          roleCards={roleCards}
          members={members}
          customMembers={customMembers}
          criticalPermissionCount={criticalPermissionCount}
          roleDrafts={roleDrafts}
          pending={pending}
          onToggleRolePermission={toggleRolePermission}
          onSaveRole={saveRole}
        />
      )}

      <AddUserDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        pending={pending}
        startTransition={startTransition}
        limitReached={reachedUserLimit}
        membership={membership}
      />
      <ResetPasswordDialog
        open={passwordDialog.open}
        member={passwordDialog.member}
        onClose={() => setPasswordDialog({ open: false })}
      />
      <PermissionDrawer
        member={drawerMember}
        permissions={drawerPermissions}
        pending={pending}
        onClose={() => setDrawerMember(null)}
        onToggle={toggleDrawerPermission}
        onSave={saveDrawerPermissions}
        onReset={resetDrawerToRole}
      />
      <TeamDeactivateDialog
        open={deactivateDialog.open}
        member={deactivateDialog.member}
        onOpenChange={(open) => !open && setDeactivateDialog({ open: false })}
        onConfirm={confirmDeactivate}
      />
    </div>
  )
}
