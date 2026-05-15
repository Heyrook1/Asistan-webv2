"use client"

import { useState } from "react"
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight,
  MoreVertical,
  Plus,
  Bell,
  MessageSquare,
  FileText,
  AlertTriangle,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PatientDetailModal, PatientData } from "@/components/admin/patient-detail-modal"

// Mock data for today's appointments
const todaysAppointments = [
  {
    id: "1",
    time: "09:00",
    patient: { id: "p1", name: "Ayşe Yılmaz", birthYear: 1987, gender: "Kadın", phone: "+90 532 123 4567", email: "ayse@email.com", bloodType: "A+", allergies: ["Penisilin"], chronicConditions: ["Diyabet"] },
    service: "Genel Kontrol",
    doctor: "Dr. Selin Aydın",
    status: "completed"
  },
  {
    id: "2",
    time: "10:30",
    patient: { id: "p2", name: "Mehmet Demir", birthYear: 1979, gender: "Erkek", phone: "+90 533 234 5678", email: "mehmet@email.com", bloodType: "B+", allergies: [], chronicConditions: ["Hipertansiyon"] },
    service: "Dahiliye Muayene",
    doctor: "Dr. Selin Aydın",
    status: "pending"
  },
  {
    id: "3",
    time: "12:00",
    patient: { id: "p3", name: "Zeynep Kaya", birthYear: 1992, gender: "Kadın", phone: "+90 534 345 6789", email: "zeynep@email.com", bloodType: "0+", allergies: [], chronicConditions: [] },
    service: "Kan Tahlili",
    doctor: "Laboratuvar",
    status: "confirmed"
  },
  {
    id: "4",
    time: "14:00",
    patient: { id: "p4", name: "Ahmet Çelik", birthYear: 1965, gender: "Erkek", phone: "+90 535 456 7890", email: "ahmet@email.com", bloodType: "AB-", allergies: ["Aspirin"], chronicConditions: ["Kalp Hastalığı", "Diyabet"] },
    service: "Kardiyoloji Kontrolü",
    doctor: "Dr. Murat Koç",
    status: "confirmed"
  },
  {
    id: "5",
    time: "15:30",
    patient: { id: "p5", name: "Fatma Şahin", birthYear: 1983, gender: "Kadın", phone: "+90 536 567 8901", email: "fatma@email.com", bloodType: "A-", allergies: [], chronicConditions: [] },
    service: "Fizik Tedavi",
    doctor: "Fzt. Elif Yılmaz",
    status: "cancelled"
  },
]

const notifications = [
  { id: 1, type: "appointment", icon: Calendar, title: "Yeni randevu talebi", message: "Mehmet Demir için yeni randevu talebi alındı.", time: "5 dk önce", color: "text-[#1BD1B5]", bg: "bg-[#1BD1B5]/10" },
  { id: 2, type: "confirmation", icon: Bell, title: "Randevu onaylandı", message: "Ayşe Yılmaz adlı hastanın randevusu onaylandı.", time: "15 dk önce", color: "text-blue-500", bg: "bg-blue-50" },
  { id: 3, type: "lab", icon: FileText, title: "Laboratuvar sonucu", message: "Zeynep Kaya adlı hastanın sonuçları hazır.", time: "1 saat önce", color: "text-purple-500", bg: "bg-purple-50" },
  { id: 4, type: "message", icon: MessageSquare, title: "Yeni mesaj", message: "Dr. Murat Koç size bir mesaj gönderdi.", time: "2 saat önce", color: "text-amber-500", bg: "bg-amber-50" },
  { id: 5, type: "alert", icon: AlertTriangle, title: "Onay bekleyen talep", message: "12 hizmet talebi onayınızı bekliyor.", time: "3 saat önce", color: "text-red-500", bg: "bg-red-50" },
]

const statusColors = {
  completed: { bg: "bg-[#1BD1B5]/10", text: "text-[#1BD1B5]", label: "Tamamlandı" },
  confirmed: { bg: "bg-[#1BD1B5]/10", text: "text-[#1BD1B5]", label: "Onaylandı" },
  pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Bekliyor" },
  cancelled: { bg: "bg-red-100", text: "text-red-600", label: "İptal Edildi" },
}

// Calendar component
function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 15)) // May 2025
  
  const daysOfWeek = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // Mock appointment data for calendar
  const appointmentDays = [1, 3, 8, 12, 15, 18, 22, 25, 28]
  const busyDays = [15, 22]

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-[#0B1828] mb-4">Takvim</h3>
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button className="px-3 py-1.5 text-sm font-medium text-[#1BD1B5] bg-[#1BD1B5]/10 rounded-lg">
          Bugün
        </button>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <span className="text-sm font-medium text-[#0B1828]">
          {months[month]} {year} <ChevronRight className="w-3 h-3 inline text-gray-400" />
        </span>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: adjustedFirstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const isToday = day === 15 && month === 4 && year === 2025
          const hasAppointment = appointmentDays.includes(day)
          const isBusy = busyDays.includes(day)

          return (
            <button
              key={day}
              className={cn(
                "h-9 w-9 mx-auto rounded-full text-sm font-medium transition-colors relative",
                isToday 
                  ? "bg-[#1BD1B5] text-white"
                  : hasAppointment
                    ? "text-[#0B1828] hover:bg-gray-100"
                    : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {day}
              {hasAppointment && !isToday && (
                <span className={cn(
                  "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                  isBusy ? "bg-red-500" : "bg-[#1BD1B5]"
                )} />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-[#1BD1B5]" />
          Randevu Var
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Yoğun
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          Müsait
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePatientClick = (patient: any) => {
    const patientData: PatientData = {
      ...patient,
      address: "Kadıköy, İstanbul",
      emergencyContact: {
        name: "Ali " + patient.name.split(" ")[1],
        phone: "+90 537 999 8888",
        relation: "Eş"
      },
      appointmentHistory: [
        { date: "10 Mayıs 2025", service: "Genel Kontrol", doctor: "Dr. Selin Aydın", status: "Tamamlandı" },
        { date: "15 Nisan 2025", service: "Kan Tahlili", doctor: "Laboratuvar", status: "Tamamlandı" },
        { date: "20 Mart 2025", service: "Dahiliye", doctor: "Dr. Murat Koç", status: "Tamamlandı" },
      ],
      notes: "Düzenli kontrol hastası. Her ay rutin muayene."
    }
    setSelectedPatient(patientData)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-[#1BD1B5]/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#1BD1B5]" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Bugünkü Randevular</p>
            <p className="text-3xl font-bold text-[#0B1828] mt-1">18</p>
            <p className="text-xs text-gray-400 mt-1">Toplam randevu</p>
          </div>
          <button className="flex items-center gap-1 text-sm text-[#1BD1B5] font-medium mt-4 hover:underline">
            Listeyi Gör <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Onay Bekleyenler</p>
            <p className="text-3xl font-bold text-[#0B1828] mt-1">12</p>
            <p className="text-xs text-gray-400 mt-1">Onay gerektiren talep</p>
          </div>
          <button className="flex items-center gap-1 text-sm text-[#1BD1B5] font-medium mt-4 hover:underline">
            Listeyi Gör <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Total Patients */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Toplam Hasta</p>
            <p className="text-3xl font-bold text-[#0B1828] mt-1">1.248</p>
            <p className="text-xs text-gray-400 mt-1">Kayıtlı hasta</p>
          </div>
          <button className="flex items-center gap-1 text-sm text-[#1BD1B5] font-medium mt-4 hover:underline">
            Detayları Gör <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Bu Ayın Geliri</p>
            <p className="text-3xl font-bold text-[#0B1828] mt-1">₺245.680</p>
            <p className="text-xs text-gray-400 mt-1">Toplam tahsilat</p>
          </div>
          <button className="flex items-center gap-1 text-sm text-[#1BD1B5] font-medium mt-4 hover:underline">
            Raporu Gör <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <CalendarWidget />
        </div>

        {/* Today's Appointments */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#0B1828]">Bugünkü Randevular</h3>
            <span className="px-2 py-1 bg-[#1BD1B5]/10 text-[#1BD1B5] text-xs font-medium rounded-full">
              5
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>&lt; Bugün &gt;</span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {todaysAppointments.map((appointment) => {
              const status = statusColors[appointment.status as keyof typeof statusColors]
              return (
                <div
                  key={appointment.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => handlePatientClick(appointment.patient)}
                >
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      appointment.status === "cancelled" ? "bg-red-500" : "bg-[#1BD1B5]"
                    )} />
                    <span className="text-sm font-medium text-[#0B1828] w-12">{appointment.time}</span>
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1BD1B5]/20 to-[#0B1828]/10 flex items-center justify-center text-sm font-semibold text-[#0B1828]">
                    {appointment.patient.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0B1828] truncate">{appointment.patient.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date().getFullYear() - appointment.patient.birthYear} • {appointment.patient.gender}
                    </p>
                  </div>
                  
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-[#0B1828]">{appointment.service}</p>
                    <p className="text-xs text-gray-500">{appointment.doctor}</p>
                  </div>
                  
                  <span className={cn("px-2 py-1 text-xs font-medium rounded-full", status.bg, status.text)}>
                    {status.label}
                  </span>
                  
                  <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )
            })}
          </div>

          <button className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 text-sm text-[#1BD1B5] font-medium hover:bg-[#1BD1B5]/5 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Randevu Ekle
          </button>
        </div>

        {/* Notification Center */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#0B1828]">Bildirim Merkezi</h3>
            <button className="text-sm text-[#1BD1B5] font-medium hover:underline flex items-center gap-1">
              Tümünü Gör <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = notification.icon
              return (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", notification.bg)}>
                    <Icon className={cn("w-5 h-5", notification.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0B1828]">{notification.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{notification.time}</span>
                </div>
              )
            })}
          </div>

          <button className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 text-sm text-[#1BD1B5] font-medium hover:bg-[#1BD1B5]/5 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            Tüm Bildirim Ayarları
          </button>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-[#0B1828]">Genel Bakış</h3>
          <select className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <option>Bu Ay</option>
            <option>Son 3 Ay</option>
            <option>Son 6 Ay</option>
            <option>Bu Yıl</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Appointment Distribution */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Randevu Dağılımı</h4>
            <div className="relative w-40 h-40 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1BD1B5" strokeWidth="20" strokeDasharray="140.8 251.2" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="20" strokeDasharray="72.6 251.2" strokeDashoffset="-140.8" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#EF4444" strokeWidth="20" strokeDasharray="22.6 251.2" strokeDashoffset="-213.4" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="20" strokeDasharray="15 251.2" strokeDashoffset="-236" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#0B1828]">236</span>
                <span className="text-xs text-gray-500">Toplam</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1BD1B5]" />
                  <span className="text-gray-600">Tamamlanan</span>
                </div>
                <span className="font-medium text-[#0B1828]">132 (%56)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-gray-600">Onaylanan</span>
                </div>
                <span className="font-medium text-[#0B1828]">68 (%29)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-gray-600">İptal Edilen</span>
                </div>
                <span className="font-medium text-[#0B1828]">22 (%9)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-gray-600">Bekleyen</span>
                </div>
                <span className="font-medium text-[#0B1828]">14 (%6)</span>
              </div>
            </div>
          </div>

          {/* Daily Appointment Chart */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Günlük Randevu Sayısı</h4>
            <div className="h-44 flex items-end gap-2">
              {[15, 22, 18, 28, 20, 32, 18].map((value, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-[#1BD1B5] to-[#1BD1B5]/60 rounded-t-lg transition-all hover:from-[#15b89e]"
                    style={{ height: `${(value / 35) * 100}%` }}
                  />
                  <span className="text-xs text-gray-500">{9 + i} May</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-[#1BD1B5] rounded" />
                18 Randevu
              </span>
            </div>
          </div>

          {/* Service Distribution */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Hizmetlere Göre Dağılım</h4>
            <div className="space-y-3">
              {[
                { name: "Genel Kontrol", percentage: 32, color: "bg-[#1BD1B5]" },
                { name: "Dahiliye", percentage: 24, color: "bg-blue-500" },
                { name: "Kardiyoloji", percentage: 18, color: "bg-purple-500" },
                { name: "Fizik Tedavi", percentage: 14, color: "bg-amber-500" },
                { name: "Laboratuvar", percentage: 12, color: "bg-pink-500" },
              ].map((service, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{service.name}</span>
                    <span className="font-medium text-[#0B1828]">%{service.percentage}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all", service.color)}
                      style={{ width: `${service.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      <PatientDetailModal
        patient={selectedPatient}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPatient(null)
        }}
      />
    </div>
  )
}
