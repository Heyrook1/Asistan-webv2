'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { STATUS_FILTERS } from './calendar-types'

export function CalendarFilters({
  staff,
  services,
  staffFilter,
  serviceFilter,
  statusFilter,
  onStaffFilterChange,
  onServiceFilterChange,
  onStatusFilterChange,
}: {
  staff: { id: string; name: string }[]
  services: { id: string; name: string }[]
  staffFilter: string
  serviceFilter: string
  statusFilter: string
  onStaffFilterChange: (value: string) => void
  onServiceFilterChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
}) {
  return (
    <Card className="hidden lg:block">
      <CardContent className="grid gap-2 p-3 md:grid-cols-3">
        <div>
          <label htmlFor="calendar-staff-filter" className="sr-only">
            Personel filtrele
          </label>
          <Select value={staffFilter} onValueChange={onStaffFilterChange}>
            <SelectTrigger id="calendar-staff-filter" aria-label="Personel filtrele">
              <SelectValue placeholder="Personel filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm personel</SelectItem>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="calendar-service-filter" className="sr-only">
            Hizmet filtrele
          </label>
          <Select value={serviceFilter} onValueChange={onServiceFilterChange}>
            <SelectTrigger id="calendar-service-filter" aria-label="Hizmet filtrele">
              <SelectValue placeholder="Hizmet filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm hizmetler</SelectItem>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="calendar-status-filter" className="sr-only">
            Durum filtrele
          </label>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger id="calendar-status-filter" aria-label="Durum filtrele">
              <SelectValue placeholder="Durum filtrele" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
