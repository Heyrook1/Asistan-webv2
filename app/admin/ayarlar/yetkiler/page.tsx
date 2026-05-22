"use client"

import { useState } from "react"
import { 
  Shield, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  Users,
  Eye,
  Pencil,
  Lock,
  ChevronDown,
  ChevronRight,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"

// Permission categories and their items
const permissionCategories = [
  {
    id: "appointments",
    name: "Randevu Yönetimi",
    permissions: [
      { id: "view_appointments", name: "Randevuları Görüntüle", description: "Tüm randevuları görebilir" },
      { id: "create_appointments", name: "Randevu Oluştur", description: "Yeni randevu ekleyebilir" },
      { id: "edit_appointments", name: "Randevu Düzenle", description: "Mevcut randevuları düzenleyebilir" },
      { id: "delete_appointments", name: "Randevu Sil", description: "Randevuları silebilir" },
      { id: "approve_appointments", name: "Randevu Onayla", description: "Bekleyen randevuları onaylayabilir" },
    ]
  },
  {
    id: "patients",
    name: "Hasta Yönetimi",
    permissions: [
      { id: "view_patients", name: "Hastaları Görüntüle", description: "Hasta listesini görebilir" },
      { id: "view_patient_details", name: "Hasta Detaylarını Gör", description: "Hasta detay bilgilerini görebilir" },
      { id: "edit_patients", name: "Hasta Bilgilerini Düzenle", description: "Hasta bilgilerini güncelleyebilir" },
      { id: "delete_patients", name: "Hasta Sil", description: "Hasta kayıtlarını silebilir" },
    ]
  },
  {
    id: "billing",
    name: "Faturalama",
    permissions: [
      { id: "view_billing", name: "Faturaları Görüntüle", description: "Fatura listesini görebilir" },
      { id: "create_invoice", name: "Fatura Oluştur", description: "Yeni fatura kesebilir" },
      { id: "edit_invoice", name: "Fatura Düzenle", description: "Faturaları düzenleyebilir" },
      { id: "process_payment", name: "Ödeme İşle", description: "Ödeme alabilir ve işleyebilir" },
    ]
  },
  {
    id: "reports",
    name: "Raporlar",
    permissions: [
      { id: "view_reports", name: "Raporları Görüntüle", description: "İstatistik ve raporları görebilir" },
      { id: "export_reports", name: "Rapor Dışa Aktar", description: "Raporları dışa aktarabilir" },
    ]
  },
  {
    id: "settings",
    name: "Ayarlar",
    permissions: [
      { id: "view_settings", name: "Ayarları Görüntüle", description: "Sistem ayarlarını görebilir" },
      { id: "edit_settings", name: "Ayarları Düzenle", description: "Sistem ayarlarını değiştirebilir" },
      { id: "manage_users", name: "Kullanıcı Yönetimi", description: "Kullanıcı ekleyip çıkarabilir" },
      { id: "manage_roles", name: "Rol Yönetimi", description: "Rolleri ve yetkileri yönetebilir" },
    ]
  },
]

// Sample roles
const initialRoles = [
  {
    id: "admin",
    name: "Yönetici",
    description: "Tüm sistem yetkilerine sahip",
    userCount: 2,
    color: "bg-red-500",
    permissions: permissionCategories.flatMap(c => c.permissions.map(p => p.id)),
    isSystem: true
  },
  {
    id: "doctor",
    name: "Doktor",
    description: "Hasta ve randevu yönetimi yetkilerine sahip",
    userCount: 8,
    color: "bg-blue-500",
    permissions: ["view_appointments", "create_appointments", "edit_appointments", "approve_appointments", "view_patients", "view_patient_details", "edit_patients", "view_billing", "view_reports"],
    isSystem: false
  },
  {
    id: "secretary",
    name: "Sekreter",
    description: "Randevu ve temel hasta bilgileri yetkilerine sahip",
    userCount: 4,
    color: "bg-green-500",
    permissions: ["view_appointments", "create_appointments", "edit_appointments", "view_patients", "view_billing", "create_invoice"],
    isSystem: false
  },
  {
    id: "assistant",
    name: "Asistan",
    description: "Sınırlı görüntüleme yetkilerine sahip",
    userCount: 6,
    color: "bg-amber-500",
    permissions: ["view_appointments", "view_patients"],
    isSystem: false
  },
]

interface Role {
  id: string
  name: string
  description: string
  userCount: number
  color: string
  permissions: string[]
  isSystem: boolean
}

export default function PrivilegeManagementPage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedPermissions, setEditedPermissions] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>(permissionCategories.map(c => c.id))
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewRoleModal, setShowNewRoleModal] = useState(false)
  const [newRole, setNewRole] = useState({ name: "", description: "", color: "bg-purple-500" })

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setEditedPermissions(role.permissions)
    setIsEditMode(false)
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const togglePermission = (permissionId: string) => {
    if (!isEditMode || selectedRole?.isSystem) return
    
    setEditedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const toggleCategoryPermissions = (categoryId: string) => {
    if (!isEditMode || selectedRole?.isSystem) return
    
    const category = permissionCategories.find(c => c.id === categoryId)
    if (!category) return

    const categoryPermissions = category.permissions.map(p => p.id)
    const allSelected = categoryPermissions.every(p => editedPermissions.includes(p))

    if (allSelected) {
      setEditedPermissions(prev => prev.filter(p => !categoryPermissions.includes(p)))
    } else {
      setEditedPermissions(prev => [...new Set([...prev, ...categoryPermissions])])
    }
  }

  const savePermissions = () => {
    if (!selectedRole) return
    
    setRoles(prev => prev.map(role => 
      role.id === selectedRole.id 
        ? { ...role, permissions: editedPermissions }
        : role
    ))
    setSelectedRole({ ...selectedRole, permissions: editedPermissions })
    setIsEditMode(false)
  }

  const createNewRole = () => {
    const newRoleData: Role = {
      id: newRole.name.toLowerCase().replace(/\s+/g, '-'),
      name: newRole.name,
      description: newRole.description,
      userCount: 0,
      color: newRole.color,
      permissions: [],
      isSystem: false
    }
    setRoles(prev => [...prev, newRoleData])
    setShowNewRoleModal(false)
    setNewRole({ name: "", description: "", color: "bg-purple-500" })
    handleRoleSelect(newRoleData)
  }

  const deleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (role?.isSystem) return
    
    setRoles(prev => prev.filter(r => r.id !== roleId))
    if (selectedRole?.id === roleId) {
      setSelectedRole(null)
    }
  }

  const colorOptions = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-amber-500", 
    "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1828]">Yetki Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Rol ve erişim yetkilerini yönetin</p>
        </div>
        <button
          onClick={() => setShowNewRoleModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1BD1B5] text-white font-medium rounded-xl hover:bg-[#15b89e] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Rol Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rol ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1BD1B5]/30 focus:border-[#1BD1B5]"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {roles
              .filter(role => role.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((role) => (
                <div
                  key={role.id}
                  onClick={() => handleRoleSelect(role)}
                  className={cn(
                    "p-4 cursor-pointer transition-colors",
                    selectedRole?.id === role.id ? "bg-[#1BD1B5]/5" : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", role.color)}>
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[#0B1828]">{role.name}</h3>
                          {role.isSystem && (
                            <Lock className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        {role.userCount}
                      </span>
                      {!role.isSystem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteRole(role.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                    <Check className="w-3 h-3" />
                    {role.permissions.length} yetki
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {selectedRole ? (
            <>
              {/* Panel Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", selectedRole.color)}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#0B1828]">{selectedRole.name} Yetkileri</h2>
                    <p className="text-sm text-gray-500">{selectedRole.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isEditMode ? (
                    <>
                      <button
                        onClick={() => {
                          setEditedPermissions(selectedRole.permissions)
                          setIsEditMode(false)
                        }}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        İptal
                      </button>
                      <button
                        onClick={savePermissions}
                        className="px-3 py-1.5 text-sm text-white bg-[#1BD1B5] hover:bg-[#15b89e] rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Kaydet
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditMode(true)}
                      disabled={selectedRole.isSystem}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1",
                        selectedRole.isSystem
                          ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                          : "text-[#1BD1B5] hover:bg-[#1BD1B5]/10"
                      )}
                    >
                      <Edit2 className="w-4 h-4" />
                      Düzenle
                    </button>
                  )}
                </div>
              </div>

              {selectedRole.isSystem && (
                <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  Sistem rolleri düzenlenemez. Tüm yetkilere sahiptir.
                </div>
              )}

              {/* Permissions List */}
              <div className="p-4 max-h-[550px] overflow-y-auto">
                <div className="space-y-4">
                  {permissionCategories.map((category) => {
                    const isExpanded = expandedCategories.includes(category.id)
                    const categoryPermissions = category.permissions.map(p => p.id)
                    const selectedCount = categoryPermissions.filter(p => editedPermissions.includes(p)).length
                    const allSelected = selectedCount === categoryPermissions.length

                    return (
                      <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="font-medium text-[#0B1828]">{category.name}</span>
                            <span className="text-xs text-gray-500">
                              ({selectedCount}/{categoryPermissions.length})
                            </span>
                          </div>
                          {isEditMode && !selectedRole.isSystem && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleCategoryPermissions(category.id)
                              }}
                              className={cn(
                                "px-2 py-1 text-xs rounded-md transition-colors",
                                allSelected
                                  ? "bg-[#1BD1B5] text-white"
                                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                              )}
                            >
                              {allSelected ? "Tümünü Kaldır" : "Tümünü Seç"}
                            </button>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="divide-y divide-gray-100">
                            {category.permissions.map((permission) => {
                              const isSelected = editedPermissions.includes(permission.id)

                              return (
                                <div
                                  key={permission.id}
                                  onClick={() => togglePermission(permission.id)}
                                  className={cn(
                                    "px-4 py-3 flex items-center justify-between",
                                    isEditMode && !selectedRole.isSystem && "cursor-pointer hover:bg-gray-50"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center",
                                      isSelected ? "bg-[#1BD1B5]/10" : "bg-gray-100"
                                    )}>
                                      {permission.id.includes("view") ? (
                                        <Eye className={cn("w-4 h-4", isSelected ? "text-[#1BD1B5]" : "text-gray-400")} />
                                      ) : permission.id.includes("edit") || permission.id.includes("create") ? (
                                        <Pencil className={cn("w-4 h-4", isSelected ? "text-[#1BD1B5]" : "text-gray-400")} />
                                      ) : permission.id.includes("delete") ? (
                                        <Trash2 className={cn("w-4 h-4", isSelected ? "text-[#1BD1B5]" : "text-gray-400")} />
                                      ) : (
                                        <Lock className={cn("w-4 h-4", isSelected ? "text-[#1BD1B5]" : "text-gray-400")} />
                                      )}
                                    </div>
                                    <div>
                                      <p className={cn(
                                        "text-sm font-medium",
                                        isSelected ? "text-[#0B1828]" : "text-gray-500"
                                      )}>
                                        {permission.name}
                                      </p>
                                      <p className="text-xs text-gray-400">{permission.description}</p>
                                    </div>
                                  </div>
                                  <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    isSelected 
                                      ? "bg-[#1BD1B5] border-[#1BD1B5]" 
                                      : "border-gray-300"
                                  )}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-[#0B1828]">Rol Seçin</h3>
              <p className="text-sm text-gray-500 mt-1">Yetkileri görüntülemek için sol taraftan bir rol seçin</p>
            </div>
          )}
        </div>
      </div>

      {/* New Role Modal */}
      {showNewRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNewRoleModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl mx-4 p-6">
            <h2 className="text-xl font-bold text-[#0B1828] mb-4">Yeni Rol Oluştur</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol Adı</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="Örn: Danışman"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1BD1B5]/30 focus:border-[#1BD1B5]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Bu rolün amacını açıklayın..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1BD1B5]/30 focus:border-[#1BD1B5] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Renk</label>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewRole({ ...newRole, color })}
                      className={cn(
                        "w-8 h-8 rounded-lg transition-transform",
                        color,
                        newRole.color === color && "ring-2 ring-offset-2 ring-gray-400 scale-110"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowNewRoleModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={createNewRole}
                disabled={!newRole.name}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1BD1B5] hover:bg-[#15b89e] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
