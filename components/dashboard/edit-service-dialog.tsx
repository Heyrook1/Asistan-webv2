'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import type { Service } from '@/lib/types'

interface EditServiceDialogProps {
  service: Service | null
  providerId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditServiceDialog({ service, providerId, open, onOpenChange }: EditServiceDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0,
  })

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        duration_minutes: service.duration_minutes,
        price: service.price,
      })
    }
  }, [service])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!service) return
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('services')
        .update({
          name: formData.name,
          description: formData.description || null,
          duration_minutes: formData.duration_minutes,
          price: formData.price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', service.id)
        .eq('provider_id', providerId)

      if (error) throw error

      toast.success('Hizmet güncellendi')
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast.error('Güncelleme başarısız')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hizmeti Düzenle</DialogTitle>
          <DialogDescription>
            Hizmet bilgilerini güncelleyin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Hizmet Adı</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Açıklama</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Süre (dakika)</Label>
              <Input
                id="edit-duration"
                type="number"
                min={5}
                step={5}
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Fiyat (₺)</Label>
              <Input
                id="edit-price"
                type="number"
                min={0}
                step={0.01}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Vazgeç
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
