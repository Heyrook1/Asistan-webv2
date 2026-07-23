'use client'

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
import type { Member } from './team-board-types'

export function TeamDeactivateDialog({
  open,
  member,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  member?: Member
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{member?.isActive ? 'Erişimi durdur' : 'Erişimi yeniden aç'}</AlertDialogTitle>
          <AlertDialogDescription>
            {member?.fullName} kullanıcısının erişim durumu değiştirilecek. Bu işlem kullanıcının panele erişimini
            etkiler.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-brand-teal text-white hover:bg-brand-teal-hover">
            Onayla
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
