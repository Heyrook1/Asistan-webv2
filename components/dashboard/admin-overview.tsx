'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  Calendar,
  CalendarCheck,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Scissors,
  Send,
  Share2,
  Sparkles,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { AppointmentFormDrawer, type AppointmentOption } from '@/components/dashboard/appointment-form-drawer'
import { PatientFormDrawer } from '@/components/dashboard/patient-form-drawer'
import { ServiceFormDialog } from '@/components/dashboard/service-form-dialog'
import { RemindersCard, type ReminderItem } from '@/components/dashboard/reminders-card'
import { formatTime, trMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type LookupData = {
  patients: AppointmentOption[]
  services: (AppointmentOption & { durationMin: number })[]
  staff: AppointmentOption[]
  bookingSlug: string
}

type OverviewStats = {
  todayAppointments: number
  pendingAppointments: number
  activePatients: number
  confirmedAppointments: number
  monthlyRevenue: number
}

type CalendarEvent = {
  id: string
  patientId: string
  patientName: string
  serviceName: string
  staffName: string | null
  date: string
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
}

type SetupStep = {
  title: string
  done: boolean
}

type Suggestion = {
  title: string
  description: string
  tone: 'teal' | 'orange' | 'violet'
  href?: string
}

type Modal = 'appointment' | 'patient' | 'service' | 'share' | null

const monthFormatter = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' })
const weekdayLabels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts', 'Paz']

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7))
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AdminOverview({
  businessName,
  stats,
  setupSteps,
  suggestions,
  calendarEvents,
  upcomingAppointments,
  reminders,
  lookups,
  canCreatePatient,
  canCreateAppointment,
  canManageService,
  canViewAnalytics,
}: {
  businessName: string
  stats: OverviewStats
  setupSteps: SetupStep[]
  suggestions: Suggestion[]
  calendarEvents: CalendarEvent[]
  upcomingAppointments: CalendarEvent[]
  reminders: ReminderItem[]
  lookups: LookupData
  canCreatePatient: boolean
  canCreateAppointment: boolean
  canManageService: boolean
  canViewAnalytics: boolean
}) {
  const router = useRouter()
  const [modal, setModal] = useState<Modal>(null)
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [calendarOpen, setCalendarOpen] = useState(true)

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 30_000)
    return () => window.clearInterval(timer)
  }, [router])

  const bookingLink = useMemo(() => {
    if (typeof window === 'undefined') return `/randevu/${lookups.bookingSlug}`
    return `${window.location.origin}/randevu/${lookups.bookingSlug}`
  }, [lookups.bookingSlug])

  const completedSteps = setupSteps.filter((step) => step.done).length
  const setupProgress = setupSteps.length ? Math.round((completedSteps / setupSteps.length) * 100) : 0
  const setupComplete = setupSteps.length > 0 && completedSteps === setupSteps.length

  const days = useMemo(() => {
    const start = startOfWeek(cursor)
    return Array.from({ length: 42 }, (_, index) => addDays(start, index))
  }, [cursor])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const event of calendarEvents) {
      if (!map.has(event.date)) map.set(event.date, [])
      map.get(event.date)!.push(event)
    }
    return map
  }, [calendarEvents])

  const statCards = [
    {
      title: 'Bugünkü Randevular',
      value: stats.todayAppointments,
      icon: Calendar,
      tone: 'teal' as const,
      hint: 'Onaylı ajanda',
    },
    {
      title: 'Bekleyen Onay',
      value: stats.pendingAppointments,
      icon: Clock,
      tone: 'orange' as const,
      hint: 'Onay bekliyor',
    },
    {
      title: 'Toplam Müşteri',
      value: stats.activePatients,
      icon: Users,
      tone: 'violet' as const,
      hint: 'Aktif kayıt',
    },
    {
      title: 'Onaylanan',
      value: stats.confirmedAppointments,
      icon: CalendarCheck,
      tone: 'amber' as const,
      hint: 'Tüm zamanlar',
    },
    canViewAnalytics
      ? {
      title: 'Aylık Ciro',
      value: trMoney.format(stats.monthlyRevenue),
      icon: Wallet,
      tone: 'green' as const,
      hint: 'Bu ay',
        }
      : null,
  ].filter((card): card is NonNullable<typeof card> => Boolean(card))

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0C1D36] lg:text-[26px]">Genel Bakış</h1>
          <p className="mt-1 text-[13px] text-muted-foreground lg:text-sm">
            {businessName}
          </p>
        </div>
        <div className="hidden flex-wrap gap-2 lg:flex">
          {canCreateAppointment && (
            <Button onClick={() => setModal('appointment')} className="h-11 gap-2 bg-[#08AFC0] text-white shadow-lg shadow-cyan-600/20 hover:bg-[#079CAE]">
              <CalendarPlus className="h-4 w-4" />
              Randevu Oluştur
            </Button>
          )}
          {canCreatePatient && (
            <Button variant="outline" onClick={() => setModal('patient')} className="h-11 gap-2 bg-white">
              <UserPlus className="h-4 w-4" />
              Müşteri Ekle
            </Button>
          )}
          <Button variant="outline" onClick={() => setModal('share')} className="h-11 gap-2 bg-white">
            <Share2 className="h-4 w-4" />
            Takvimi Paylaş
          </Button>
        </div>
      </div>

      {/* Stats: 2-col grid on mobile, expands on desktop */}
      <div className="grid grid-cols-2 gap-2.5 md:gap-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <Card key={card.title} className="border-border/50 shadow-sm">
            <CardContent className="flex items-start gap-2.5 p-3 md:items-center md:gap-3 md:p-4">
              <div className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:h-12 md:w-12',
                card.tone === 'teal' && 'bg-cyan-50 text-cyan-600',
                card.tone === 'orange' && 'bg-orange-50 text-orange-600',
                card.tone === 'violet' && 'bg-violet-50 text-violet-600',
                card.tone === 'amber' && 'bg-amber-50 text-amber-600',
                card.tone === 'green' && 'bg-emerald-50 text-emerald-600'
              )}>
                <card.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground line-clamp-1 md:text-[11px]">{card.title}</p>
                <p className="mt-0.5 text-xl font-bold text-[#0C1D36] md:text-2xl">{card.value}</p>
                <p className="mt-0.5 hidden text-[11px] text-muted-foreground line-clamp-1 md:block">{card.hint}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reminders & quick notes */}
      <RemindersCard initialReminders={reminders} />

      {/* Setup steps + calendar + suggestions */}
      <div
        className={cn(
          'grid gap-4',
          setupComplete ? 'xl:grid-cols-[1.25fr_1.55fr]' : 'xl:grid-cols-[1fr_1.25fr_1.55fr]'
        )}
      >
        {!setupComplete && (
          <Card className="shadow-sm">
            <CardContent className="p-4 lg:p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-[#0C1D36]">Kurulumu tamamlayın</h2>
                  <p className="mt-1 text-[12px] text-muted-foreground">İlk randevuya hazırlanmak için adımlar.</p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-[#12C8AD] text-xs font-bold text-[#0C1D36]">
                  {completedSteps}/{setupSteps.length}
                </div>
              </div>
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[#12C8AD] transition-[width]" style={{ width: `${setupProgress}%` }} />
              </div>
              <ul className="space-y-2.5">
                {setupSteps.map((step, index) => (
                  <li key={step.title} className="flex items-center gap-3 text-sm">
                    <span className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      step.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    )}>
                      {step.done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span className={cn('flex-1', step.done ? 'text-muted-foreground line-through' : 'font-semibold text-[#0C1D36]')}>
                      {step.title}
                    </span>
                    {!step.done && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Calendar — collapsible on mobile, always visible on desktop */}
        <Card className="shadow-sm">
          <CardContent className="p-4 lg:p-5">
            <button
              type="button"
              onClick={() => setCalendarOpen((open) => !open)}
              className="flex w-full items-center justify-between gap-2 xl:cursor-default"
              aria-expanded={calendarOpen}
            >
              <h2 className="text-sm font-bold text-[#0C1D36]">Aylık Takvim</h2>
              <span className="flex items-center gap-2">
                <span className="text-xs font-medium capitalize text-muted-foreground">{monthFormatter.format(cursor)}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform xl:hidden',
                    calendarOpen && 'rotate-180'
                  )}
                />
              </span>
            </button>

            <div className={cn('mt-3', !calendarOpen && 'hidden xl:block')}>
              <div className="mb-3 flex items-center justify-end gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Önceki ay">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8" onClick={() => {
                  const now = new Date()
                  setCursor(new Date(now.getFullYear(), now.getMonth(), 1))
                }}>
                  Bugün
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Sonraki ay">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                {weekdayLabels.map((day) => (
                  <span key={day} className="pb-1 text-[10px] font-medium text-muted-foreground">{day}</span>
                ))}
                {days.map((day) => {
                  const iso = toIsoDate(day)
                  const dayEvents = eventsByDate.get(iso) ?? []
                  const inMonth = day.getMonth() === cursor.getMonth()
                  const isToday = iso === toIsoDate(new Date())
                  return (
                    <Link
                      key={iso}
                      href={`/dashboard/takvim?date=${iso}`}
                      className={cn(
                        'mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-full text-xs font-semibold transition-colors hover:bg-cyan-50',
                        !inMonth && 'text-slate-300',
                        isToday && 'bg-[#08AFC0] text-white hover:bg-[#08AFC0]'
                      )}
                      title={dayEvents.length ? `${dayEvents.length} onaylı randevu` : 'Randevu yok'}
                    >
                      <span>{day.getDate()}</span>
                      {dayEvents.length > 0 && (
                        <span className={cn('mt-0.5 h-1 w-1 rounded-full', isToday ? 'bg-white' : 'bg-[#08AFC0]')} />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions: swipe cards on mobile, list on desktop */}
        <Card className="shadow-sm">
          <CardContent className="p-4 lg:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <h2 className="text-sm font-bold text-[#0C1D36]">Asistan AI Önerileri</h2>
              </div>
              <span className="rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-700">AI</span>
            </div>
            <div className="flex flex-col gap-2">
              {suggestions.map((suggestion) => (
                <Link
                  key={suggestion.title}
                  href={suggestion.href ?? '/dashboard'}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-white',
                    suggestion.tone === 'teal' && 'border-emerald-100 bg-emerald-50/70',
                    suggestion.tone === 'orange' && 'border-orange-100 bg-orange-50/70',
                    suggestion.tone === 'violet' && 'border-violet-100 bg-violet-50/70'
                  )}
                >
                  <span className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    suggestion.tone === 'teal' && 'bg-emerald-100 text-emerald-700',
                    suggestion.tone === 'orange' && 'bg-orange-100 text-orange-700',
                    suggestion.tone === 'violet' && 'bg-violet-100 text-violet-700'
                  )}>
                    {suggestion.tone === 'teal' ? <CalendarCheck className="h-5 w-5" /> : suggestion.tone === 'orange' ? <Clock className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#0C1D36] line-clamp-1">{suggestion.title}</span>
                    <span className="block text-xs text-muted-foreground line-clamp-2">{suggestion.description}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
            {canViewAnalytics && (
              <Link href="/dashboard/analitik" className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-[#08AFC0]">
                Tüm önerileri görüntüle <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming + quick actions */}
      <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <Card className="shadow-sm">
          <CardContent className="p-4 lg:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0C1D36]">Yaklaşan Randevular</h2>
              <Link href="/dashboard/randevular" className="inline-flex items-center gap-1 text-xs font-medium text-[#08AFC0]">
                Tümü <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Yaklaşan randevu yok.</p>
            ) : (
              <>
                {/* Mobile: card list */}
                <ul className="space-y-2 md:hidden">
                  {upcomingAppointments.map((appointment) => (
                    <li key={appointment.id}>
                      <Link
                        href={`/dashboard/hastalar/${appointment.patientId}`}
                        className="flex items-center gap-3 rounded-xl border bg-white p-3 active:bg-slate-50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[12px] font-bold text-violet-700">
                          {initials(appointment.patientName)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[#0C1D36]">{appointment.patientName}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {appointment.serviceName}{appointment.staffName ? ` • ${appointment.staffName}` : ''}
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="block text-sm font-semibold text-[#0C1D36]">{formatTime(appointment.startTime)}</span>
                          <span className={cn(
                            'mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold',
                            appointment.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                          )}>
                            {appointment.status === 'CONFIRMED' ? 'Onaylı' : 'Bekliyor'}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Tablet+: table */}
                <div className="hidden md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] font-medium text-muted-foreground">
                        <th className="pb-3">Saat</th>
                        <th className="pb-3">Müşteri</th>
                        <th className="pb-3">Hizmet</th>
                        <th className="pb-3">Çalışan</th>
                        <th className="pb-3">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {upcomingAppointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-[#F7F9FB]">
                          <td className="py-3 font-semibold text-[#0C1D36]">{formatTime(appointment.startTime)}</td>
                          <td className="py-3">
                            <Link href={`/dashboard/hastalar/${appointment.patientId}`} className="flex items-center gap-2">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">
                                {initials(appointment.patientName)}
                              </span>
                              <span>
                                <span className="block font-medium text-[#0C1D36]">{appointment.patientName}</span>
                                <span className="block text-[11px] text-muted-foreground">{appointment.date}</span>
                              </span>
                            </Link>
                          </td>
                          <td className="py-3 text-[#0C1D36]">{appointment.serviceName}</td>
                          <td className="py-3 text-muted-foreground">{appointment.staffName ?? 'Atanmadı'}</td>
                          <td className="py-3">
                            <span className={cn(
                              'rounded-full px-2 py-1 text-[11px] font-semibold',
                              appointment.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                            )}>
                              {appointment.status === 'CONFIRMED' ? 'Onaylandı' : 'Onay Bekliyor'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions — desktop only, mobile uses FAB */}
        <Card className="hidden shadow-sm xl:block">
          <CardContent className="p-5">
            <h2 className="mb-4 text-sm font-bold text-[#0C1D36]">Hızlı İşlemler</h2>
            <div className="grid grid-cols-2 gap-3">
              {canCreateAppointment && (
                <QuickAction icon={<CalendarPlus />} label="Randevu Oluştur" onClick={() => setModal('appointment')} />
              )}
              {canCreatePatient && (
                <QuickAction icon={<UserPlus />} label="Müşteri Ekle" onClick={() => setModal('patient')} />
              )}
              {canManageService && (
                <QuickAction icon={<Scissors />} label="Hizmet Ekle" onClick={() => setModal('service')} />
              )}
              <QuickAction icon={<Clock />} label="Müsaitlik Düzenle" href="/dashboard/takvim" />
              <QuickAction icon={<Send />} label="Toplu Mesaj Gönder" onClick={() => toast.info('Toplu mesaj özelliği sonraki entegrasyon adımında bağlanacak.')} />
              {canViewAnalytics && <QuickAction icon={<BarChart3 />} label="Rapor Oluştur" href="/dashboard/analitik" />}
            </div>
          </CardContent>
        </Card>
      </div>

      <AppointmentFormDrawer
        open={modal === 'appointment'}
        onOpenChange={(open) => setModal(open ? 'appointment' : null)}
        patients={lookups.patients}
        services={lookups.services}
        staff={lookups.staff}
      />
      <PatientFormDrawer open={modal === 'patient'} onOpenChange={(open) => setModal(open ? 'patient' : null)} />
      <ServiceFormDialog
        open={modal === 'service'}
        onOpenChange={(open) => setModal(open ? 'service' : null)}
        onSaved={() => router.refresh()}
      />
      <Dialog open={modal === 'share'} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Takvimi Paylaş</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input readOnly value={bookingLink} />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(bookingLink)
                toast.success('Bağlantı kopyalandı')
              }}
              className="bg-[#08AFC0] text-white hover:bg-[#079CAE]"
            >
              Bağlantıyı Kopyala
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function QuickAction({
  icon,
  label,
  href,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
}) {
  const content = (
    <span className="flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-xl border bg-white p-3 text-center text-xs font-semibold text-[#0C1D36] shadow-sm transition-colors hover:border-[#08AFC0]/40 hover:bg-cyan-50/40">
      <span className="text-[#08AFC0] [&_svg]:h-6 [&_svg]:w-6">{icon}</span>
      {label}
    </span>
  )

  if (href) return <Link href={href}>{content}</Link>
  return <button type="button" onClick={onClick}>{content}</button>
}
