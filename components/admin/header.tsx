"use client"

import { useState } from "react"
import { Search, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminHeaderProps {
  userName?: string
  userRole?: string
}

export function AdminHeader({ userName = "Admin", userRole = "Yönetici" }: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [notifications] = useState([
    { id: 1, title: "Yeni randevu talebi", message: "Mehmet Demir için yeni randevu talebi alındı.", time: "5 dk önce", unread: true },
    { id: 2, title: "Randevu onaylandı", message: "Ayşe Yılmaz adlı hastanın randevusu onaylandı.", time: "15 dk önce", unread: true },
    { id: 3, title: "Laboratuvar sonucu", message: "Zeynep Kaya adlı hastanın sonuçları hazır.", time: "1 saat önce", unread: false },
  ])
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Welcome Message */}
        <div>
          <h1 className="text-2xl font-bold text-[#0B1828]">
            Hoş geldiniz, {userName} <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Sağlık hizmetlerinizi yönetmek için panelinizi kullanabilirsiniz.
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ara (hasta, randevu, hizmet...)"
              className="w-72 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1BD1B5]/30 focus:border-[#1BD1B5] transition-all"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-[#0B1828]">Bildirimler</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors",
                        notification.unread && "bg-[#1BD1B5]/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                          notification.unread ? "bg-[#1BD1B5]" : "bg-gray-300"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0B1828]">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-100">
                  <button className="text-sm text-[#1BD1B5] font-medium hover:underline">
                    Tüm bildirimleri gör
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-[#1BD1B5] flex items-center justify-center text-white font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-[#0B1828]">{userName}</p>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isProfileOpen && "rotate-180")} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-[#0B1828]">{userName}</p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4" />
                    Profilim
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4" />
                    Ayarlar
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
