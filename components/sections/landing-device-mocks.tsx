'use client'

import type { ReactNode } from 'react'
import {
  Bell,
  CalendarDays,
  HeartPulse,
  Home,
  LayoutDashboard,
  LineChart,
  MapPin,
  Search,
  Star,
  User,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Lang = 'tr' | 'en'

const NAV = [
  { icon: LayoutDashboard, active: true },
  { icon: CalendarDays, active: false },
  { icon: Users, active: false },
  { icon: LineChart, active: false },
  { icon: Bell, active: false },
] as const

export function ClinicDashboardMock({
  className,
  lang = 'tr',
  compact = false,
}: {
  className?: string
  lang?: Lang
  compact?: boolean
}) {
  const copy =
    lang === 'en'
      ? {
          today: 'Today',
          appointments: 'Appointments',
          waiting: 'Waiting',
          revenue: 'Day revenue',
          agenda: 'Agenda',
          rows: [
            { time: '09:30', name: 'Ayşe K.', type: 'Control', status: 'Done' },
            { time: '10:15', name: 'Mehmet Y.', type: 'Exam', status: 'In room' },
            { time: '11:00', name: 'Elif S.', type: 'Consult', status: 'Waiting' },
            { time: '14:00', name: 'Can D.', type: 'Follow-up', status: 'Booked' },
          ],
        }
      : {
          today: 'Bugün',
          appointments: 'Randevu',
          waiting: 'Bekleyen',
          revenue: 'Gün ciro',
          agenda: 'Ajanda',
          rows: [
            { time: '09:30', name: 'Ayşe K.', type: 'Kontrol', status: 'Bitti' },
            { time: '10:15', name: 'Mehmet Y.', type: 'Muayene', status: 'Odada' },
            { time: '11:00', name: 'Elif S.', type: 'Konsültasyon', status: 'Bekliyor' },
            { time: '14:00', name: 'Can D.', type: 'Kontrol', status: 'Planlı' },
          ],
        }

  const kpis = [
    { label: copy.appointments, value: '18', tone: 'blue' as const },
    { label: copy.waiting, value: '3', tone: 'amber' as const },
    { label: copy.revenue, value: '₺12.4k', tone: 'emerald' as const },
  ]

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[1.35rem] border border-black/[0.06] bg-white',
        'shadow-[0_40px_80px_-32px_rgba(0,113,227,0.45),0_16px_40px_-20px_rgba(15,23,42,0.25)]',
        'ring-1 ring-white/80',
        className,
      )}
      aria-hidden
    >
      <div className="flex items-center gap-2 border-b border-slate-100/90 bg-gradient-to-b from-[#F8FAFC] to-white px-3.5 py-2.5 sm:px-4">
        <span className="size-2.5 rounded-full bg-[#FF5F57]" />
        <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="size-2.5 rounded-full bg-[#28C840]" />
        <div className="ml-2 flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-slate-100/80 px-2.5 py-1">
          <span className="truncate text-[10px] font-medium text-slate-400 sm:text-[11px]">
            health.asistan.online / panel
          </span>
        </div>
      </div>

      <div className={cn('grid h-full min-h-0', compact ? 'grid-cols-[52px_1fr]' : 'grid-cols-[64px_1fr] sm:grid-cols-[76px_1fr]')}>
        <aside className="flex flex-col items-center gap-2.5 border-r border-slate-100 bg-[#F4F6F8] py-3">
          <div className="flex size-7 items-center justify-center rounded-xl bg-[#0071E3] text-[10px] font-black text-white sm:size-8">
            A
          </div>
          {NAV.map((item, i) => (
            <div
              key={i}
              className={cn(
                'flex size-7 items-center justify-center rounded-xl sm:size-8',
                item.active
                  ? 'bg-white text-[#0071E3] shadow-sm ring-1 ring-[#0071E3]/20'
                  : 'text-slate-400',
              )}
            >
              <item.icon className="size-3.5" />
            </div>
          ))}
        </aside>

        <div className={cn('flex min-h-0 flex-col space-y-2.5 bg-[#FAFBFC]', compact ? 'p-2.5' : 'p-3.5 sm:p-4')}>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0071E3]">
                Asistan Health
              </p>
              <p className={cn('font-bold text-[#1D1D1F]', compact ? 'text-sm' : 'text-base sm:text-lg')}>
                {copy.today}
              </p>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100 sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Live
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className={cn(
                  'rounded-xl border bg-white p-2.5 shadow-sm',
                  kpi.tone === 'blue' && 'border-[#0071E3]/15',
                  kpi.tone === 'amber' && 'border-amber-100',
                  kpi.tone === 'emerald' && 'border-emerald-100',
                )}
              >
                <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[10px]">
                  {kpi.label}
                </p>
                <p
                  className={cn(
                    'mt-1 font-black tracking-tight',
                    compact ? 'text-base' : 'text-lg sm:text-xl',
                    kpi.tone === 'blue' && 'text-[#0071E3]',
                    kpi.tone === 'amber' && 'text-amber-600',
                    kpi.tone === 'emerald' && 'text-emerald-600',
                  )}
                >
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-50 px-3 py-2">
              <p className="text-[11px] font-bold text-[#1D1D1F]">{copy.agenda}</p>
              <CalendarDays className="size-3.5 text-[#0071E3]" />
            </div>
            <ul className="divide-y divide-slate-50">
              {copy.rows.slice(0, compact ? 4 : 4).map((row) => (
                <li key={row.time + row.name} className="flex items-center gap-2.5 px-3 py-2">
                  <span className="w-10 shrink-0 text-[11px] font-bold tabular-nums text-[#0071E3]">
                    {row.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-[#1D1D1F]">{row.name}</p>
                    <p className="truncate text-[10px] text-slate-400">{row.type}</p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold',
                      row.status === 'Bekliyor' || row.status === 'Waiting'
                        ? 'bg-amber-50 text-amber-700'
                        : row.status === 'Odada' || row.status === 'In room'
                          ? 'bg-[#EEF6FF] text-[#0071E3]'
                          : row.status === 'Bitti' || row.status === 'Done'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-50 text-slate-500',
                    )}
                  >
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {!compact ? (
            <div className="hidden grid-cols-7 gap-1 sm:grid">
              {(lang === 'en'
                ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                : ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
              ).map((d, i) => (
                <div
                  key={d}
                  className={cn(
                    'rounded-lg px-1 py-2 text-center',
                    i === 3 ? 'bg-[#0071E3] text-white' : 'bg-slate-50 text-slate-500',
                  )}
                >
                  <p className="text-[8px] font-semibold uppercase">{d}</p>
                  <p className="mt-0.5 text-[11px] font-bold">{10 + i}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function BookingPhoneMock({
  className,
  lang = 'tr',
  size = 'default',
}: {
  className?: string
  lang?: Lang
  /** `gallery` = fixed height that fits product cards without overflow */
  size?: 'default' | 'gallery'
}) {
  const isGallery = size === 'gallery'
  const copy =
    lang === 'en'
      ? {
          brand: 'Asistan Booking',
          greeting: 'Good morning',
          search: 'Clinic or doctor',
          nearby: 'Nearby',
          clinic: 'Lefkoşa Dental Studio',
          clinic2: 'Girne Physio Center',
          city: 'Nicosia',
          city2: 'Kyrenia',
          slot: 'Today · 11:30',
          slot2: 'Tomorrow · 09:00',
          book: 'Request',
          home: 'Home',
          bookings: 'Bookings',
          searchNav: 'Search',
          passport: 'Passport',
          profile: 'Profile',
          rating: '4.8',
        }
      : {
          brand: 'Asistan Rezervasyon',
          greeting: 'Günaydın',
          search: 'Klinik veya hekim',
          nearby: 'Yakınımda',
          clinic: 'Lefkoşa Dental Studio',
          clinic2: 'Girne Fizyo Merkezi',
          city: 'Lefkoşa',
          city2: 'Girne',
          slot: 'Bugün · 11:30',
          slot2: 'Yarın · 09:00',
          book: 'Talep et',
          home: 'Ana Sayfa',
          bookings: 'Randevular',
          searchNav: 'Ara',
          passport: 'Pasaport',
          profile: 'Profil',
          rating: '4.8',
        }

  return (
    <div
        className={cn(
        'relative overflow-hidden border-[5px] border-[#1D1D1F] bg-[#F6F7F9]',
        'shadow-[0_28px_56px_-20px_rgba(15,23,42,0.45)]',
        isGallery ? 'h-full w-full rounded-[1.75rem] border-b-0' : 'rounded-[2rem]',
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-1.5">
        <div className={cn('rounded-full bg-black', isGallery ? 'h-3.5 w-16' : 'h-5 w-[4.5rem]')} />
      </div>

      <div
        className={cn(
          'flex h-full flex-col bg-[#F6F7F9]',
          isGallery ? 'px-2.5 pb-1 pt-6' : 'aspect-[9/17] px-3 pb-2.5 pt-8',
        )}
      >
        {/* Status */}
        <div className="mb-1.5 flex items-center justify-between px-0.5 text-[8px] font-semibold text-slate-400">
          <span>09:41</span>
          <span className="flex items-center gap-0.5">
            <span className="h-1 w-2.5 rounded-[1px] bg-slate-300" />
            <span className="h-1.5 w-3 rounded-[2px] border border-slate-300">
              <span className="ml-[1px] mt-[1px] block h-[3px] w-[60%] rounded-[1px] bg-emerald-500" />
            </span>
          </span>
        </div>

        {/* App header */}
        <div className="mb-2">
          <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#0071E3]">
            {copy.brand}
          </p>
          <p className={cn('font-extrabold tracking-tight text-[#1D1D1F]', isGallery ? 'text-[11px]' : 'text-sm')}>
            {copy.greeting}
          </p>
        </div>

        {/* Search */}
        <div className="mb-2 flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-2 py-1.5 shadow-sm">
          <Search className="size-3 shrink-0 text-[#0071E3]" />
          <span className="truncate text-[9px] font-medium text-slate-400">{copy.search}</span>
        </div>

        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[9px] font-bold text-[#1D1D1F]">{copy.nearby}</p>
          <span className="rounded-full bg-[#EEF6FF] px-1.5 py-0.5 text-[8px] font-bold text-[#0071E3]">
            2.1 km
          </span>
        </div>

        {/* Clinic cards — real product pattern */}
        <div className="min-h-0 flex-1 space-y-1.5 overflow-hidden">
          <div className="rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
            <div className="flex gap-1.5">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#EEF6FF]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0071E3]/25 to-[#0071E3]/5" />
                <MapPin className="absolute inset-0 m-auto size-4 text-[#0071E3]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-1">
                  <p className="truncate text-[10px] font-bold leading-tight text-[#1D1D1F]">
                    {copy.clinic}
                  </p>
                  <span className="inline-flex shrink-0 items-center gap-0.5 text-[8px] font-bold text-amber-600">
                    <Star className="size-2.5 fill-amber-400 text-amber-400" />
                    {copy.rating}
                  </span>
                </div>
                <p className="truncate text-[8px] text-slate-400">{copy.city}</p>
                <div className="mt-1 flex items-center justify-between gap-1">
                  <span className="truncate rounded-md bg-emerald-50 px-1 py-0.5 text-[7px] font-bold text-emerald-700">
                    {copy.slot}
                  </span>
                  <span className="shrink-0 rounded-md bg-[#0071E3] px-1.5 py-0.5 text-[7px] font-bold text-white">
                    {copy.book}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/60 bg-white/90 p-1.5 opacity-90">
            <div className="flex gap-1.5">
              <div className="h-11 w-11 shrink-0 rounded-lg bg-slate-100" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-bold text-[#1D1D1F]">{copy.clinic2}</p>
                <p className="truncate text-[8px] text-slate-400">{copy.city2}</p>
                <span className="mt-1 inline-block rounded-md bg-slate-50 px-1 py-0.5 text-[7px] font-bold text-slate-500">
                  {copy.slot2}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom dock — matches ClientBottomNav */}
        <div className="mt-1.5 rounded-t-2xl border border-slate-200/90 bg-white px-0.5 pb-0.5 pt-1 shadow-[0_-6px_20px_rgba(15,23,42,0.06)]">
          <div className="flex items-end">
            <div className="flex flex-1 flex-col items-center gap-0.5 pb-0.5">
              <div className="flex size-6 items-center justify-center rounded-lg bg-[#0071E3]/12 text-[#0071E3]">
                <Home className="size-3" strokeWidth={2.5} />
              </div>
              <span className="text-[6px] font-extrabold text-[#0071E3]">{copy.home}</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5 pb-0.5">
              <div className="flex size-6 items-center justify-center rounded-lg text-slate-400">
                <CalendarDays className="size-3" />
              </div>
              <span className="text-[6px] font-semibold text-slate-400">{copy.bookings}</span>
            </div>
            <div className="flex flex-1 flex-col items-center">
              <div className="-mt-3 flex size-8 items-center justify-center rounded-full border-[3px] border-white bg-[#0071E3] text-white shadow-md shadow-[#0071E3]/35">
                <Search className="size-3.5" strokeWidth={2.5} />
              </div>
              <span className="mt-0.5 text-[6px] font-bold text-slate-500">{copy.searchNav}</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5 pb-0.5">
              <div className="flex size-6 items-center justify-center rounded-lg text-slate-400">
                <HeartPulse className="size-3" />
              </div>
              <span className="text-[6px] font-semibold text-slate-400">{copy.passport}</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-0.5 pb-0.5">
              <div className="flex size-6 items-center justify-center rounded-lg text-slate-400">
                <User className="size-3" />
              </div>
              <span className="text-[6px] font-semibold text-slate-400">{copy.profile}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GalleryStage({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative h-[300px] overflow-hidden bg-[linear-gradient(165deg,#EEF6FF_0%,#F8FAFC_42%,#EEF0F3_100%)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function GalleryScreenMock({
  variant,
  lang = 'tr',
}: {
  variant: 'dashboard' | 'appointments' | 'calendar' | 'reports' | 'mobile' | 'notifications'
  lang?: Lang
}) {
  if (variant === 'mobile') {
    return (
      <GalleryStage className="px-5 pb-0 pt-3">
        <div className="mx-auto h-full w-[min(100%,178px)]">
          <BookingPhoneMock lang={lang} size="gallery" className="h-full rounded-t-[1.75rem] border-b-0 shadow-2xl" />
        </div>
      </GalleryStage>
    )
  }

  if (variant === 'dashboard') {
    return (
      <GalleryStage className="p-3">
        <ClinicDashboardMock
          lang={lang}
          compact
          className="h-full rounded-xl shadow-[0_16px_40px_-20px_rgba(0,113,227,0.35)] ring-0 [&>div:last-child]:min-h-0"
        />
      </GalleryStage>
    )
  }

  if (variant === 'calendar') {
    const days = Array.from({ length: 35 }, (_, i) => i + 1)
    const labels =
      lang === 'en'
        ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
        : ['P', 'S', 'Ç', 'P', 'C', 'C', 'P']
    return (
      <GalleryStage className="p-3">
        <div className="flex h-full flex-col rounded-xl border border-white/80 bg-white p-3.5 shadow-sm" aria-hidden>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#0071E3]">
                Asistan Health
              </p>
              <p className="text-sm font-extrabold text-[#1D1D1F]">
                {lang === 'en' ? 'March 2026' : 'Mart 2026'}
              </p>
            </div>
            <CalendarDays className="size-4 text-[#0071E3]" />
          </div>
          <div className="mb-1.5 grid grid-cols-7 gap-1">
            {labels.map((d, i) => (
              <p key={`${d}-${i}`} className="text-center text-[9px] font-bold text-slate-400">
                {d}
              </p>
            ))}
          </div>
          <div className="grid flex-1 grid-cols-7 gap-1 content-start">
            {days.map((d) => (
              <div
                key={d}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-lg text-[10px] font-bold',
                  d === 12 || d === 18
                    ? 'bg-[#0071E3] text-white shadow-sm'
                    : d === 15
                      ? 'bg-emerald-100 text-emerald-700'
                      : d > 31
                        ? 'text-slate-300'
                        : 'bg-slate-50 text-slate-600',
                )}
              >
                {d > 31 ? d - 31 : d}
              </div>
            ))}
          </div>
        </div>
      </GalleryStage>
    )
  }

  if (variant === 'reports') {
    const bars = [42, 68, 50, 82, 58, 74, 92]
    return (
      <GalleryStage className="p-3">
        <div className="flex h-full flex-col rounded-xl border border-white/80 bg-white p-3.5 shadow-sm" aria-hidden>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#0071E3]">
            Asistan Health
          </p>
          <p className="text-sm font-extrabold text-[#1D1D1F]">
            {lang === 'en' ? 'Weekly operations' : 'Haftalık operasyon'}
          </p>
          <div className="mt-4 flex min-h-0 flex-1 items-end gap-2">
            {bars.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-[#0071E3] to-[#6BB5FF]"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] font-bold text-emerald-600">
            {lang === 'en' ? '+12% vs last week' : 'Geçen haftaya +%12'}
          </p>
        </div>
      </GalleryStage>
    )
  }

  if (variant === 'notifications') {
    const items =
      lang === 'en'
        ? [
            { title: 'Reminder sent', meta: '10:15 · Ayşe K.' },
            { title: 'New booking request', meta: 'Elif S. · Today' },
            { title: 'No-show risk', meta: 'Can D. · 14:00' },
            { title: 'Payment noted', meta: 'Clinic desk' },
          ]
        : [
            { title: 'Hatırlatma gönderildi', meta: '10:15 · Ayşe K.' },
            { title: 'Yeni randevu talebi', meta: 'Elif S. · Bugün' },
            { title: 'No-show riski', meta: 'Can D. · 14:00' },
            { title: 'Ödeme notu', meta: 'Klinik masa' },
          ]
    return (
      <GalleryStage className="p-3">
        <div className="flex h-full flex-col rounded-xl border border-white/80 bg-white p-3 shadow-sm" aria-hidden>
          <p className="mb-2 text-xs font-extrabold text-[#1D1D1F]">
            {lang === 'en' ? 'Inbox' : 'Bildirimler'}
          </p>
          <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
            {items.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-[#F8FAFC] px-2.5 py-2.5"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#EEF6FF] text-[#0071E3]">
                  <Bell className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-[#1D1D1F]">{item.title}</p>
                  <p className="truncate text-[10px] text-slate-500">{item.meta}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </GalleryStage>
    )
  }

  // appointments
  const rows =
    lang === 'en'
      ? [
          { t: '09:30', n: 'Ayşe K.', s: 'Done', tone: 'done' as const },
          { t: '10:15', n: 'Mehmet Y.', s: 'In room', tone: 'live' as const },
          { t: '11:00', n: 'Elif S.', s: 'Waiting', tone: 'wait' as const },
          { t: '14:00', n: 'Can D.', s: 'Booked', tone: 'booked' as const },
          { t: '15:30', n: 'Zeynep A.', s: 'Booked', tone: 'booked' as const },
        ]
      : [
          { t: '09:30', n: 'Ayşe K.', s: 'Bitti', tone: 'done' as const },
          { t: '10:15', n: 'Mehmet Y.', s: 'Odada', tone: 'live' as const },
          { t: '11:00', n: 'Elif S.', s: 'Bekliyor', tone: 'wait' as const },
          { t: '14:00', n: 'Can D.', s: 'Planlı', tone: 'booked' as const },
          { t: '15:30', n: 'Zeynep A.', s: 'Planlı', tone: 'booked' as const },
        ]
  return (
    <GalleryStage className="p-3">
      <div className="flex h-full flex-col rounded-xl border border-white/80 bg-white p-3 shadow-sm" aria-hidden>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-extrabold text-[#1D1D1F]">
            {lang === 'en' ? 'Today’s list' : 'Bugünün listesi'}
          </p>
          <span className="rounded-full bg-[#EEF6FF] px-2 py-0.5 text-[10px] font-bold text-[#0071E3]">
            5
          </span>
        </div>
        <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
          {rows.map((r) => (
            <li
              key={r.t}
              className="flex items-center gap-2 rounded-xl bg-slate-50 px-2.5 py-2.5"
            >
              <span className="w-10 text-[11px] font-bold tabular-nums text-[#0071E3]">{r.t}</span>
              <span className="flex-1 truncate text-[11px] font-semibold text-[#1D1D1F]">{r.n}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[9px] font-bold',
                  r.tone === 'done' && 'bg-emerald-50 text-emerald-700',
                  r.tone === 'live' && 'bg-[#EEF6FF] text-[#0071E3]',
                  r.tone === 'wait' && 'bg-amber-50 text-amber-700',
                  r.tone === 'booked' && 'bg-slate-100 text-slate-500',
                )}
              >
                {r.s}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </GalleryStage>
  )
}
