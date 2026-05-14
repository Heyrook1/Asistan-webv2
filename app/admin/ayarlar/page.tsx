"use client"

import Link from "next/link"
import { 
  Shield, 
  User, 
  Bell, 
  CreditCard, 
  Building2, 
  Globe, 
  Lock, 
  Mail,
  ChevronRight,
  Smartphone
} from "lucide-react"

const settingsCategories = [
  {
    title: "Hesap Ayarları",
    items: [
      {
        id: "profile",
        name: "Profil Ayarları",
        description: "Kişisel bilgilerinizi ve hesap ayarlarınızı yönetin",
        icon: User,
        href: "/admin/ayarlar/profil",
        color: "bg-blue-500"
      },
      {
        id: "security",
        name: "Güvenlik",
        description: "Şifre, iki faktörlü doğrulama ve oturum yönetimi",
        icon: Lock,
        href: "/admin/ayarlar/guvenlik",
        color: "bg-red-500"
      },
      {
        id: "notifications",
        name: "Bildirim Tercihleri",
        description: "E-posta, SMS ve uygulama bildirimleri",
        icon: Bell,
        href: "/admin/ayarlar/bildirimler",
        color: "bg-amber-500"
      },
    ]
  },
  {
    title: "İşletme Ayarları",
    items: [
      {
        id: "business",
        name: "İşletme Bilgileri",
        description: "İşletme adı, adresi ve iletişim bilgileri",
        icon: Building2,
        href: "/admin/ayarlar/isletme",
        color: "bg-purple-500"
      },
      {
        id: "privileges",
        name: "Yetki Yönetimi",
        description: "Rol ve erişim yetkilerini yönetin",
        icon: Shield,
        href: "/admin/ayarlar/yetkiler",
        color: "bg-[#1BD1B5]"
      },
      {
        id: "billing",
        name: "Ödeme ve Faturalama",
        description: "Ödeme yöntemleri ve fatura ayarları",
        icon: CreditCard,
        href: "/admin/ayarlar/odeme",
        color: "bg-green-500"
      },
    ]
  },
  {
    title: "Uygulama Ayarları",
    items: [
      {
        id: "localization",
        name: "Dil ve Bölge",
        description: "Dil, saat dilimi ve para birimi ayarları",
        icon: Globe,
        href: "/admin/ayarlar/dil",
        color: "bg-indigo-500"
      },
      {
        id: "integrations",
        name: "Entegrasyonlar",
        description: "Üçüncü parti uygulama bağlantıları",
        icon: Smartphone,
        href: "/admin/ayarlar/entegrasyonlar",
        color: "bg-pink-500"
      },
      {
        id: "email",
        name: "E-posta Şablonları",
        description: "Otomatik e-posta şablonlarını özelleştirin",
        icon: Mail,
        href: "/admin/ayarlar/email",
        color: "bg-teal-500"
      },
    ]
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0B1828]">Ayarlar</h1>
        <p className="text-sm text-gray-500 mt-1">Sistem ve hesap ayarlarınızı yönetin</p>
      </div>

      {/* Settings Categories */}
      <div className="space-y-8">
        {settingsCategories.map((category) => (
          <div key={category.title}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {category.title}
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {category.items.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#0B1828]">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Tehlikeli Bölge</h2>
        <p className="text-sm text-red-600 mb-4">
          Bu işlemler geri alınamaz. Lütfen dikkatli olun.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-100 transition-colors">
            Tüm Verileri Dışa Aktar
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
            Hesabı Sil
          </button>
        </div>
      </div>
    </div>
  )
}
