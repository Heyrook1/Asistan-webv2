import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowRight } from 'lucide-react'
import type { Appointment } from '@/lib/types'
import { appointmentStatusLabels, appointmentStatusColors } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/format'

interface RecentAppointmentsProps {
  appointments: Appointment[]
}

export function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Son Randevular</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/appointments" className="gap-1">
            Tümünü Gör
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Henüz randevu bulunmuyor
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
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.service?.name} - {formatDate(appointment.appointment_date)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="secondary"
                      className={appointmentStatusColors[appointment.status]}
                    >
                      {appointmentStatusLabels[appointment.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(appointment.start_time)}
                    </span>
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
