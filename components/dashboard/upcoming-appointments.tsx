import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowRight, Clock } from 'lucide-react'
import type { Appointment } from '@/lib/types'
import { formatDate, formatTime, formatRelativeDate } from '@/lib/format'

interface UpcomingAppointmentsProps {
  appointments: Appointment[]
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Yaklaşan Randevular</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/calendar" className="gap-1">
            Takvime Git
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Yaklaşan randevu bulunmuyor
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const customerName = appointment.customer?.user?.full_name || 'Müşteri'
              const initials = customerName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()

              return (
                <div
                  key={appointment.id}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.service?.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="bg-background">
                      {formatRelativeDate(appointment.appointment_date)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(appointment.start_time)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
