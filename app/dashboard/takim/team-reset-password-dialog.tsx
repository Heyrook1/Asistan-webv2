'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { resetTeamMemberPassword } from '@/lib/actions/team'
import type { Member } from './team-board-types'

export function ResetPasswordDialog({
  open,
  member,
  onClose,
}: {
  open: boolean
  member?: Member
  onClose: () => void
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [password, setPassword] = useState('')

  function close() {
    setPassword('')
    onClose()
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!member) return
    startTransition(async () => {
      const result = await resetTeamMemberPassword({ id: member.id, password })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Şifre sıfırlandı', {
        description: `${member.fullName} yeni şifreyle giriş yapabilir.`,
      })
      close()
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Şifre sıfırla</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div className="rounded-xl border bg-dashboard-surface p-3 text-sm">
            <p className="font-semibold text-brand-ink">{member?.fullName}</p>
            <p className="text-xs text-muted-foreground">{member?.email}</p>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Yeni geçici şifre *</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={close}>
              İptal
            </Button>
            <Button type="submit" disabled={pending} className="bg-brand-teal text-white hover:bg-brand-teal-hover">
              {pending ? 'Kaydediliyor...' : 'Şifreyi sıfırla'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
