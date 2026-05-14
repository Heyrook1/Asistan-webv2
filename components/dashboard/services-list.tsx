'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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
import { MoreHorizontal, Pencil, Trash2, Clock, Briefcase } from 'lucide-react'
import type { Service } from '@/lib/types'
import { formatCurrency, formatDuration } from '@/lib/format'
import { EditServiceDialog } from './edit-service-dialog'

interface ServicesListProps {
  services: Service[]
  providerId: string
}

export function ServicesList({ services, providerId }: ServicesListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editService, setEditService] = useState<Service | null>(null)

  async function toggleActive(id: string, isActive: boolean) {
    const supabase = createClient()
    const { error } = await supabase
      .from('services')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('provider_id', providerId)

    if (error) {
      toast.error('Güncelleme başarısız')
      return
    }

    toast.success(isActive ? 'Hizmet aktif edildi' : 'Hizmet pasif edildi')
    router.refresh()
  }

  async function deleteService() {
    if (!deleteId) return

    const supabase = createClient()
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', deleteId)
      .eq('provider_id', providerId)

    if (error) {
      toast.error('Silme başarısız')
      return
    }

    toast.success('Hizmet silindi')
    setDeleteId(null)
    router.refresh()
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Henüz Hizmet Yok</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Müşterilerinizin randevu alabilmesi için hizmetlerinizi ekleyin.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="relative">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {service.description}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditService(service)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => setDeleteId(service.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDuration(service.duration_minutes)}
                </div>
                <Badge variant={service.is_active ? 'default' : 'secondary'}>
                  {service.is_active ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(service.price, service.currency)}
                </span>
                <Switch
                  checked={service.is_active}
                  onCheckedChange={(checked) => toggleActive(service.id, checked)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <EditServiceDialog
        service={editService}
        providerId={providerId}
        open={!!editService}
        onOpenChange={(open) => !open && setEditService(null)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hizmeti Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu hizmeti silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={deleteService} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
