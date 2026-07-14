'use client'

import { Download, FileText } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { downloadCsv, printReportAsPdf } from '@/lib/client-export'
import { ageFromBirthDate, formatPhone, formatShortDate } from '@/lib/format'

export type PatientExportRow = {
  patientNumber: string | null
  fullName: string
  phone: string | null
  email: string | null
  gender: string | null
  birthDate: string | null
  tags: string[]
  riskNote: string | null
  appointmentCount: number
  createdAt: string
}

function toRows(patients: PatientExportRow[]): string[][] {
  return [
    [
      'Hasta no',
      'Ad Soyad',
      'Telefon',
      'E-posta',
      'Cinsiyet',
      'Dogum tarihi',
      'Yas',
      'Etiketler',
      'Randevu sayisi',
      'Risk notu',
      'Kayit tarihi',
    ],
    ...patients.map((p) => {
      const birth = p.birthDate ? new Date(p.birthDate) : null
      const age = ageFromBirthDate(birth)
      return [
        p.patientNumber ?? '',
        p.fullName,
        formatPhone(p.phone) === '—' ? '' : formatPhone(p.phone),
        p.email ?? '',
        p.gender ?? '',
        birth ? formatShortDate(birth) : '',
        age != null ? String(age) : '',
        p.tags.join(', '),
        String(p.appointmentCount),
        p.riskNote ? 'Var' : '',
        formatShortDate(p.createdAt),
      ]
    }),
  ]
}

export function PatientsExportMenu({
  patients,
  label,
}: {
  patients: PatientExportRow[]
  label: string
}) {
  function exportCsv() {
    if (patients.length === 0) {
      toast.error('Dışa aktarılacak hasta yok')
      return
    }
    downloadCsv(`asistan-hastalar-${new Date().toISOString().slice(0, 10)}.csv`, toRows(patients))
    toast.success('CSV indirildi')
  }

  function exportPdf() {
    if (patients.length === 0) {
      toast.error('Dışa aktarılacak hasta yok')
      return
    }
    const ok = printReportAsPdf({
      title: 'Hasta listesi',
      subtitle: `${label} · ${patients.length} kayıt · ${new Date().toLocaleString('tr-TR')}`,
      sections: [{ heading: 'Hastalar', rows: toRows(patients) }],
    })
    if (!ok) toast.error('Açılır pencere engellendi — tarayıcıda pop-up’a izin verin')
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" className="h-10 gap-2" onClick={exportCsv}>
        <Download className="h-4 w-4" />
        CSV
      </Button>
      <Button type="button" variant="outline" className="h-10 gap-2" onClick={exportPdf}>
        <FileText className="h-4 w-4" />
        PDF
      </Button>
    </div>
  )
}
