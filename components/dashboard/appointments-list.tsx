'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { 
  MoreHorizontal, 
  Check, 
  X, 
  Clock,
  Phone,
  Mail,
  Calendar,
  Loader2
} from 'lucide-react'
import type { Appointment, AppointmentStatus } from '@/lib/types'
import { appointmentStatusLabels, appointmentStatusColors } from '@/lib/types'
import { formatDate, formatTime, formatCurrency } from '@/lib/format'

interface AppointmentsListProps {
  appointments: Appointment[]
  providerId: string
}

export function AppointmentsList({ appointments, providerId }: AppointmentsListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    appointmentId: string
    action: 'approve' | 'reject' | 'cancel' | 'complete'
  }>({ open: false, appointmentId: '', action: 'approve' })

  async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
    setLoading(id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('provider_id', providerId)

      if (error) throw error

      toast.success('Randevu güncellendi')
      router.refresh()
    } catch (error) {
      toast.error('Bir hata oluştu')
      console.error(error)
    } finally {
      setLoading(null)
      setConfirmDialog({ ...confirmDialog, open: false })
    }
  }

  function handleAction(appointmentId: string, action: 'approve' | 'reject' | 'cancel' | 'complete') {
    setConfirmDialog({ open: true, appointmentId, action })
  }

  function confirmAction() {
    const { appointmentId, action } = confirmDialog
    const statusMap: Record<string, AppointmentStatus> = {
      approve: 'confirmed',
      reject: 'rejected',
      cancel: 'cancelled_by_provider',
      complete: 'completed',
    }
    updateAppointmentStatus(appointmentId, statusMap[action])
  }

  const actionLabels = {
    approve: { title: 'Randevuyu Onayla', description: 'Bu randevuyu onaylamak istediğinize emin misiniz?' },
    reject: { title: 'Randevuyu Reddet', description: 'Bu randevuyu reddetmek istediğinize emin misiniz?' },
    cancel: { title: 'Randevuyu İptal Et', description: 'Bu randevuyu iptal etmek istediğinize emin misiniz?' },
    complete: { title: 'Randevuyu Tamamla', description: 'Bu randevuyu tamamlandı olarak işaretlemek istediğinize emin misiniz?' },
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Randevu Bulunamadı</h3>
          <p className="text-muted-foreground text-center">
            Seçili filtrelere uygun randevu bulunmuyor.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {appointments.map((appointment) => {
          const customerName = appointment.customer?.user?.full_name || 'Müşteri'
          const customerPhone = appointment.customer?.user?.phone
          const customerEmail = appointment.customer?.user?.email
          const initials = customerName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()

          const canApprove = ['requested', 'pending_provider_approval'].includes(appointment.status)
          const canComplete = appointment.status === 'confirmed'
          const canCancel = ['requested', 'pending_provider_approval', 'confirmed'].includes(appointment.status)

          return (
            <Card key={appointment.id} className="overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Customer Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{customerName}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {appointment.service?.name}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {customerPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customerPhone}
                          </span>
                        )}
                        {customerEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customerEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="flex flex-col sm:items-end gap-2">
                    <Badge
                      variant="secondary"
                      className={appointmentStatusColors[appointment.status]}
                    >
                      {appointmentStatusLabels[appointment.status]}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(appointment.appointment_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                    </div>
                    <div className="font-semibold text-primary">
                      {formatCurrency(appointment.price, appointment.currency)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2">
                    {canApprove && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAction(appointment.id, 'approve')}
                          disabled={loading === appointment.id}
                          className="flex-1 sm:flex-none"
                        >
                          {loading === appointment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Onayla
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(appointment.id, 'reject')}
                          disabled={loading === appointment.id}
                          className="flex-1 sm:flex-none"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reddet
                        </Button>
                      </>
                    )}
                    
                    {(canComplete || canCancel) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" disabled={loading === appointment.id}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canComplete && (
                            <DropdownMenuItem onClick={() => handleAction(appointment.id, 'complete')}>
                              <Check className="h-4 w-4 mr-2" />
                              Tamamlandı İşaretle
                            </DropdownMenuItem>
                          )}
                          {canComplete && canCancel && <DropdownMenuSeparator />}
                          {canCancel && (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleAction(appointment.id, 'cancel')}
                            >
                              <X className="h-4 w-4 mr-2" />
                              İptal Et
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {appointment.customer_notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Müşteri Notu:</span> {appointment.customer_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionLabels[confirmDialog.action]?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {actionLabels[confirmDialog.action]?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              Devam Et
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
