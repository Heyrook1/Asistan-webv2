'use client'

import { UserMinus, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ROLE_LABELS } from '@/lib/rbac'

import type { Teammate, ThreadData } from './mesajlar-types'
import { UserAvatar } from './mesajlar-user-avatar'

type GroupMembersSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  participants: ThreadData['participants']
  selfUserId: string
  addableTeammates: Teammate[]
  pending: boolean
  onAddMember: (userId: string) => void
  onRemoveMember: (userId: string) => void
}

export function GroupMembersSheet({
  open,
  onOpenChange,
  participants,
  selfUserId,
  addableTeammates,
  pending,
  onAddMember,
  onRemoveMember,
}: GroupMembersSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="border-b pb-3">
          <SheetTitle className="text-brand-ink">Grup üyeleri</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Aktif üyeler</p>
            <ul className="divide-y divide-border/40 rounded-2xl border bg-white">
              {participants.map((p) => (
                <li key={p.userId} className="flex items-center gap-3 px-3 py-3">
                  <UserAvatar fullName={p.user.fullName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">{p.user.fullName}</p>
                  </div>
                  {p.userId !== selfUserId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => onRemoveMember(p.userId)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-brand-danger-strong"
                      title="Gruptan çıkar"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Ekle</p>
            {addableTeammates.length === 0 ? (
              <p className="rounded-2xl border border-dashed bg-white p-4 text-sm text-muted-foreground">
                Eklenebilecek başka ekip üyesi yok.
              </p>
            ) : (
              <ul className="divide-y divide-border/40 rounded-2xl border bg-white">
                {addableTeammates.map((t) => (
                  <li key={t.userId}>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onAddMember(t.userId)}
                      className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-dashboard-surface disabled:opacity-60"
                    >
                      <UserAvatar fullName={t.fullName} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-ink">{t.fullName}</p>
                        <p className="text-[11px] text-muted-foreground">{ROLE_LABELS[t.role]}</p>
                      </div>
                      <UserPlus className="h-4 w-4 text-brand-teal" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
