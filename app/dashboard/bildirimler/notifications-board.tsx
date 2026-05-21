'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Archive,
  CalendarCheck,
  CalendarX,
  Check,
  CheckCheck,
  ChevronRight,
  Filter,
  Inbox,
  Search,
  Undo2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

import { cn } from '@/lib/utils'
import { formatDateTime, formatTimeAgo } from '@/lib/format'
import { iconForSubtype } from '@/lib/notifications/icons'
import {
  NOTIFICATION_PRIORITY_COLORS,
  NOTIFICATION_PRIORITY_LABELS,
  NOTIFICATION_SUBTYPE_LABELS,
  NOTIFICATION_TYPE_LABELS,
  type NotificationListItem,
} from '@/lib/notifications/types'
import {
  archiveNotification,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  runNotificationAction,
} from '@/lib/actions/notifications'
import { useNotificationStream } from '@/hooks/use-notification-stream'
import { PushPermissionToggle } from '@/components/dashboard/push-permission'

type Props = {
  businessId: string
  userId: string
  notifications: NotificationListItem[]
}

const TABS = [
  { value: 'all', label: 'Tüm Bildirimler' },
  { value: 'unread', label: 'Okunmamış' },
  { value: 'action', label: 'Aksiyon Gerekenler' },
  { value: 'appointment', label: 'Randevular' },
  { value: 'patient', label: 'Hasta Kartları' },
  { value: 'system', label: 'Sistem' },
] as const

type TabValue = (typeof TABS)[number]['value']

type ReadFilter = 'all' | 'unread' | 'read'

export function NotificationsBoard({ businessId, userId, notifications }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [actorFilter, setActorFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const latestCreatedAt = notifications[0]?.createdAt ?? null
  useNotificationStream({
    businessId,
    userId,
    latestCreatedAt,
    onIncoming: ({ title, message }) =>
      toast(title, { description: message }),
  })

  const selected = useMemo(
    () => notifications.find((n) => n.id === selectedId) ?? null,
    [notifications, selectedId]
  )

  const actorOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const n of notifications) if (n.actor) seen.set(n.actor.id, n.actor.fullName)
    return Array.from(seen.entries()).map(([id, fullName]) => ({ id, fullName }))
  }, [notifications])

  const filtered = useMemo(() => {
    const now = Date.now()
    return notifications.filter((n) => {
      if (readFilter === 'unread' && n.isRead) return false
      if (readFilter === 'read' && !n.isRead) return false
      if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false
      if (actorFilter !== 'all' && n.actor?.id !== actorFilter) return false
      if (dateFilter !== 'all') {
        const ms = new Date(n.createdAt).getTime()
        if (dateFilter === '24h' && now - ms > 24 * 3600 * 1000) return false
        if (dateFilter === '7d' && now - ms > 7 * 24 * 3600 * 1000) return false
        if (dateFilter === '30d' && now - ms > 30 * 24 * 3600 * 1000) return false
      }

      switch (activeTab) {
        case 'unread':
          if (n.isRead) return false
          break
        case 'action':
          if (!n.actionRequired) return false
          break
        case 'appointment':
          if (n.type !== 'APPOINTMENT') return false
          break
        case 'patient':
          if (n.type !== 'PATIENT') return false
          break
        case 'system':
          if (n.type !== 'SYSTEM' && n.type !== 'TEAM') return false
          break
      }

      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const haystack = [
          n.title,
          n.message,
          n.actor?.fullName,
          (n.metadata?.['patientName'] as string | undefined) ?? '',
          (n.metadata?.['serviceName'] as string | undefined) ?? '',
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }

      return true
    })
  }, [notifications, readFilter, priorityFilter, actorFilter, dateFilter, activeTab, search])

  const unreadTotal = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  )

  const actionRequiredTotal = useMemo(
    () => notifications.filter((n) => n.actionRequired && !n.isRead).length,
    [notifications]
  )

  function handleReadAll() {
    startTransition(async () => {
      const result = await markAllNotificationsRead()
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Tüm bildirimler okundu işaretlendi')
      router.refresh()
    })
  }

  function handleToggleRead(n: NotificationListItem) {
    startTransition(async () => {
      const result = n.isRead
        ? await markNotificationUnread({ id: n.id })
        : await markNotificationRead({ id: n.id })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(n.isRead ? 'Okunmadı olarak işaretlendi' : 'Bildirim okundu')
      router.refresh()
    })
  }

  function handleArchive(n: NotificationListItem) {
    startTransition(async () => {
      const result = await archiveNotification({ id: n.id })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Bildirim arşivlendi')
      setSelectedId(null)
      router.refresh()
    })
  }

  function handleRunAction(actionId: string, label: string) {
    startTransition(async () => {
      const result = await runNotificationAction({ actionId })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(result.data.message || `${label} işlemi tamamlandı`)
      if (result.data.link) {
        router.push(result.data.link)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D36]">Bildirim Merkezi</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Size atanan randevuları, hasta kartı güncellemelerini ve sistem gelişmelerini tek
            ekrandan takip edin.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="border-0 bg-[#0C1D36]/5 text-[#0C1D36]">
            Toplam {notifications.length}
          </Badge>
          {unreadTotal > 0 && (
            <Badge className="border-0 bg-[#FF4D4F]/10 text-[#C22326]">
              {unreadTotal} okunmamış
            </Badge>
          )}
          {actionRequiredTotal > 0 && (
            <Badge className="border-0 bg-amber-100 text-amber-800">
              {actionRequiredTotal} aksiyon
            </Badge>
          )}
          {unreadTotal > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReadAll}
              disabled={pending}
              className="gap-1"
            >
              <CheckCheck className="h-4 w-4" />
              Tümünü okundu yap
            </Button>
          )}
          <PushPermissionToggle />
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Bildirim, hasta veya kullanıcı ara…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="hidden h-4 w-4 text-muted-foreground lg:block" />
              <Select value={readFilter} onValueChange={(v) => setReadFilter(v as ReadFilter)}>
                <SelectTrigger className="h-9 min-w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm durumlar</SelectItem>
                  <SelectItem value="unread">Okunmamış</SelectItem>
                  <SelectItem value="read">Okundu</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 min-w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm öncelikler</SelectItem>
                  <SelectItem value="URGENT">Acil</SelectItem>
                  <SelectItem value="HIGH">Yüksek</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="LOW">Düşük</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-9 min-w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm tarihler</SelectItem>
                  <SelectItem value="24h">Son 24 saat</SelectItem>
                  <SelectItem value="7d">Son 7 gün</SelectItem>
                  <SelectItem value="30d">Son 30 gün</SelectItem>
                </SelectContent>
              </Select>
              {actorOptions.length > 0 && (
                <Select value={actorFilter} onValueChange={setActorFilter}>
                  <SelectTrigger className="h-9 min-w-[160px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm kullanıcılar</SelectItem>
                    {actorOptions.map((actor) => (
                      <SelectItem key={actor.id} value={actor.id}>
                        {actor.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
              {TABS.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="rounded-full border border-transparent bg-[#F4F8F9] px-3 py-1.5 text-xs data-[state=active]:border-[#0B7F6F]/40 data-[state=active]:bg-[#0B7F6F]/10 data-[state=active]:text-[#0b7f6f]"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {filtered.length === 0 ? (
                <EmptyView />
              ) : (
                <ul className="space-y-2">
                  {filtered.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onOpen={(id) => {
                        setSelectedId(id)
                        if (!n.isRead) handleToggleRead(n)
                      }}
                      onToggleRead={handleToggleRead}
                      pending={pending}
                    />
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
          {selected && (
            <NotificationDetail
              notification={selected}
              pending={pending}
              onClose={() => setSelectedId(null)}
              onToggleRead={() => handleToggleRead(selected)}
              onArchive={() => handleArchive(selected)}
              onRunAction={handleRunAction}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function EmptyView() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-white px-6 py-16 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B7F6F]/10 text-[#0b7f6f]">
        <Inbox className="h-6 w-6" />
      </div>
      <p className="text-base font-semibold text-[#0C1D36]">Henüz bildiriminiz yok.</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Size atanan randevular ve hasta kartı güncellemeleri burada görünecek.
      </p>
    </div>
  )
}

function NotificationRow({
  notification: n,
  onOpen,
  onToggleRead,
  pending,
}: {
  notification: NotificationListItem
  onOpen: (id: string) => void
  onToggleRead: (n: NotificationListItem) => void
  pending: boolean
}) {
  const Icon = iconForSubtype(n.subtype)
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(n.id)}
        className={cn(
          'group flex w-full items-start gap-3 rounded-2xl border bg-white px-4 py-3 text-left transition hover:border-[#0B7F6F]/40 hover:shadow-sm',
          !n.isRead ? 'border-[#0B7F6F]/30 bg-[#0B7F6F]/[0.03]' : 'border-border/50'
        )}
      >
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            n.priority === 'URGENT'
              ? 'bg-rose-100 text-rose-600'
              : n.priority === 'HIGH'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-[#0B7F6F]/10 text-[#0b7f6f]'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF4D4F]" />}
            <p className="truncate text-sm font-semibold text-[#0C1D36]">{n.title}</p>
            <Badge variant="secondary" className="border-0 bg-[#0C1D36]/5 text-[10px] text-[#0C1D36]/70">
              {NOTIFICATION_TYPE_LABELS[n.type]}
            </Badge>
            {n.priority !== 'NORMAL' && (
              <Badge
                variant="outline"
                className={cn('text-[10px]', NOTIFICATION_PRIORITY_COLORS[n.priority])}
              >
                {NOTIFICATION_PRIORITY_LABELS[n.priority]}
              </Badge>
            )}
            {n.actionRequired && !n.isRead && (
              <Badge className="border-0 bg-amber-100 text-[10px] text-amber-800">
                Aksiyon gerekli
              </Badge>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
            <span>{formatTimeAgo(n.createdAt)}</span>
            {n.actor && (
              <>
                <span>•</span>
                <span>{n.actor.fullName}</span>
              </>
            )}
            {n.subtype && (
              <>
                <span>•</span>
                <span>{NOTIFICATION_SUBTYPE_LABELS[n.subtype as keyof typeof NOTIFICATION_SUBTYPE_LABELS] ?? n.subtype}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleRead(n)
            }}
            disabled={pending}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-[#F7F9FB] hover:text-[#0C1D36]',
              pending && 'opacity-50'
            )}
            aria-label={n.isRead ? 'Okunmadı olarak işaretle' : 'Okundu olarak işaretle'}
          >
            {n.isRead ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          </button>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-[#0C1D36]" />
        </div>
      </button>
    </li>
  )
}

function NotificationDetail({
  notification: n,
  pending,
  onClose,
  onToggleRead,
  onArchive,
  onRunAction,
}: {
  notification: NotificationListItem
  pending: boolean
  onClose: () => void
  onToggleRead: () => void
  onArchive: () => void
  onRunAction: (actionId: string, label: string) => void
}) {
  const Icon = iconForSubtype(n.subtype)
  const meta = n.metadata ?? {}
  const patientName = (meta['patientName'] as string | undefined) ?? null
  const patientId = (meta['patientId'] as string | undefined) ?? null
  const phone = (meta['phone'] as string | undefined) ?? null
  const tags = (meta['tags'] as string[] | undefined) ?? []
  const changedFields = (meta['changedFields'] as string[] | undefined) ?? []
  const serviceName = (meta['serviceName'] as string | undefined) ?? null
  const date = (meta['date'] as string | undefined) ?? null
  const startTime = (meta['startTime'] as string | undefined) ?? null
  const appointmentId = (meta['appointmentId'] as string | undefined) ?? null

  return (
    <>
      <SheetHeader className="space-y-2 border-b px-5 py-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
              n.priority === 'URGENT'
                ? 'bg-rose-100 text-rose-600'
                : n.priority === 'HIGH'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-[#0B7F6F]/10 text-[#0b7f6f]'
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="border-0 bg-[#0C1D36]/5 text-[10px] text-[#0C1D36]/70">
                {NOTIFICATION_TYPE_LABELS[n.type]}
              </Badge>
              {n.priority !== 'NORMAL' && (
                <Badge variant="outline" className={cn('text-[10px]', NOTIFICATION_PRIORITY_COLORS[n.priority])}>
                  {NOTIFICATION_PRIORITY_LABELS[n.priority]}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px]">
                {n.isRead ? 'Okundu' : 'Okunmamış'}
              </Badge>
            </div>
            <SheetTitle className="text-lg font-bold text-[#0C1D36]">{n.title}</SheetTitle>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(n.createdAt)} • {formatTimeAgo(n.createdAt)}
              {n.actor && <> • {n.actor.fullName}</>}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-[#F7F9FB] hover:text-[#0C1D36]"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </SheetHeader>

      <ScrollArea className="flex-1 px-5 py-4">
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-[#0C1D36]/90">{n.message}</p>

          {n.type === 'APPOINTMENT' && (appointmentId || patientName) && (
            <div className="rounded-2xl border bg-[#F4F8F9]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Randevu özeti
              </p>
              <dl className="space-y-2 text-sm">
                {patientName && (
                  <Row label="Hasta" value={patientName} />
                )}
                {serviceName && <Row label="Hizmet" value={serviceName} />}
                {date && startTime && <Row label="Tarih" value={`${date} ${startTime}`} />}
                {meta['doctorName'] != null && (
                  <Row label="Doktor" value={String(meta['doctorName'])} />
                )}
              </dl>
              {appointmentId && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full gap-1"
                >
                  <Link href={`/dashboard/randevular?id=${appointmentId}`}>
                    <CalendarCheck className="h-4 w-4" />
                    Randevuya Git
                  </Link>
                </Button>
              )}
            </div>
          )}

          {n.type === 'PATIENT' && (patientId || patientName) && (
            <div className="rounded-2xl border bg-[#F4F8F9]/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Hasta özeti
              </p>
              <dl className="space-y-2 text-sm">
                {patientName && <Row label="Hasta" value={patientName} />}
                {phone && <Row label="Telefon" value={phone} />}
                {meta['createdBy'] != null && (
                  <Row label="Oluşturan" value={String(meta['createdBy'])} />
                )}
                {meta['updatedBy'] != null && (
                  <Row label="Güncelleyen" value={String(meta['updatedBy'])} />
                )}
                {tags.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="w-24 shrink-0 text-xs text-muted-foreground">Etiketler</span>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((t) => (
                        <Badge key={t} variant="secondary" className="border-0 bg-[#0B7F6F]/10 text-[10px] text-[#0b7f6f]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {changedFields.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="w-24 shrink-0 text-xs text-muted-foreground">Değişen alanlar</span>
                    <div className="flex flex-wrap gap-1">
                      {changedFields.map((f) => (
                        <Badge key={f} variant="outline" className="text-[10px]">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </dl>
              {patientId && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full gap-1"
                >
                  <Link href={`/dashboard/hastalar/${patientId}`}>
                    <ChevronRight className="h-4 w-4" />
                    Hasta Kartını Aç
                  </Link>
                </Button>
              )}
            </div>
          )}

          {n.actions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Hızlı aksiyonlar
              </p>
              <div className="flex flex-wrap gap-2">
                {n.actions.map((a) => {
                  const isCancel = a.actionType === 'APPOINTMENT_CANCEL'
                  const isApprove = a.actionType === 'APPOINTMENT_APPROVE'
                  const Icon = isApprove
                    ? CalendarCheck
                    : isCancel
                      ? CalendarX
                      : ChevronRight
                  if (a.status !== 'PENDING') {
                    return (
                      <Badge key={a.id} variant="outline" className="text-[10px]">
                        <Icon className="mr-1 h-3 w-3" />
                        {a.label} • {a.status === 'COMPLETED' ? 'tamamlandı' : 'iptal'}
                      </Badge>
                    )
                  }
                  return (
                    <Button
                      key={a.id}
                      size="sm"
                      variant={isApprove ? 'default' : isCancel ? 'destructive' : 'outline'}
                      disabled={pending}
                      onClick={() => onRunAction(a.id, a.label)}
                      className={cn(
                        'gap-1',
                        isApprove && 'bg-[#0B7F6F] text-white hover:bg-[#0fb39c]'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {a.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold uppercase tracking-wide">Geçmiş</p>
            <p>{formatDateTime(n.createdAt)} — Bildirim oluşturuldu{n.actor ? ` (${n.actor.fullName})` : ''}</p>
            {n.readAt && <p>{formatDateTime(n.readAt)} — Okundu olarak işaretlendi</p>}
            {n.archivedAt && <p>{formatDateTime(n.archivedAt)} — Arşivlendi</p>}
            {n.actions
              .filter((a) => a.completedAt)
              .map((a) => (
                <p key={a.id}>
                  {formatDateTime(a.completedAt!)} — {a.label} (
                  {a.status === 'COMPLETED' ? 'tamamlandı' : 'iptal'})
                </p>
              ))}
          </div>
        </div>
      </ScrollArea>

      <div className="border-t bg-white px-5 py-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleRead}
            disabled={pending}
            className="gap-1"
          >
            {n.isRead ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            {n.isRead ? 'Okunmadı olarak işaretle' : 'Okundu olarak işaretle'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onArchive}
            disabled={pending}
            className="gap-1"
          >
            <Archive className="h-4 w-4" />
            Arşivle
          </Button>
        </div>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <dt className="w-24 shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm text-[#0C1D36]">{value}</dd>
    </div>
  )
}

