'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function CalendarShareDialog({
  open,
  onOpenChange,
  bookingLink,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingLink: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Takvimi Paylaş</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <label htmlFor="calendar-share-link" className="sr-only">
            Online randevu bağlantısı
          </label>
          <Input id="calendar-share-link" readOnly value={bookingLink} aria-label="Online randevu bağlantısı" />
          <Button
            onClick={() => {
              void navigator.clipboard.writeText(bookingLink)
              toast.success('Bağlantı kopyalandı')
            }}
            className="bg-brand-teal text-white hover:bg-brand-teal-hover"
          >
            Bağlantıyı Kopyala
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(bookingLink)}`, '_blank')}
          >
            WhatsApp ile Paylaş
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              window.open(`mailto:?subject=Online Randevu&body=${encodeURIComponent(bookingLink)}`)
            }
          >
            E-posta ile Paylaş
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
