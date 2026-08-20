'use client'

import { useState, type ReactNode } from 'react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { resolvePatientChartTab, type PatientChartTab } from '@/lib/patients/chart-tabs'

export type PatientChartTabCounts = {
  timeline: number
  appointments: number
  medications: number
  prescriptions: number
  labs: number
  files: number
  notes: number
  intake: number
  allergies: number
  treatments: number
  invoices: number
}

export function PatientChartTabs({
  initialTab,
  counts,
  canViewFiles,
  showFinans,
  children,
}: {
  initialTab?: string | null
  counts: PatientChartTabCounts
  canViewMedicalNotes?: boolean
  canViewFiles: boolean
  canManageAppointments?: boolean
  showFinans: boolean
  children: ReactNode
}) {
  const [value, setValue] = useState<PatientChartTab>(() => {
    const resolved = resolvePatientChartTab(initialTab)
    if (resolved === 'finans' && !showFinans) return 'genel'
    return resolved
  })

  const klinikCount =
    counts.prescriptions +
    counts.medications +
    counts.allergies +
    counts.treatments +
    counts.notes +
    counts.intake
  const belgelerCount = counts.labs + (canViewFiles ? counts.files : 0)
  const gecmisCount = counts.timeline + counts.appointments

  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        const resolved = resolvePatientChartTab(next)
        if (resolved === 'finans' && !showFinans) {
          setValue('genel')
          return
        }
        setValue(resolved)
      }}
      className="space-y-3 lg:space-y-4"
    >
      <div className="-mx-4 sticky top-[7.25rem] z-10 bg-dashboard-bg/95 px-4 backdrop-blur md:static md:top-auto md:mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none lg:top-[68px]">
        <div className="rounded-xl border border-border/50 bg-white p-1.5 md:p-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <TabsList className="inline-flex h-auto min-w-0 flex-1 items-stretch gap-1 bg-transparent p-0">
              <TabsTrigger
                value="genel"
                className="h-10 shrink-0 rounded-full px-3 text-[13px] data-[state=active]:bg-brand-teal/10 data-[state=active]:text-brand-teal md:h-9 md:rounded-md md:text-sm"
              >
                Genel
              </TabsTrigger>
              <TabsTrigger
                value="klinik"
                className="h-10 shrink-0 rounded-full px-3 text-[13px] data-[state=active]:bg-brand-teal/10 data-[state=active]:text-brand-teal md:h-9 md:rounded-md md:text-sm"
              >
                Klinik ({klinikCount})
              </TabsTrigger>
              {showFinans ? (
                <TabsTrigger
                  value="finans"
                  className="h-10 shrink-0 rounded-full px-3 text-[13px] data-[state=active]:bg-brand-teal/10 data-[state=active]:text-brand-teal md:h-9 md:rounded-md md:text-sm"
                >
                  Finans ({counts.invoices})
                </TabsTrigger>
              ) : null}
              <TabsTrigger
                value="belgeler"
                className="h-10 shrink-0 rounded-full px-3 text-[13px] data-[state=active]:bg-brand-teal/10 data-[state=active]:text-brand-teal md:h-9 md:rounded-md md:text-sm"
              >
                Belgeler ({belgelerCount})
              </TabsTrigger>
              <TabsTrigger
                value="gecmis"
                className="h-10 shrink-0 rounded-full px-3 text-[13px] data-[state=active]:bg-brand-teal/10 data-[state=active]:text-brand-teal md:h-9 md:rounded-md md:text-sm"
              >
                Geçmiş ({gecmisCount})
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </div>
      {children}
    </Tabs>
  )
}
