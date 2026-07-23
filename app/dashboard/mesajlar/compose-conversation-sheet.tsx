'use client'

import { UserCircle2, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ROLE_LABELS } from '@/lib/rbac'
import { cn } from '@/lib/utils'

import type { Teammate } from './mesajlar-types'
import { UserAvatar } from './mesajlar-user-avatar'

type ComposeConversationSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupMode: boolean
  onGroupModeChange: (groupMode: boolean) => void
  groupTitle: string
  onGroupTitleChange: (title: string) => void
  groupUsers: string[]
  onGroupUsersChange: (users: string[] | ((prev: string[]) => string[])) => void
  teammates: Teammate[]
  pending: boolean
  onStartConversation: (userId: string) => void
  onCreateGroup: () => void
}

export function ComposeConversationSheet({
  open,
  onOpenChange,
  groupMode,
  onGroupModeChange,
  groupTitle,
  onGroupTitleChange,
  groupUsers,
  onGroupUsersChange,
  teammates,
  pending,
  onStartConversation,
  onCreateGroup,
}: ComposeConversationSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="border-b pb-3">
          <SheetTitle className="text-brand-ink">Yeni sohbet</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={!groupMode ? 'default' : 'outline'} onClick={() => onGroupModeChange(false)} className={!groupMode ? 'bg-brand-teal text-white hover:bg-brand-teal-hover' : ''}>
              <UserCircle2 className="mr-1.5 h-4 w-4" />
              Bire bir
            </Button>
            <Button type="button" variant={groupMode ? 'default' : 'outline'} onClick={() => onGroupModeChange(true)} className={groupMode ? 'bg-brand-teal text-white hover:bg-brand-teal-hover' : ''}>
              <Users className="mr-1.5 h-4 w-4" />
              Grup
            </Button>
          </div>
          {groupMode && <Input value={groupTitle} onChange={(e) => onGroupTitleChange(e.target.value)} placeholder="Grup adı" />}
          <p className="text-xs text-muted-foreground">
            Sohbet başlatmak istediğiniz ekip üyesini seçin.
          </p>
          {teammates.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-white p-6 text-center">
              <UserCircle2 className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium text-brand-ink">Ekipte başka kullanıcı yok</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ekip ayarlarından bir üye davet edip aktive ettikten sonra sohbet başlatabilirsiniz.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/40 rounded-2xl border bg-white">
              {teammates.map((t) => (
                <li key={t.userId}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!groupMode) {
                        onStartConversation(t.userId)
                        return
                      }
                      onGroupUsersChange((prev) =>
                        prev.includes(t.userId)
                          ? prev.filter((id) => id !== t.userId)
                          : [...prev, t.userId]
                      )
                    }}
                    disabled={pending}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-dashboard-surface disabled:opacity-60"
                  >
                    <UserAvatar fullName={t.fullName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-ink">{t.fullName}</p>
                      <p className="text-[11px] text-muted-foreground">{ROLE_LABELS[t.role]}</p>
                    </div>
                    {groupMode && (
                      <span
                        className={cn(
                          'h-5 w-5 rounded-full border',
                          groupUsers.includes(t.userId) && 'border-brand-teal bg-brand-teal'
                        )}
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {groupMode && teammates.length > 0 && (
            <Button
              type="button"
              disabled={pending || !groupTitle.trim() || groupUsers.length === 0}
              onClick={onCreateGroup}
              className="w-full bg-brand-teal text-white hover:bg-brand-teal-hover"
            >
              Grup Sohbeti Oluştur
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
