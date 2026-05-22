"use client"

import { X, Phone, Mail, MapPin, FileText, Clock, User, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PatientData {
  id: string
  name: string
  birthYear: number
  gender: string
  phone: string
  email: string
  address?: string
  avatarUrl?: string
  bloodType?: string
  allergies?: string[]
  chronicConditions?: string[]
  emergencyContact?: {
    name: string
    phone: string
    relation: string
  }
  appointmentHistory?: {
    date: string
    service: string
    doctor: string
    status: string
  }[]
  notes?: string
}

interface PatientDetailModalProps {
  patient: PatientData | null
  isOpen: boolean
  onClose: () => void
}

export function PatientDetailModal({ patient, isOpen, onClose }: PatientDetailModalProps) {
  if (!isOpen || !patient) return null

  const age = new Date().getFullYear() - patient.birthYear

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden mx-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1828] to-[#1a3a5c] px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#1BD1B5]/20 flex items-center justify-center text-2xl font-bold text-[#1BD1B5]">
                {patient.avatarUrl ? (
                  <img src={patient.avatarUrl} alt={patient.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  patient.name.charAt(0)
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{patient.name}</h2>
                <p className="text-[#1BD1B5] text-sm mt-0.5">
                  {age} yaşında • {patient.gender} • {patient.bloodType || "Kan grubu bilinmiyor"}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-[#0B1828] mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[#1BD1B5]" />
                İletişim Bilgileri
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{patient.email}</span>
                </div>
                {patient.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{patient.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-[#0B1828] mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1BD1B5]" />
                Sağlık Bilgileri
              </h3>
              <div className="space-y-3">
                {patient.allergies && patient.allergies.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Alerjiler</p>
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.map((allergy, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Kronik Hastalıklar</p>
                    <div className="flex flex-wrap gap-1">
                      {patient.chronicConditions.map((condition, i) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {!patient.allergies?.length && !patient.chronicConditions?.length && (
                  <p className="text-sm text-gray-500">Kayıtlı sağlık bilgisi bulunmuyor.</p>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            {patient.emergencyContact && (
              <div className="bg-red-50 rounded-xl p-4">
                <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Acil Durum İletişim
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-red-700 font-medium">{patient.emergencyContact.name}</p>
                  <p className="text-sm text-red-600">{patient.emergencyContact.phone}</p>
                  <p className="text-xs text-red-500">{patient.emergencyContact.relation}</p>
                </div>
              </div>
            )}

            {/* Notes */}
            {patient.notes && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-[#0B1828] mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1BD1B5]" />
                  Notlar
                </h3>
                <p className="text-sm text-gray-700">{patient.notes}</p>
              </div>
            )}
          </div>

          {/* Appointment History */}
          {patient.appointmentHistory && patient.appointmentHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-[#0B1828] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1BD1B5]" />
                Randevu Geçmişi
              </h3>
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Tarih</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Hizmet</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Doktor</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.appointmentHistory.map((appointment, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 text-sm text-gray-700">{appointment.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{appointment.service}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{appointment.doctor}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded-full",
                            appointment.status === "Tamamlandı" && "bg-green-100 text-green-700",
                            appointment.status === "İptal" && "bg-red-100 text-red-700",
                            appointment.status === "Bekliyor" && "bg-amber-100 text-amber-700"
                          )}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Kapat
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-[#1BD1B5] hover:bg-[#15b89e] rounded-lg transition-colors">
              Randevu Oluştur
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
