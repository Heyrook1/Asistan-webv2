import type { Permission } from '@/lib/rbac'

export type RoleId = 'ISLETME_SAHIBI' | 'DOKTOR' | 'SEKRETER' | 'PERSONEL' | 'OZEL'
export type MatrixRoleId = Exclude<RoleId, 'OZEL'>

export type Role = {
  id: RoleId
  name: string
  description: string
  permissions: Permission[]
}

export type PermissionGroup =
  | 'Hasta Yönetimi'
  | 'Randevu Yönetimi'
  | 'Dosya Yönetimi'
  | 'Takım Yönetimi'
  | 'Analitik'
  | 'Ayarlar'

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

export type Member = {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: keyof typeof import('@/lib/rbac').ROLE_LABELS
  permissions: string[]
  color: string
  isActive: boolean
  lastSeenAt: string | null
  userId: string | null
}

export type MembershipSnapshot = {
  planName: string
  isDemo: boolean
  userLimit: number | null
  activeMembers: number
  accessEndAt: string | null
}

export type TeamBoardProps = {
  members: Member[]
  canManage: boolean
  currentUserId: string
  membership: MembershipSnapshot | null
}
