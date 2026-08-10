'use client'

import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ROLE_LABELS, type Permission } from '@/lib/rbac'
import type { Member } from './team-board-types'
import { GROUPS, PERMISSION_CATALOG, initials, permissionSet } from './team-board-utils'

export function PermissionDrawer({
  member,
  permissions,
  pending,
  onClose,
  onToggle,
  onSave,
  onReset,
}: {
  member: Member | null
  permissions: Permission[]
  pending: boolean
  onClose: () => void
  onToggle: (permission: Permission) => void
  onSave: () => void
  onReset: () => void
}) {
  const selected = permissionSet(permissions)
  return (
    <Sheet open={Boolean(member)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle>Yetkileri düzenle</SheetTitle>
        </SheetHeader>
        {member && (
          <div className="space-y-5 p-5">
            <div className="rounded-2xl border bg-dashboard-surface p-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: member.color }}
                >
                  {initials(member.fullName)}
                </span>
                <div>
                  <p className="font-bold text-brand-ink">{member.fullName}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                  <Badge className="mt-2 border-0 bg-brand-teal/10 text-brand-teal">
                    {ROLE_LABELS[member.role]}
                  </Badge>
                  {member.role === 'ISLETME_SAHIBI' ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      İşletme sahibi ciro (finans) yetkisi üründe sabittir; bu rolden kaldırılamaz.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {GROUPS.map((group) => (
              <div key={group} className="space-y-2">
                <h3 className="text-sm font-bold text-brand-ink">{group}</h3>
                <div className="overflow-hidden rounded-2xl border">
                  {PERMISSION_CATALOG.filter((permission) => permission.group === group).map((permission) => (
                    <div
                      key={permission.key}
                      className="flex items-center justify-between gap-4 border-b p-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-brand-ink">{permission.label}</p>
                          {permission.critical && (
                            <Badge variant="outline" className="bg-amber-50 text-[10px] text-amber-700">
                              Kritik
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                      <Switch
                        checked={member.role === 'ISLETME_SAHIBI' || selected.has(permission.key)}
                        disabled={member.role === 'ISLETME_SAHIBI'}
                        onCheckedChange={() => onToggle(permission.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="sticky bottom-0 -mx-5 flex gap-2 border-t bg-white p-5">
              <Button type="button" variant="outline" className="flex-1" onClick={onReset}>
                <RotateCcw className="mr-2 h-4 w-4" /> Varsayılan Role Sıfırla
              </Button>
              <Button
                type="button"
                className="flex-1 bg-brand-teal text-white hover:bg-brand-teal-hover"
                disabled={pending}
                onClick={onSave}
              >
                Değişiklikleri Kaydet
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
