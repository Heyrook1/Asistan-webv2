import type { Metadata } from "next"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"

export const metadata: Metadata = {
  title: "Admin Panel | Asistan",
  description: "Asistan sağlık hizmetleri yönetim paneli",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // In a real app, this would come from auth context
  const providerName = "Örnek Sağlık Merkezi"
  const userName = "Admin"
  const userRole = "Yönetici"

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar providerName={providerName} userRole={userRole} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader userName={userName} userRole={userRole} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
