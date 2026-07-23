import { ROLE_DEFAULT_PERMISSIONS, type Permission } from '@/lib/rbac'
import type { AccessPermission, Member, RoleId, MatrixRoleId } from './team-board-types'

export const MANAGED_ROLES: MatrixRoleId[] = ['ISLETME_SAHIBI', 'DOKTOR', 'SEKRETER', 'PERSONEL']

export const PERMISSION_CATALOG: AccessPermission[] = [
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

export const GROUPS = Array.from(new Set(PERMISSION_CATALOG.map((permission) => permission.group)))

export const ROLE_DESCRIPTIONS: Record<RoleId, string> = {
  ISLETME_SAHIBI: 'Tüm işletme, güvenlik, finans ve kullanıcı yönetimi üzerinde tam kontrol.',
  DOKTOR: 'Hasta kayıtları, tıbbi notlar, tedavi süreçleri ve klinik operasyon erişimi.',
  SEKRETER: 'Randevu, hasta iletişimi ve operasyonel kayıt yönetimi. Tıbbi notlar kapalıdır.',
  PERSONEL: 'Sınırlı operasyon erişimi. Varsayılan olarak yalnızca kendi randevularını görür.',
  OZEL: 'Rol varsayılanından farklı, kullanıcıya özel yetki setleri.',
}

export const TEMPLATE_OPTIONS = [
  { id: 'role-default', label: 'Rol varsayılanı' },
  { id: 'minimal', label: 'Minimum erişim' },
  { id: 'clinical', label: 'Klinik erişim' },
  { id: 'operations', label: 'Operasyon erişimi' },
] as const

export function permissionSet(values: string[]) {
  return new Set(values as Permission[])
}

export function uniquePermissions(values: Permission[]) {
  return Array.from(new Set(values))
}

export function roleDefaults(role: RoleId) {
  if (role === 'OZEL') return [] as Permission[]
  return ROLE_DEFAULT_PERMISSIONS[role] ?? []
}

export function memberPermissions(member: Member) {
  if (member.role === 'ISLETME_SAHIBI' || member.role === 'SUPER_ADMIN') {
    return ROLE_DEFAULT_PERMISSIONS.ISLETME_SAHIBI
  }
  const explicit = member.permissions as Permission[]
  return explicit.length > 0 ? uniquePermissions(explicit) : roleDefaults(member.role)
}

export function roleLevel(role: RoleId) {
  const count = roleDefaults(role).filter((permission) => PERMISSION_CATALOG.some((p) => p.key === permission)).length
  if (role === 'ISLETME_SAHIBI') return 'Tam Yetki'
  if (role === 'DOKTOR') return 'Klinik Geniş'
  if (role === 'SEKRETER') return 'Operasyonel'
  if (role === 'PERSONEL') return 'Sınırlı'
  return `${count} özel yetki`
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function formatLastSeen(value: string | null) {
  if (!value) return 'Henüz giriş yok'
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function permissionsByTemplate(template: string, role: Member['role']) {
  if (template === 'minimal') return ['patient.view'] as Permission[]
  if (template === 'clinical') {
    return ['patient.view', 'patient.create', 'patient.edit', 'medical_note.view', 'medical_note.create', 'appointment.view', 'file.view', 'file.upload'] as Permission[]
  }
  if (template === 'operations') {
    return ['patient.view', 'patient.create', 'patient.edit', 'appointment.view', 'appointment.create', 'appointment.edit', 'appointment.cancel', 'file.view'] as Permission[]
  }
  return ROLE_DEFAULT_PERMISSIONS[role] ?? []
}

export function isCriticalPermission(permission: Permission) {
  return PERMISSION_CATALOG.some((item) => item.key === permission && item.critical)
}
