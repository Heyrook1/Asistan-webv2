'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  CalendarClock,
  Check,
  Flag,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createReminder, deleteReminder, toggleReminder } from '@/lib/actions/reminders'

export type ReminderPriority = 'LOW' | 'NORMAL' | 'HIGH'

export type ReminderItem = {
  id: string
  title: string
  note: string | null
  dueAt: string | null
  isDone: boolean
  priority: ReminderPriority
  createdAt: string
}

const PRIORITY_TONE: Record<ReminderPriority, { dot: string; label: string; chip: string }> = {
  LOW: { dot: 'bg-slate-300', label: 'Düşük', chip: 'bg-slate-100 text-slate-600' },
  NORMAL: { dot: 'bg-sky-400', label: 'Normal', chip: 'bg-sky-50 text-sky-700' },
  HIGH: { dot: 'bg-rose-500', label: 'Acil', chip: 'bg-rose-100 text-rose-700' },
}

const dateTimeFmt = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

function describeDue(iso: string | null): { label: string; tone: 'overdue' | 'today' | 'soon' | 'future' } | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((dueStart.getTime() - startOfDay.getTime()) / (1000 * 60 * 60 * 24))

  if (d.getTime() < now.getTime() && diffDays < 0) return { label: `${Math.abs(diffDays)} gün gecikti`, tone: 'overdue' }
  if (diffDays === 0) {
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return { label: `Bugün ${hh}:${mm}`, tone: 'today' }
  }
  if (diffDays === 1) {
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return { label: `Yarın ${hh}:${mm}`, tone: 'soon' }
  }
  if (diffDays > 1 && diffDays <= 7) return { label: `${diffDays} gün sonra`, tone: 'soon' }
  return { label: dateTimeFmt.format(d), tone: 'future' }
}

export function RemindersCard({ initialReminders }: { initialReminders: ReminderItem[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useState<ReminderItem[] | null>(null)
  const [title, setTitle] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [priority, setPriority] = useState<ReminderPriority>('NORMAL')
  const [showDetails, setShowDetails] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const reminders = optimistic ?? initialReminders

  const { pendingItems, doneItems } = useMemo(() => {
    const pendingArr: ReminderItem[] = []
    const doneArr: ReminderItem[] = []
    for (const r of reminders) {
      if (r.isDone) doneArr.push(r)
      else pendingArr.push(r)
    }
    return { pendingItems: pendingArr, doneItems: doneArr }
  }, [reminders])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      toast.error('Bir başlık girin')
      return
    }
    const payload = { title: trimmed, dueAt: dueAt || undefined, priority }
    startTransition(async () => {
      const result = await createReminder(payload)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Hatırlatma eklendi')
      setTitle('')
      setDueAt('')
      setPriority('NORMAL')
      setShowDetails(false)
      setOptimistic(null)
      router.refresh()
    })
  }

  function handleToggle(item: ReminderItem) {
    const next = reminders.map((r) => (r.id === item.id ? { ...r, isDone: !r.isDone } : r))
    setOptimistic(next)
    startTransition(async () => {
      const result = await toggleReminder({ id: item.id, isDone: !item.isDone })
      if (!result.ok) {
        toast.error(result.error)
        setOptimistic(null)
        return
      }
      setOptimistic(null)
      router.refresh()
    })
  }

  function handleDelete(item: ReminderItem) {
    const next = reminders.filter((r) => r.id !== item.id)
    setOptimistic(next)
    startTransition(async () => {
      const result = await deleteReminder({ id: item.id })
      if (!result.ok) {
        toast.error(result.error)
        setOptimistic(null)
        return
      }
      toast.success('Hatırlatma silindi')
      setOptimistic(null)
      router.refresh()
    })
  }

  function openDatePicker() {
    const input = dateInputRef.current
    if (!input) return
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker()
        return
      } catch {
        /* ignore */
      }
    }
    input.click()
  }

  const totalActive = pendingItems.length

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-3 p-4 lg:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 text-amber-600">
              <Bell className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#0C1D36]">Hatırlatma & Notlar</h2>
              <p className="text-[11px] text-muted-foreground">
                {totalActive > 0 ? `${totalActive} aktif hatırlatma` : 'Hızlı not ve hatırlatma ekleyin'}
              </p>
            </div>
          </div>
          {totalActive > 0 && (
            <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-[#12C8AD] px-2 text-[11px] font-bold text-white">
              {totalActive}
            </span>
          )}
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-border/60 bg-white p-2 shadow-inner-sm">
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Hatırlatma veya not ekleyin..."
              className="h-11 flex-1 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0 md:h-10"
              maxLength={200}
              aria-label="Hatırlatma başlığı"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowDetails((s) => !s)}
              className={cn(
                'h-9 w-9 shrink-0 rounded-xl text-muted-foreground',
                (showDetails || dueAt || priority !== 'NORMAL') && 'bg-slate-50 text-[#0C1D36]'
              )}
              aria-label="Tarih ve öncelik"
              aria-pressed={showDetails}
            >
              <CalendarClock className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={pending || !title.trim()}
              className="h-9 w-9 shrink-0 rounded-xl bg-[#12C8AD] text-white shadow-sm hover:bg-[#10b49c] disabled:opacity-50"
              aria-label="Ekle"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {showDetails && (
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-dashed border-border/60 pt-2">
              <button
                type="button"
                onClick={openDatePicker}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors',
                  dueAt
                    ? 'border-sky-200 bg-sky-50 text-sky-700'
                    : 'border-border bg-white text-muted-foreground hover:border-sky-300'
                )}
              >
                <CalendarClock className="h-3.5 w-3.5" />
                {dueAt ? new Date(dueAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Tarih ekle'}
                {dueAt && (
                  <X
                    className="ml-1 h-3 w-3 hover:text-rose-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDueAt('')
                    }}
                  />
                )}
              </button>

              <input
                ref={dateInputRef}
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="pointer-events-none absolute h-0 w-0 opacity-0"
                tabIndex={-1}
                aria-hidden
              />

              <div className="flex items-center gap-1 rounded-full border border-border bg-white p-0.5">
                {(['LOW', 'NORMAL', 'HIGH'] as ReminderPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors',
                      priority === p
                        ? p === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : p === 'NORMAL'
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-slate-100 text-slate-600'
                        : 'text-muted-foreground hover:bg-slate-50'
                    )}
                    aria-pressed={priority === p}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', PRIORITY_TONE[p].dot)} />
                    {PRIORITY_TONE[p].label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        {reminders.length === 0 ? (
          <EmptyHint />
        ) : (
          <ul className="space-y-1.5">
            {pendingItems.map((item) => (
              <ReminderRow
                key={item.id}
                item={item}
                onToggle={() => handleToggle(item)}
                onDelete={() => handleDelete(item)}
              />
            ))}
            {doneItems.length > 0 && (
              <>
                <li className="px-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Tamamlananlar ({doneItems.length})
                </li>
                {doneItems.slice(0, 3).map((item) => (
                  <ReminderRow
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggle(item)}
                    onDelete={() => handleDelete(item)}
                  />
                ))}
              </>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyHint() {
  return (
    <div className="rounded-xl border border-dashed border-border/70 bg-slate-50/60 px-4 py-6 text-center">
      <Sparkles className="mx-auto h-5 w-5 text-[#12C8AD]" />
      <p className="mt-2 text-sm font-semibold text-[#0C1D36]">Henüz hatırlatma yok</p>
      <p className="mt-1 text-[12px] text-muted-foreground">
        Yukarıdan ilk notunuzu veya hatırlatmanızı ekleyin.
      </p>
    </div>
  )
}

function ReminderRow({
  item,
  onToggle,
  onDelete,
}: {
  item: ReminderItem
  onToggle: () => void
  onDelete: () => void
}) {
  const due = describeDue(item.dueAt)
  const tonePill =
    due?.tone === 'overdue'
      ? 'bg-rose-50 text-rose-700 border-rose-100'
      : due?.tone === 'today'
        ? 'bg-amber-50 text-amber-700 border-amber-100'
        : due?.tone === 'soon'
          ? 'bg-sky-50 text-sky-700 border-sky-100'
          : 'bg-slate-50 text-slate-600 border-slate-100'

  return (
    <li
      className={cn(
        'group flex items-start gap-2.5 rounded-xl border bg-white px-2.5 py-2 transition-colors',
        item.isDone ? 'border-border/40 opacity-70' : 'border-border/60 hover:border-[#12C8AD]/40'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          item.isDone
            ? 'border-[#12C8AD] bg-[#12C8AD] text-white'
            : 'border-border bg-white hover:border-[#12C8AD]'
        )}
        aria-label={item.isDone ? 'Tamamlanmadı olarak işaretle' : 'Tamamlandı olarak işaretle'}
        aria-pressed={item.isDone}
      >
        {item.isDone && <Check className="h-3 w-3" />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-[14px] font-medium leading-snug',
            item.isDone ? 'text-muted-foreground line-through' : 'text-[#0C1D36]'
          )}
        >
          {item.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {due && (
            <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold', tonePill)}>
              <CalendarClock className="h-3 w-3" />
              {due.label}
            </span>
          )}
          {item.priority !== 'NORMAL' && (
            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', PRIORITY_TONE[item.priority].chip)}>
              <Flag className="h-3 w-3" />
              {PRIORITY_TONE[item.priority].label}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        aria-label="Sil"
      >
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-rose-500" />
      </button>
    </li>
  )
}
