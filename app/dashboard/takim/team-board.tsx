'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  KeyRound,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { ROLE_DEFAULT_PERMISSIONS, ROLE_LABELS, type Permission } from '@/lib/rbac'
import {
  createTeamMember,
  resetTeamMemberPassword,
  setTeamMemberActive,
  updateRolePermissions,
  updateTeamMember,
} from '@/lib/actions/team'

type RoleId = 'ISLETME_SAHIBI' | 'DOKTOR' | 'SEKRETER' | 'PERSONEL' | 'OZEL'
type MatrixRoleId = Exclude<RoleId, 'OZEL'>

export type Role = {
  id: RoleId
  name: string
  description: string
  permissions: Permission[]
}

export type AccessPermission = {
  id: string
  key: Permission
  label: string
  group: PermissionGroup
  description: string
  critical: boolean
}

export type UserPermission = {
  userId: string
  permissionKey: Permission
  allowed: boolean
}

type PermissionGroup =
  | 'Hasta Yönetimi'
  | 'Randevu Yönetimi'
  | 'Dosya Yönetimi'
  | 'Takım Yönetimi'
  | 'Analitik'
  | 'Ayarlar'

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

type MembershipSnapshot = {
  planName: string
  isDemo: boolean
  userLimit: number | null
  activeMembers: number
  accessEndAt: string | null
}

const MANAGED_ROLES: MatrixRoleId[] = ['ISLETME_SAHIBI', 'DOKTOR', 'SEKRETER', 'PERSONEL']

const PERMISSION_CATALOG: AccessPermission[] = [
  { id: 'patient-view', key: 'patient.view', label: 'Hasta görüntüle', group: 'Hasta Yönetimi', description: 'Hasta listesini ve temel hasta bilgilerini görüntüleyebilir.', critical: false },
  { id: 'patient-create', key: 'patient.create', label: 'Hasta oluştur', group: 'Hasta Yönetimi', description: 'Yeni hasta kaydı oluşturabilir.', critical: false },
  { id: 'patient-edit', key: 'patient.edit', label: 'Hasta düzenle', group: 'Hasta Yönetimi', description: 'Hasta bilgilerini ve klinik alanları güncelleyebilir.', critical: true },
  { id: 'patient-archive', key: 'patient.archive', label: 'Hasta sil/arşivle', group: 'Hasta Yönetimi', description: 'Hasta kayıtlarını arşivleyebilir veya silebilir.', critical: true },
  { id: 'medical-note-view', key: 'medical_note.view', label: 'Tıbbi notları görüntüle', group: 'Hasta Yönetimi', description: 'Hassas tıbbi notları, özetleri ve hasta hikayesini görebilir.', critical: true },
  { id: 'medical-note-create', key: 'medical_note.create', label: 'Tıbbi not ekle', group: 'Hasta Yönetimi', description: 'Hasta kartına tıbbi not ve klinik değerlendirme ekleyebilir.', critical: true },
  { id: 'appointment-view', key: 'appointment.view', label: 'Randevu görüntüle', group: 'Randevu Yönetimi', description: 'Randevu listesi ve takvim bilgilerini görüntüleyebilir.', critical: false },
  { id: 'appointment-create', key: 'appointment.create', label: 'Randevu oluştur', group: 'Randevu Yönetimi', description: 'Yeni randevu oluşturabilir.', critical: false },
  { id: 'appointment-edit', key: 'appointment.edit', label: 'Randevu düzenle', group: 'Randevu Yönetimi', description: 'Randevu tarihini, personelini ve durumunu değiştirebilir.', critical: false },
  { id: 'appointment-cancel', key: 'appointment.cancel', label: 'Randevu iptal et', group: 'Randevu Yönetimi', description: 'Randevuları iptal edebilir veya no-show işaretleyebilir.', critical: true },
  { id: 'file-view', key: 'file.view', label: 'Dosya görüntüle', group: 'Dosya Yönetimi', description: 'Hasta dosyalarını ve raporlarını görüntüleyebilir.', critical: true },
  { id: 'file-upload', key: 'file.upload', label: 'Dosya yükle', group: 'Dosya Yönetimi', description: 'Hasta kartına belge ve rapor yükleyebilir.', critical: false },
  { id: 'file-delete', key: 'file.delete', label: 'Dosya sil', group: 'Dosya Yönetimi', description: 'Hasta dosyalarını silebilir.', critical: true },
  { id: 'team-view', key: 'team.view', label: 'Takım görüntüle', group: 'Takım Yönetimi', description: 'Takım üyelerini ve rol dağılımını görebilir.', critical: false },
  { id: 'team-create', key: 'team.create', label: 'Takım üyesi ekle', group: 'Takım Yönetimi', description: 'Yeni takım üyesi davet edebilir veya oluşturabilir.', critical: true },
  { id: 'team-role-edit', key: 'team.role.edit', label: 'Rol düzenle', group: 'Takım Yönetimi', description: 'Kullanıcı rollerini değiştirebilir.', critical: true },
  { id: 'team-permission-edit', key: 'team.permission.edit', label: 'Yetki düzenle', group: 'Takım Yönetimi', description: 'Rol ve kullanıcı bazlı yetkileri değiştirebilir.', critical: true },
  { id: 'analytics-view', key: 'analytics.view', label: 'Analitik görüntüle', group: 'Analitik', description: 'Operasyonel analitik panellerini görüntüleyebilir.', critical: false },
  { id: 'analytics-revenue-view', key: 'analytics.revenue.view', label: 'Gelir raporlarını görüntüle', group: 'Analitik', description: 'Ciro ve finansal raporları görüntüleyebilir.', critical: true },
  { id: 'settings-business-edit', key: 'settings.business.edit', label: 'İşletme ayarlarını düzenle', group: 'Ayarlar', description: 'İşletme profilini, iletişim ve operasyon ayarlarını düzenleyebilir.', critical: true },
  { id: 'settings-security-edit', key: 'settings.security.edit', label: 'Güvenlik ayarlarını düzenle', group: 'Ayarlar', description: 'Güvenlik, erişim ve hassas sistem ayarlarını düzenleyebilir.', critical: true },
]

const GROUPS = Array.from(new Set(PERMISSION_CATALOG.map((permission) => permission.group)))

const ROLE_DESCRIPTIONS: Record<RoleId, string> = {
  ISLETME_SAHIBI: 'Tüm işletme, güvenlik, finans ve kullanıcı yönetimi üzerinde tam kontrol.',
  DOKTOR: 'Hasta kayıtları, tıbbi notlar, tedavi süreçleri ve klinik operasyon erişimi.',
  SEKRETER: 'Randevu, hasta iletişimi ve operasyonel kayıt yönetimi. Tıbbi notlar kapalıdır.',
  PERSONEL: 'Sınırlı operasyon erişimi. Varsayılan olarak yalnızca kendi randevularını görür.',
  OZEL: 'Rol varsayılanından farklı, kullanıcıya özel yetki setleri.',
}

const TEMPLATE_OPTIONS = [
  { id: 'role-default', label: 'Rol varsayılanı' },
  { id: 'minimal', label: 'Minimum erişim' },
  { id: 'clinical', label: 'Klinik erişim' },
  { id: 'operations', label: 'Operasyon erişimi' },
] as const

function permissionSet(values: string[]) {
  return new Set(values as Permission[])
}

function uniquePermissions(values: Permission[]) {
  return Array.from(new Set(values))
}

function roleDefaults(role: RoleId) {
  if (role === 'OZEL') return [] as Permission[]
  return ROLE_DEFAULT_PERMISSIONS[role] ?? []
}

function memberPermissions(member: Member) {
  if (member.role === 'ISLETME_SAHIBI' || member.role === 'SUPER_ADMIN') {
    return ROLE_DEFAULT_PERMISSIONS.ISLETME_SAHIBI
  }
  const explicit = member.permissions as Permission[]
  return explicit.length > 0 ? uniquePermissions(explicit) : roleDefaults(member.role)
}

function roleLevel(role: RoleId) {
  const count = roleDefaults(role).filter((permission) => PERMISSION_CATALOG.some((p) => p.key === permission)).length
  if (role === 'ISLETME_SAHIBI') return 'Tam Yetki'
  if (role === 'DOKTOR') return 'Klinik Geniş'
  if (role === 'SEKRETER') return 'Operasyonel'
  if (role === 'PERSONEL') return 'Sınırlı'
  return `${count} özel yetki`
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatLastSeen(value: string | null) {
  if (!value) return 'Henüz giriş yok'
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function permissionsByTemplate(template: string, role: keyof typeof ROLE_LABELS) {
  if (template === 'minimal') return ['patient.view'] as Permission[]
  if (template === 'clinical') {
    return ['patient.view', 'patient.create', 'patient.edit', 'medical_note.view', 'medical_note.create', 'appointment.view', 'file.view', 'file.upload'] as Permission[]
  }
  if (template === 'operations') {
    return ['patient.view', 'patient.create', 'patient.edit', 'appointment.view', 'appointment.create', 'appointment.edit', 'appointment.cancel', 'file.view'] as Permission[]
  }
  return ROLE_DEFAULT_PERMISSIONS[role] ?? []
}

function isCriticalPermission(permission: Permission) {
  return PERMISSION_CATALOG.some((item) => item.key === permission && item.critical)
}

export function TeamBoard({
  members,
  canManage,
  currentUserId,
  membership,
}: {
  members: Member[]
  canManage: boolean
  currentUserId: string
  membership: MembershipSnapshot | null
}) {
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
      return member.permissions.length > 0 && (explicit.size !== defaults.size || [...explicit].some((p) => !defaults.has(p as Permission)))
    }).length

    const roles: Role[] = [
      { id: 'ISLETME_SAHIBI', name: 'İşletme Sahibi', description: ROLE_DESCRIPTIONS.ISLETME_SAHIBI, permissions: roleDrafts.ISLETME_SAHIBI },
      { id: 'DOKTOR', name: 'Doktor', description: ROLE_DESCRIPTIONS.DOKTOR, permissions: roleDrafts.DOKTOR },
      { id: 'SEKRETER', name: 'Sekreter', description: ROLE_DESCRIPTIONS.SEKRETER, permissions: roleDrafts.SEKRETER },
      { id: 'PERSONEL', name: 'Personel', description: ROLE_DESCRIPTIONS.PERSONEL, permissions: roleDrafts.PERSONEL },
      { id: 'OZEL', name: 'Özel Rol', description: ROLE_DESCRIPTIONS.OZEL, permissions: [], },
    ]

    return roles.map((role) => ({
      ...role,
      description: role.id === 'OZEL' && customCount === 0 ? 'Henüz özel yetki seti atanmış kullanıcı yok.' : role.description,
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
  const membershipEndText = membership?.accessEndAt
    ? new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(new Date(membership.accessEndAt))
    : 'Suresiz'

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
      if (!result.ok) { toast.error(result.error); return }
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
      if (!result.ok) { toast.error(result.error); return }
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
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Rol güncellendi')
      router.refresh()
    })
  }

  function confirmDeactivate() {
    const member = deactivateDialog.member
    if (!member) return
    startTransition(async () => {
      const result = await setTeamMemberActive({ id: member.id, isActive: !member.isActive })
      if (!result.ok) { toast.error(result.error); return }
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
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">Paket Durumu</p>
              <p className="mt-1 text-base font-bold text-brand-ink">
                {membership.isDemo ? 'Demo Hesap' : membership.planName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Hesap pasif tarihi: {membershipEndText}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-brand-ink">
              {membership.userLimit === null
                ? `Aktif kullanici: ${effectiveActiveMembers} / Sinirsiz`
                : `Aktif kullanici: ${effectiveActiveMembers} / ${membership.userLimit}`}
            </div>
          </div>
          {reachedUserLimit && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Bu pakette aktif kullanici limiti doldu. Yeni ekip uyesi eklemek icin paket yukseltin.</p>
            </div>
          )}
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2">
        <SummaryCard icon={<Users />} label="Toplam Üye" value={members.length} detail={`${activeMembers} aktif`} />
        <SummaryCard icon={<CheckCircle2 />} label="Aktif Üye" value={activeMembers} detail={`${members.length - activeMembers} erişimi durdurulmuş`} />
      </section>

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
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Üye ara..."
                className="h-10 w-full pl-9 sm:w-72"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleId | 'ALL')}>
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
                              onValueChange={(value) => changeMemberRole(member, value as keyof typeof ROLE_LABELS)}
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
                              <Button variant="outline" size="sm" onClick={() => openPermissionDrawer(member)}>
                                <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Yetkileri düzenle
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                disabled={isSelf}
                                onClick={() => setPasswordDialog({ open: true, member })}
                                aria-label={`${member.fullName} için şifre sıfırla`}
                              >
                                <KeyRound className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn('h-9 w-9', member.isActive && 'text-rose-600')}
                                disabled={isSelf}
                                onClick={() => setDeactivateDialog({ open: true, member })}
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

      {canManage && (
        <section className="space-y-3">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
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
                              onToggle={toggleRolePermission}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2 border-t bg-white p-3">
                      {(['DOKTOR', 'SEKRETER', 'PERSONEL'] as MatrixRoleId[]).map((role) => (
                        <Button key={role} variant="outline" size="sm" disabled={pending} onClick={() => saveRole(role)}>
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
      )}

      <AddUserDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        pending={pending}
        startTransition={startTransition}
        limitReached={reachedUserLimit}
        membership={membership}
      />
      <ResetPasswordDialog open={passwordDialog.open} member={passwordDialog.member} onClose={() => setPasswordDialog({ open: false })} />
      <PermissionDrawer
        member={drawerMember}
        permissions={drawerPermissions}
        pending={pending}
        onClose={() => setDrawerMember(null)}
        onToggle={toggleDrawerPermission}
        onSave={saveDrawerPermissions}
        onReset={resetDrawerToRole}
      />
      <AlertDialog open={deactivateDialog.open} onOpenChange={(open) => !open && setDeactivateDialog({ open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deactivateDialog.member?.isActive ? 'Erişimi durdur' : 'Erişimi yeniden aç'}</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateDialog.member?.fullName} kullanıcısının erişim durumu değiştirilecek. Bu işlem kullanıcının panele erişimini etkiler.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate} className="bg-brand-teal text-white hover:bg-brand-teal-hover">
              Onayla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SummaryCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: number; detail: string }) {
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

function AddUserDialog({
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
      toast.error('Paket kullanici limiti doldu. Yeni kullanici icin paket yukseltin.')
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
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Kullanıcı eklendi', {
        description: result.data.invitationSent ? 'Davet e-postası gönderildi.' : form.password ? 'Geçici şifre ile giriş yapabilir.' : 'Kullanıcı kaydı hazırlandı.',
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
                ? 'Demo hesap en fazla 1 aktif kullaniciya izin verir.'
                : 'Bu paketin aktif kullanici limiti doldu. Lutfen paket yukseltin.'}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Ad Soyad *</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">E-posta *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Rol *</Label>
              <Select value={form.role} onValueChange={(role) => setForm({ ...form, role: role as keyof typeof ROLE_LABELS })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEMPLATE_OPTIONS.map((template) => (
                    <SelectItem key={template.id} value={template.id}>{template.label}</SelectItem>
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
              <span className="text-xs text-muted-foreground">Geçici şifre yoksa kullanıcıya şifre kurulum bağlantısı gönderilir.</span>
            </span>
            <Switch checked={form.sendInvite} onCheckedChange={(sendInvite) => setForm({ ...form, sendInvite })} />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={close}>İptal</Button>
            <Button type="submit" disabled={pending || limitReached} className="bg-brand-teal text-white hover:bg-brand-teal-hover">
              {limitReached ? 'Paket limiti dolu' : pending ? 'Kaydediliyor...' : 'Kullanıcı ekle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PermissionDrawer({
  member,
  permissions,
  pending,
  onClose,
  onToggle,
  onSave,
  onReset,
}: {
  member: Member | null
  permissions: Permission[]
  pending: boolean
  onClose: () => void
  onToggle: (permission: Permission) => void
  onSave: () => void
  onReset: () => void
}) {
  const selected = permissionSet(permissions)
  return (
    <Sheet open={Boolean(member)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle>Yetkileri düzenle</SheetTitle>
        </SheetHeader>
        {member && (
          <div className="space-y-5 p-5">
            <div className="rounded-2xl border bg-dashboard-surface p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: member.color }}>
                  {initials(member.fullName)}
                </span>
                <div>
                  <p className="font-bold text-brand-ink">{member.fullName}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                  <Badge className="mt-2 border-0 bg-brand-teal/10 text-brand-teal">{ROLE_LABELS[member.role]}</Badge>
                </div>
              </div>
            </div>

            {GROUPS.map((group) => (
              <div key={group} className="space-y-2">
                <h3 className="text-sm font-bold text-brand-ink">{group}</h3>
                <div className="overflow-hidden rounded-2xl border">
                  {PERMISSION_CATALOG.filter((permission) => permission.group === group).map((permission) => (
                    <div key={permission.key} className="flex items-center justify-between gap-4 border-b p-3 last:border-b-0">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-brand-ink">{permission.label}</p>
                          {permission.critical && <Badge variant="outline" className="bg-amber-50 text-[10px] text-amber-700">Kritik</Badge>}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                      <Switch
                        checked={member.role === 'ISLETME_SAHIBI' || selected.has(permission.key)}
                        disabled={member.role === 'ISLETME_SAHIBI'}
                        onCheckedChange={() => onToggle(permission.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="sticky bottom-0 -mx-5 flex gap-2 border-t bg-white p-5">
              <Button type="button" variant="outline" className="flex-1" onClick={onReset}>
                <RotateCcw className="mr-2 h-4 w-4" /> Varsayılan Role Sıfırla
              </Button>
              <Button type="button" className="flex-1 bg-brand-teal text-white hover:bg-brand-teal-hover" disabled={pending} onClick={onSave}>
                Değişiklikleri Kaydet
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function ResetPasswordDialog({
  open,
  member,
  onClose,
}: {
  open: boolean
  member?: Member
  onClose: () => void
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [password, setPassword] = useState('')

  function close() {
    setPassword('')
    onClose()
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!member) return
    startTransition(async () => {
      const result = await resetTeamMemberPassword({ id: member.id, password })
      if (!result.ok) { toast.error(result.error); return }
      toast.success('Şifre sıfırlandı', {
        description: `${member.fullName} yeni şifreyle giriş yapabilir.`,
      })
      close()
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Şifre sıfırla</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div className="rounded-xl border bg-dashboard-surface p-3 text-sm">
            <p className="font-semibold text-brand-ink">{member?.fullName}</p>
            <p className="text-xs text-muted-foreground">{member?.email}</p>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Yeni geçici şifre *</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={close}>İptal</Button>
            <Button type="submit" disabled={pending} className="bg-brand-teal text-white hover:bg-brand-teal-hover">
              {pending ? 'Kaydediliyor...' : 'Şifreyi sıfırla'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
