'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/lib/types'
import { appointmentStatusColors } from '@/lib/types'
import { formatTime } from '@/lib/format'

interface CalendarViewProps {
  appointments: Appointment[]
  currentMonth: number
  currentYear: number
}

const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

export function CalendarView({ appointments, currentMonth, currentYear }: CalendarViewProps) {
  const router = useRouter()

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  
  // Get first day of month (0 = Sunday, adjust for Monday start)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  // Group appointments by date
  const appointmentsByDate: Record<string, Appointment[]> = {}
  appointments.forEach((apt) => {
    const date = apt.appointment_date
    if (!appointmentsByDate[date]) {
      appointmentsByDate[date] = []
    }
    appointmentsByDate[date].push(apt)
  })

  // Navigate to previous/next month
  function navigate(direction: 'prev' | 'next') {
    let newMonth = currentMonth
    let newYear = currentYear

    if (direction === 'prev') {
      newMonth--
      if (newMonth < 0) {
        newMonth = 11
        newYear--
      }
    } else {
      newMonth++
      if (newMonth > 11) {
        newMonth = 0
        newYear++
      }
    }

    router.push(`/dashboard/calendar?month=${newMonth}&year=${newYear}`)
  }

  // Check if a day is today
  const today = new Date()
  const isToday = (day: number) => 
    day === today.getDate() && 
    currentMonth === today.getMonth() && 
    currentYear === today.getFullYear()

  // Generate calendar days
  const days = []
  for (let i = 0; i < startDay; i++) {
    days.push(null) // Empty cells before first day
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-40 text-center">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <Button variant="outline" size="icon" onClick={() => navigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            const now = new Date()
            router.push(`/dashboard/calendar?month=${now.getMonth()}&year=${now.getFullYear()}`)
          }}
        >
          Bugün
        </Button>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {days.map((day, index) => {
            if (day === null) {
              return (
                <div key={`empty-${index}`} className="bg-muted/30 min-h-24 p-2" />
              )
            }

            const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayAppointments = appointmentsByDate[dateString] || []

            return (
              <div
                key={day}
                className={cn(
                  'bg-background min-h-24 p-2 relative',
                  isToday(day) && 'bg-primary/5'
                )}
              >
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm',
                    isToday(day) && 'bg-primary text-primary-foreground font-bold'
                  )}
                >
                  {day}
                </span>
                
                <div className="mt-1 space-y-1">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <div
                      key={apt.id}
                      className={cn(
                        'text-xs px-1.5 py-0.5 rounded truncate',
                        appointmentStatusColors[apt.status]
                      )}
                      title={`${formatTime(apt.start_time)} - ${apt.customer?.user?.full_name || 'Müşteri'}`}
                    >
                      {formatTime(apt.start_time)} {apt.service?.name}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{dayAppointments.length - 3} daha
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
