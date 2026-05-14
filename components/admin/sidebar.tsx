"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Calendar,
  FileText,
  Users,
  Building2,
  CheckCircle,
  MessageSquare,
  Receipt,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { id: "dashboard", label: "Ana Sayfa", icon: Home, href: "/admin" },
  { id: "appointments", label: "Randevular", icon: Calendar, href: "/admin/randevular" },
  { id: "requests", label: "Hizmet Talepleri", icon: FileText, href: "/admin/talepler" },
  { id: "patients", label: "Hastalar", icon: Users, href: "/admin/hastalar" },
  { id: "providers", label: "Sağlayıcılar", icon: Building2, href: "/admin/saglayicilar" },
  { id: "approvals", label: "Onaylar", icon: CheckCircle, href: "/admin/onaylar", badge: 12 },
  { id: "messages", label: "Mesajlar", icon: MessageSquare, href: "/admin/mesajlar", badge: 5 },
  { id: "billing", label: "Faturalama", icon: Receipt, href: "/admin/faturalama" },
  { id: "reports", label: "Raporlar", icon: BarChart3, href: "/admin/raporlar" },
  { id: "settings", label: "Ayarlar", icon: Settings, href: "/admin/ayarlar" },
]

interface AdminSidebarProps {
  providerName?: string
  userRole?: string
}

export function AdminSidebar({ providerName = "Örnek Sağlık Merkezi", userRole = "Admin" }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-[#0B1828] text-white transition-all duration-300 sticky top-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/10">
        <div className="w-10 h-10 rounded-lg bg-[#1BD1B5] flex items-center justify-center flex-shrink-0">
          <span className="text-[#0B1828] font-bold text-lg">A</span>
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="font-bold text-lg tracking-tight">ASISTAN</h1>
            <p className="text-xs text-[#1BD1B5]">Provider Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-[#1BD1B5] text-[#0B1828]"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-[#0B1828]" : "text-gray-400 group-hover:text-white")} />
              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      "ml-auto text-xs font-medium px-2 py-0.5 rounded-full",
                      isActive ? "bg-[#0B1828] text-white" : "bg-[#1BD1B5] text-[#0B1828]"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1BD1B5] text-[#0B1828] text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors",
            isCollapsed && "justify-center"
          )}
        >
          <div className="w-9 h-9 rounded-full bg-[#1BD1B5]/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-[#1BD1B5]" />
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white truncate">{providerName}</p>
                <p className="text-xs text-gray-400">{userRole}</p>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isProfileOpen && "rotate-180")} />
            </>
          )}
        </button>

        {isProfileOpen && !isCollapsed && (
          <div className="mt-2 py-2 bg-white/5 rounded-lg">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              <Settings className="w-4 h-4" />
              Profil Ayarları
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors">
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-white border-t border-white/10 transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <>
            <ChevronLeft className="w-5 h-5" />
            <span>Menüyü Daralt</span>
          </>
        )}
      </button>
    </aside>
  )
}
