"use client"

import { useState } from "react"
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Phone, 
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PatientDetailModal, PatientData } from "@/components/admin/patient-detail-modal"

// Mock patient data
const patientsData: PatientData[] = [
  {
    id: "p1",
    name: "Ayşe Yılmaz",
    birthYear: 1987,
    gender: "Kadın",
    phone: "+90 532 123 4567",
    email: "ayse.yilmaz@email.com",
    address: "Kadıköy, İstanbul",
    bloodType: "A+",
    allergies: ["Penisilin"],
    chronicConditions: ["Diyabet"],
    emergencyContact: { name: "Mehmet Yılmaz", phone: "+90 533 111 2222", relation: "Eş" },
    appointmentHistory: [
      { date: "10 Mayıs 2025", service: "Genel Kontrol", doctor: "Dr. Selin Aydın", status: "Tamamlandı" },
      { date: "15 Nisan 2025", service: "Kan Tahlili", doctor: "Laboratuvar", status: "Tamamlandı" },
    ],
    notes: "Düzenli kontrol hastası"
  },
  {
    id: "p2",
    name: "Mehmet Demir",
    birthYear: 1979,
    gender: "Erkek",
    phone: "+90 533 234 5678",
    email: "mehmet.demir@email.com",
    address: "Beşiktaş, İstanbul",
    bloodType: "B+",
    allergies: [],
    chronicConditions: ["Hipertansiyon"],
    emergencyContact: { name: "Fatma Demir", phone: "+90 534 222 3333", relation: "Eş" },
    appointmentHistory: [
      { date: "12 Mayıs 2025", service: "Dahiliye Muayene", doctor: "Dr. Selin Aydın", status: "Bekliyor" },
    ],
    notes: "Tansiyon takibi yapılmalı"
  },
  {
    id: "p3",
    name: "Zeynep Kaya",
    birthYear: 1992,
    gender: "Kadın",
    phone: "+90 534 345 6789",
    email: "zeynep.kaya@email.com",
    address: "Üsküdar, İstanbul",
    bloodType: "0+",
    allergies: [],
    chronicConditions: [],
    appointmentHistory: [
      { date: "15 Mayıs 2025", service: "Kan Tahlili", doctor: "Laboratuvar", status: "Tamamlandı" },
    ]
  },
  {
    id: "p4",
    name: "Ahmet Çelik",
    birthYear: 1965,
    gender: "Erkek",
    phone: "+90 535 456 7890",
    email: "ahmet.celik@email.com",
    address: "Şişli, İstanbul",
    bloodType: "AB-",
    allergies: ["Aspirin"],
    chronicConditions: ["Kalp Hastalığı", "Diyabet"],
    emergencyContact: { name: "Ayşe Çelik", phone: "+90 536 333 4444", relation: "Kızı" },
    appointmentHistory: [
      { date: "14 Mayıs 2025", service: "Kardiyoloji Kontrolü", doctor: "Dr. Murat Koç", status: "Tamamlandı" },
      { date: "28 Nisan 2025", service: "EKG", doctor: "Dr. Murat Koç", status: "Tamamlandı" },
    ],
    notes: "Kalp hastalığı nedeniyle sık kontrol gerekli"
  },
  {
    id: "p5",
    name: "Fatma Şahin",
    birthYear: 1983,
    gender: "Kadın",
    phone: "+90 536 567 8901",
    email: "fatma.sahin@email.com",
    address: "Bakırköy, İstanbul",
    bloodType: "A-",
    allergies: [],
    chronicConditions: [],
    appointmentHistory: [
      { date: "15 Mayıs 2025", service: "Fizik Tedavi", doctor: "Fzt. Elif Yılmaz", status: "İptal" },
    ]
  },
  {
    id: "p6",
    name: "Ali Yıldız",
    birthYear: 1975,
    gender: "Erkek",
    phone: "+90 537 678 9012",
    email: "ali.yildiz@email.com",
    address: "Ataşehir, İstanbul",
    bloodType: "0-",
    allergies: ["Latex"],
    chronicConditions: ["Astım"],
    appointmentHistory: [
      { date: "16 Mayıs 2025", service: "Göğüs Hastalıkları", doctor: "Dr. Canan Öz", status: "Bekliyor" },
    ]
  },
  {
    id: "p7",
    name: "Elif Arslan",
    birthYear: 1990,
    gender: "Kadın",
    phone: "+90 538 789 0123",
    email: "elif.arslan@email.com",
    address: "Maltepe, İstanbul",
    bloodType: "B-",
    allergies: [],
    chronicConditions: [],
    appointmentHistory: []
  },
  {
    id: "p8",
    name: "Can Özkan",
    birthYear: 1988,
    gender: "Erkek",
    phone: "+90 539 890 1234",
    email: "can.ozkan@email.com",
    address: "Sarıyer, İstanbul",
    bloodType: "A+",
    allergies: ["İyot"],
    chronicConditions: [],
    appointmentHistory: [
      { date: "17 Mayıs 2025", service: "Genel Kontrol", doctor: "Dr. Selin Aydın", status: "Bekliyor" },
    ]
  },
]

export default function PatientsPage() {
  const [patients] = useState<PatientData[]>(patientsData)
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery)
  )

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePatientClick = (patient: PatientData) => {
    setSelectedPatient(patient)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1828]">Hastalar</h1>
          <p className="text-sm text-gray-500 mt-1">Toplam {patients.length} kayıtlı hasta</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Dışa Aktar</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1BD1B5] text-white font-medium rounded-xl hover:bg-[#15b89e] transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Hasta</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Hasta adı, e-posta veya telefon ile ara..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1BD1B5]/30 focus:border-[#1BD1B5]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
            <Filter className="w-4 h-4" />
            Filtrele
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">Hasta</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4 hidden md:table-cell">İletişim</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4 hidden lg:table-cell">Kan Grubu</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4 hidden lg:table-cell">Son Randevu</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">Durum</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedPatients.map((patient) => {
                const age = new Date().getFullYear() - patient.birthYear
                const lastAppointment = patient.appointmentHistory?.[0]
                const hasChronicConditions = patient.chronicConditions && patient.chronicConditions.length > 0

                return (
                  <tr
                    key={patient.id}
                    onClick={() => handlePatientClick(patient)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1BD1B5]/20 to-[#0B1828]/10 flex items-center justify-center text-sm font-semibold text-[#0B1828]">
                          {patient.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-[#0B1828]">{patient.name}</p>
                          <p className="text-xs text-gray-500">{age} yaşında • {patient.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {patient.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                        {patient.bloodType || "Bilinmiyor"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {lastAppointment ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {lastAppointment.date}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Randevu yok</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {hasChronicConditions ? (
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                          Kronik Hasta
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredPatients.length} hastadan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredPatients.length)} arası gösteriliyor
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-8 h-8 text-sm font-medium rounded-lg transition-colors",
                  currentPage === i + 1
                    ? "bg-[#1BD1B5] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
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
