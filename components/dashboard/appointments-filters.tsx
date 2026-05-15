'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppointmentsFiltersProps {
  currentStatus: string
  currentDate?: string
  counts: {
    all: number
    requested: number
    pending_provider_approval: number
    confirmed: number
    completed: number
    cancelled: number
  }
}

const statusFilters = [
  { value: 'all', label: 'Tümü' },
  { value: 'requested', label: 'Talepler' },
  { value: 'pending_provider_approval', label: 'Onay Bekleyen' },
  { value: 'confirmed', label: 'Onaylı' },
  { value: 'completed', label: 'Tamamlanan' },
  { value: 'cancelled', label: 'İptal' },
]

export function AppointmentsFilters({ currentStatus, currentDate, counts }: AppointmentsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleStatusChange(status: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    router.push(`/dashboard/appointments?${params.toString()}`)
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set('date', e.target.value)
    } else {
      params.delete('date')
    }
    router.push(`/dashboard/appointments?${params.toString()}`)
  }

  function clearFilters() {
    router.push('/dashboard/appointments')
  }

  const hasFilters = currentStatus !== 'all' || currentDate

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const count = counts[filter.value as keyof typeof counts] || 0
          const isActive = currentStatus === filter.value

          return (
            <Button
              key={filter.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange(filter.value)}
              className={cn(
                'gap-2',
                isActive && 'shadow-sm'
              )}
            >
              {filter.label}
              <Badge
                variant={isActive ? 'secondary' : 'outline'}
                className={cn(
                  'text-xs',
                  isActive && 'bg-primary-foreground/20 text-primary-foreground'
                )}
              >
                {count}
              </Badge>
            </Button>
          )
        })}
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={currentDate || ''}
            onChange={handleDateChange}
            className="w-auto"
          />
        </div>
        
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Filtreleri Temizle
          </Button>
        )}
      </div>
    </div>
  )
}
